import type { Env } from '../types';
import { readSessionCookie, getCoupleFromSession, requestMagicLink } from '../services/auth';
import { sendEmail, renderMagicLinkEmail, renderCharityDeclinedEmail } from '../services/email';
import { sendSms } from '../services/sms';
import { issueOtp, verifyOtp } from '../services/otp';
import { refundPayment } from '../services/hitpay';
import { encrypt } from '../services/encryption';
import { audit } from '../services/audit';
import { transitionGiftState } from '../services/state';
import { screenEntity } from '../services/sanctions';
import { isValidEmail, isValidMobile, isValidNRIC } from '../lib/validation';
import { generateId } from '../lib/id';
import { nowSeconds } from '../lib/time';

interface CoupleRow {
  id: string;
  wedding_id: string;
  display_name: string;
  role: 'partner1' | 'partner2';
  email: string;
  mobile: string;
  email_verified_at: number | null;
  mobile_verified_at: number | null;
  nric_consented_at: number | null;
  iras_donor_share_pct: number;
}

interface AuthedCtx {
  coupleId: string;
  coupleRow: CoupleRow;
}

async function authed(req: Request, env: Env): Promise<AuthedCtx | null> {
  const tok = readSessionCookie(req);
  const session = await getCoupleFromSession(env, tok);
  if (!session) return null;
  const row = await env.DB.prepare(
    `SELECT id, wedding_id, display_name, role, email, mobile,
            email_verified_at, mobile_verified_at, nric_consented_at, iras_donor_share_pct
     FROM couples WHERE id = ?`
  )
    .bind(session.coupleId)
    .first<CoupleRow>();
  if (!row) return null;
  return { coupleId: row.id, coupleRow: row };
}

export async function getMe(req: Request, env: Env): Promise<Response> {
  const a = await authed(req, env);
  if (!a) return json(401, { error: { code: 'unauthorised' } });

  const wedding = await env.DB.prepare(
    `SELECT id, slug, wedding_date, status, default_split_personal_pct, created_by, created_at, claimed_at, closed_at
     FROM weddings WHERE id = ?`
  )
    .bind(a.coupleRow.wedding_id)
    .first();

  const partners = (
    await env.DB.prepare(
      `SELECT id, display_name, role, email, mobile, email_verified_at, mobile_verified_at,
              (nric_consented_at IS NOT NULL) AS has_nric, iras_donor_share_pct
       FROM couples WHERE wedding_id = ? ORDER BY role`
    )
      .bind(a.coupleRow.wedding_id)
      .all()
  ).results;

  const charities = (
    await env.DB.prepare(
      `SELECT c.id, c.name, c.uen, c.ipc_no, wc.share_pct
       FROM wedding_charities wc
       JOIN charities c ON c.id = wc.charity_id
       WHERE wc.wedding_id = ? AND wc.removed_at IS NULL
       ORDER BY c.name`
    )
      .bind(a.coupleRow.wedding_id)
      .all()
  ).results;

  // Onboarding status helper
  const onboarding = {
    email_verified: !!a.coupleRow.email_verified_at,
    mobile_verified: !!a.coupleRow.mobile_verified_at,
    nric_set: !!a.coupleRow.nric_consented_at,
    charity_selected: charities.length > 0,
  };
  // NRIC is collected later (only to approve a charity release), so it is not
  // part of onboarding completeness — verified mobile + a charity is enough.
  const onboardingComplete =
    onboarding.mobile_verified &&
    onboarding.charity_selected;

  return json(200, {
    me: {
      id: a.coupleRow.id,
      display_name: a.coupleRow.display_name,
      role: a.coupleRow.role,
      email: a.coupleRow.email,
      mobile: a.coupleRow.mobile,
      email_verified_at: a.coupleRow.email_verified_at,
      mobile_verified_at: a.coupleRow.mobile_verified_at,
      nric_consented_at: a.coupleRow.nric_consented_at,
      iras_donor_share_pct: a.coupleRow.iras_donor_share_pct,
    },
    wedding,
    partners,
    charities,
    onboarding,
    onboarding_complete: onboardingComplete,
  });
}

export async function postVerifyMobileRequest(
  req: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const a = await authed(req, env);
  if (!a) return json(401, { error: { code: 'unauthorised' } });
  if (a.coupleRow.mobile_verified_at) {
    return json(200, { ok: true, already_verified: true });
  }
  const { code } = await issueOtp(env, 'mobile_verify', 'couple', a.coupleId);
  ctx.waitUntil(
    sendSms(env, a.coupleRow.mobile, `Your Altru verification code is ${code}. Expires in 10 minutes.`)
  );
  ctx.waitUntil(
    audit(env, {
      actorType: 'couple',
      actorRef: a.coupleId,
      eventType: 'auth.mobile_otp.requested',
      entityType: 'couple',
      entityId: a.coupleId,
    })
  );
  return json(200, { ok: true });
}

export async function postVerifyMobileConfirm(req: Request, env: Env): Promise<Response> {
  const a = await authed(req, env);
  if (!a) return json(401, { error: { code: 'unauthorised' } });

  let body: { otp?: string };
  try {
    body = (await req.json()) as { otp?: string };
  } catch {
    return json(400, { error: { code: 'invalid_json' } });
  }
  const otp = (body.otp ?? '').trim();
  if (!/^\d{6}$/.test(otp)) return json(400, { error: { code: 'invalid_otp_format' } });

  const ok = await verifyOtp(env, 'mobile_verify', 'couple', a.coupleId, otp);
  if (!ok) return json(400, { error: { code: 'invalid_otp', message: 'Invalid or expired code' } });

  await env.DB.prepare(`UPDATE couples SET mobile_verified_at = ? WHERE id = ?`)
    .bind(nowSeconds(), a.coupleId)
    .run();
  await audit(env, {
    actorType: 'couple',
    actorRef: a.coupleId,
    eventType: 'auth.mobile.verified',
    entityType: 'couple',
    entityId: a.coupleId,
  });
  return json(200, { verified: true });
}

export async function postSetNric(req: Request, env: Env): Promise<Response> {
  const a = await authed(req, env);
  if (!a) return json(401, { error: { code: 'unauthorised' } });

  let body: { nric?: string; share_pct?: number };
  try {
    body = (await req.json()) as { nric?: string; share_pct?: number };
  } catch {
    return json(400, { error: { code: 'invalid_json' } });
  }
  const nric = (body.nric ?? '').toUpperCase().trim();
  if (!isValidNRIC(nric)) return json(400, { error: { code: 'invalid_nric', message: 'NRIC failed validation' } });

  const sharePct = body.share_pct ?? 100;
  if (typeof sharePct !== 'number' || sharePct < 0 || sharePct > 100 || !Number.isInteger(sharePct)) {
    return json(400, { error: { code: 'invalid_share_pct' } });
  }

  const ciphertext = await encrypt(env, nric);
  const now = nowSeconds();
  await env.DB.prepare(
    `UPDATE couples SET nric_encrypted = ?, nric_consented_at = ?, iras_donor_share_pct = ? WHERE id = ?`
  )
    .bind(ciphertext, now, sharePct, a.coupleId)
    .run();

  // PDPA: log explicit NRIC consent and third-party share consent.
  // NRIC is collected solely for IRAS tax receipt generation.
  // It will be shared only with the partner IPC charity's finance team.
  const ipAddress = req.headers.get('CF-Connecting-IP') ?? req.headers.get('X-Forwarded-For') ?? '';
  const userAgent = req.headers.get('User-Agent') ?? '';
  await Promise.allSettled([
    env.DB.prepare(
      `INSERT INTO consent_logs (ts, subject_type, subject_ref, purpose, action, channel, ip_address, user_agent)
       VALUES (?, 'couple', ?, 'nric_collection', 'granted', 'web_ui', ?, ?)`
    ).bind(now, a.coupleId, ipAddress, userAgent).run(),
    env.DB.prepare(
      `INSERT INTO consent_logs (ts, subject_type, subject_ref, purpose, action, channel, ip_address, user_agent)
       VALUES (?, 'couple', ?, 'third_party_share', 'granted', 'web_ui', ?, ?)`
    ).bind(now, a.coupleId, ipAddress, userAgent).run(),
  ]);

  await audit(env, {
    actorType: 'couple',
    actorRef: a.coupleId,
    eventType: 'couple.nric.set',
    entityType: 'couple',
    entityId: a.coupleId,
    payload: { share_pct: sharePct, pdpa_consents_logged: ['nric_collection', 'third_party_share'] },
  });
  return json(200, { ok: true });
}

export async function postCharitySelection(req: Request, env: Env): Promise<Response> {
  const a = await authed(req, env);
  if (!a) return json(401, { error: { code: 'unauthorised' } });

  let body: { charity_ids?: string[] };
  try {
    body = (await req.json()) as { charity_ids?: string[] };
  } catch {
    return json(400, { error: { code: 'invalid_json' } });
  }
  const ids = Array.isArray(body.charity_ids) ? body.charity_ids.slice(0, 3) : [];
  if (ids.length === 0) {
    return json(400, { error: { code: 'invalid_selection', message: 'At least one charity required' } });
  }

  const placeholders = ids.map(() => '?').join(',');
  const rows = await env.DB.prepare(
    `SELECT id FROM charities WHERE id IN (${placeholders}) AND status IN ('confirmed','pending')`
  )
    .bind(...ids)
    .all<{ id: string }>();
  const found = new Set(rows.results.map((r) => r.id));
  for (const cid of ids) {
    if (!found.has(cid)) {
      return json(400, { error: { code: 'invalid_charity', message: `Unknown or unavailable charity: ${cid}` } });
    }
  }

  const now = nowSeconds();
  const sharePer = Math.floor(100 / ids.length);
  const stmts: D1PreparedStatement[] = [
    env.DB.prepare(
      `UPDATE wedding_charities SET removed_at = ?
       WHERE wedding_id = ? AND removed_at IS NULL`
    ).bind(now, a.coupleRow.wedding_id),
  ];
  for (const cid of ids) {
    stmts.push(
      env.DB.prepare(
        `INSERT INTO wedding_charities (wedding_id, charity_id, share_pct, added_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(wedding_id, charity_id) DO UPDATE
           SET removed_at = NULL, share_pct = excluded.share_pct, added_at = excluded.added_at`
      ).bind(a.coupleRow.wedding_id, cid, sharePer, now)
    );
  }
  await env.DB.batch(stmts);

  await audit(env, {
    actorType: 'couple',
    actorRef: a.coupleId,
    eventType: 'wedding.charities.updated',
    entityType: 'wedding',
    entityId: a.coupleRow.wedding_id,
    payload: { charity_ids: ids },
  });
  return json(200, { ok: true, charity_ids: ids });
}

export async function postAddPartner(
  req: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const a = await authed(req, env);
  if (!a) return json(401, { error: { code: 'unauthorised' } });
  if (a.coupleRow.role !== 'partner1') {
    return json(403, { error: { code: 'forbidden', message: 'Only the primary contact can add a partner' } });
  }

  const existing = await env.DB.prepare(
    `SELECT id FROM couples WHERE wedding_id = ? AND role = 'partner2'`
  )
    .bind(a.coupleRow.wedding_id)
    .first();
  if (existing) {
    return json(409, { error: { code: 'partner_exists', message: 'A second partner is already registered' } });
  }

  let body: { name?: string; email?: string; mobile?: string };
  try {
    body = (await req.json()) as { name?: string; email?: string; mobile?: string };
  } catch {
    return json(400, { error: { code: 'invalid_json' } });
  }
  const name = (body.name ?? '').trim();
  const email = (body.email ?? '').trim().toLowerCase();
  const mobile = (body.mobile ?? '').trim();
  if (!name) return json(400, { error: { code: 'invalid_name' } });
  if (!isValidEmail(email)) return json(400, { error: { code: 'invalid_email' } });
  if (!isValidMobile(mobile)) return json(400, { error: { code: 'invalid_mobile' } });

  const emailExists = await env.DB.prepare(`SELECT id FROM couples WHERE email = ? LIMIT 1`)
    .bind(email)
    .first();
  if (emailExists) return json(409, { error: { code: 'email_in_use' } });

  const id = generateId();
  const now = nowSeconds();
  await env.DB.prepare(
    `INSERT INTO couples (id, wedding_id, display_name, role, email, mobile, iras_donor_share_pct, created_at)
     VALUES (?, ?, ?, 'partner2', ?, ?, 0, ?)`
  )
    .bind(id, a.coupleRow.wedding_id, name, email, mobile, now)
    .run();

  // Send partner2 a magic link
  const { token } = await requestMagicLink(env, email);
  const magicUrl = `${env.PUBLIC_BASE_URL}/api/auth/magic-link/verify?token=${token}`;
  const tmpl = renderMagicLinkEmail(magicUrl, name);
  ctx.waitUntil(sendEmail(env, { to: email, subject: tmpl.subject, html: tmpl.html, text: tmpl.text }));

  await audit(env, {
    actorType: 'couple',
    actorRef: a.coupleId,
    eventType: 'couple.partner2.added',
    entityType: 'wedding',
    entityId: a.coupleRow.wedding_id,
    payload: { partner2_id: id },
  });
  return json(200, { id, name, email });
}

export async function getCharityList(_req: Request, env: Env): Promise<Response> {
  const rows = (
    await env.DB.prepare(
      `SELECT id, name, uen, ipc_no, brand_kit_url, status
       FROM charities WHERE status IN ('confirmed','pending')
       ORDER BY name`
    ).all()
  ).results;
  return json(200, { charities: rows });
}

// ── GET /api/couple/gifts ─────────────────────────────────────────────────
// All gifts for the couple's wedding. The dashboard groups them client-side
// into actionable (pending + paid), settled, refunded, and failed.
export async function getCoupleGifts(req: Request, env: Env): Promise<Response> {
  const a = await authed(req, env);
  if (!a) return json(401, { error: { code: 'unauthorised' } });

  const rows = (
    await env.DB.prepare(
      `SELECT id, guest_name, guest_email, gift_amount_cents, personal_portion_cents,
              charity_portions_json, state, payment_succeeded_at,
              scheduled_auto_refund_at, message_to_couple, refund_ref, created_at
       FROM gifts WHERE wedding_id = ? ORDER BY created_at DESC`
    )
      .bind(a.coupleRow.wedding_id)
      .all()
  ).results;

  const threshold = parseInt(env.LARGE_GIFT_THRESHOLD_CENTS ?? '50000', 10);
  return json(200, { gifts: rows, large_gift_threshold_cents: threshold });
}

// ── POST /api/couple/gifts/authorise/otp ──────────────────────────────────
// Issues a step-up OTP to the couple's verified mobile, used to confirm
// authorisation of a large gift (>= LARGE_GIFT_THRESHOLD_CENTS).
export async function postAuthoriseOtp(
  req: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const a = await authed(req, env);
  if (!a) return json(401, { error: { code: 'unauthorised' } });
  if (!a.coupleRow.mobile_verified_at) {
    return json(403, { error: { code: 'mobile_not_verified', message: 'Verify your mobile first.' } });
  }

  const { code } = await issueOtp(env, 'authorise_action', 'couple', a.coupleId);
  ctx.waitUntil(
    sendSms(env, a.coupleRow.mobile, `Your Altru authorisation code is ${code}. Expires in 10 minutes.`)
  );
  ctx.waitUntil(
    audit(env, {
      actorType: 'couple',
      actorRef: a.coupleId,
      eventType: 'auth.authorise_otp.requested',
      entityType: 'couple',
      entityId: a.coupleId,
    })
  );
  return json(200, { ok: true });
}

// ── POST /api/couple/gifts/authorise ──────────────────────────────────────
// Couple releases one or more pending gifts. Each gift transitions
// pending → authorised. A step-up OTP is required when any selected gift is
// at or above LARGE_GIFT_THRESHOLD_CENTS.
export async function postAuthoriseGifts(req: Request, env: Env): Promise<Response> {
  const a = await authed(req, env);
  if (!a) return json(401, { error: { code: 'unauthorised' } });
  if (!a.coupleRow.nric_consented_at) {
    return json(403, {
      error: {
        code: 'onboarding_incomplete',
        message: 'Add your NRIC before authorising — the donation receipt is issued in your name.',
      },
    });
  }

  let body: { gift_ids?: string[]; otp?: string };
  try {
    body = (await req.json()) as { gift_ids?: string[]; otp?: string };
  } catch {
    return json(400, { error: { code: 'invalid_json' } });
  }
  const ids = Array.isArray(body.gift_ids)
    ? body.gift_ids.filter((x): x is string => typeof x === 'string')
    : [];
  if (ids.length === 0) {
    return json(400, { error: { code: 'no_gifts', message: 'Select at least one gift.' } });
  }
  if (ids.length > 100) {
    return json(400, { error: { code: 'too_many', message: 'Authorise at most 100 gifts at once.' } });
  }

  const placeholders = ids.map(() => '?').join(',');
  const rows = (
    await env.DB.prepare(
      `SELECT id, state, gift_amount_cents, payment_succeeded_at
       FROM gifts WHERE wedding_id = ? AND id IN (${placeholders})`
    )
      .bind(a.coupleRow.wedding_id, ...ids)
      .all<{ id: string; state: string; gift_amount_cents: number; payment_succeeded_at: number | null }>()
  ).results;
  const byId = new Map(rows.map((r) => [r.id, r]));

  const eligible = rows.filter((r) => r.state === 'pending' && r.payment_succeeded_at);
  if (eligible.length === 0) {
    return json(400, {
      error: { code: 'nothing_to_authorise', message: 'None of the selected gifts can be authorised.' },
    });
  }

  const threshold = parseInt(env.LARGE_GIFT_THRESHOLD_CENTS ?? '50000', 10);
  const needsOtp = eligible.some((r) => r.gift_amount_cents >= threshold);
  if (needsOtp) {
    const otp = (body.otp ?? '').trim();
    if (!otp) {
      return json(403, {
        error: { code: 'otp_required', message: 'A verification code is required to authorise a large gift.' },
      });
    }
    if (!/^\d{6}$/.test(otp)) return json(400, { error: { code: 'invalid_otp_format' } });
    const ok = await verifyOtp(env, 'authorise_action', 'couple', a.coupleId, otp);
    if (!ok) return json(400, { error: { code: 'invalid_otp', message: 'Invalid or expired code.' } });
  }

  const authorised: string[] = [];
  const skipped: { id: string; reason: string }[] = [];
  for (const id of ids) {
    const r = byId.get(id);
    if (!r) {
      skipped.push({ id, reason: 'not_found' });
      continue;
    }
    if (r.state !== 'pending' || !r.payment_succeeded_at) {
      skipped.push({ id, reason: `not_authorisable_${r.state}` });
      continue;
    }
    const t = await transitionGiftState(
      env,
      id,
      'authorised',
      { type: 'couple', ref: a.coupleId },
      { method: 'couple_dashboard', step_up_otp: needsOtp }
    );
    if (t.ok) authorised.push(id);
    else skipped.push({ id, reason: t.reason ?? 'transition_failed' });
  }

  return json(200, { authorised, skipped });
}

// ── POST /api/couple/gifts/decline ────────────────────────────────────────
// Couple declines the charity donation on one or more gifts. The charity
// portion is refunded to the guest; the personal portion still goes to the
// couple (queued by the daily disbursement run). No NRIC or OTP — declining
// returns money rather than releasing it to a new party.
export async function postDeclineGifts(
  req: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const a = await authed(req, env);
  if (!a) return json(401, { error: { code: 'unauthorised' } });

  let body: { gift_ids?: string[] };
  try {
    body = (await req.json()) as { gift_ids?: string[] };
  } catch {
    return json(400, { error: { code: 'invalid_json' } });
  }
  const ids = Array.isArray(body.gift_ids)
    ? body.gift_ids.filter((x): x is string => typeof x === 'string')
    : [];
  if (ids.length === 0) return json(400, { error: { code: 'no_gifts', message: 'Select at least one gift.' } });
  if (ids.length > 100) return json(400, { error: { code: 'too_many', message: 'Decline at most 100 gifts at once.' } });

  const placeholders = ids.map(() => '?').join(',');
  const rows = (
    await env.DB.prepare(
      `SELECT id, state, gift_amount_cents, personal_portion_cents, payment_ref,
              payment_succeeded_at, guest_name, guest_email
       FROM gifts WHERE wedding_id = ? AND id IN (${placeholders})`
    )
      .bind(a.coupleRow.wedding_id, ...ids)
      .all<{
        id: string;
        state: string;
        gift_amount_cents: number;
        personal_portion_cents: number;
        payment_ref: string | null;
        payment_succeeded_at: number | null;
        guest_name: string;
        guest_email: string | null;
      }>()
  ).results;
  const byId = new Map(rows.map((r) => [r.id, r]));

  const declined: string[] = [];
  const skipped: { id: string; reason: string }[] = [];
  for (const id of ids) {
    const r = byId.get(id);
    if (!r) {
      skipped.push({ id, reason: 'not_found' });
      continue;
    }
    if (r.state !== 'pending' || !r.payment_succeeded_at) {
      skipped.push({ id, reason: `not_declinable_${r.state}` });
      continue;
    }
    const charityCents = r.gift_amount_cents - r.personal_portion_cents;
    try {
      if (charityCents > 0 && r.payment_ref) {
        const refund = await refundPayment(env, r.payment_ref, (charityCents / 100).toFixed(2));
        await env.DB.prepare(`UPDATE gifts SET refund_ref = COALESCE(refund_ref, ?) WHERE id = ?`)
          .bind(refund.id, id)
          .run();
      }
    } catch (e) {
      console.error('decline refund failed', e);
      skipped.push({ id, reason: 'refund_failed' });
      continue;
    }
    const t = await transitionGiftState(
      env,
      id,
      'declined',
      { type: 'couple', ref: a.coupleId },
      { method: 'couple_decline', charity_refund_cents: charityCents }
    );
    if (!t.ok) {
      skipped.push({ id, reason: t.reason ?? 'transition_failed' });
      continue;
    }
    declined.push(id);
    if (r.guest_email && charityCents > 0) {
      const tmpl = renderCharityDeclinedEmail({ guestName: r.guest_name, charityRefundCents: charityCents });
      ctx.waitUntil(
        sendEmail(env, { to: r.guest_email, subject: tmpl.subject, html: tmpl.html, text: tmpl.text }).catch(() => {})
      );
    }
  }

  return json(200, { declined, skipped });
}

// ── GET /api/couple/audit ─────────────────────────────────────────────────
// Recent audit-log entries for the couple's wedding and its gifts.
export async function getCoupleAudit(req: Request, env: Env): Promise<Response> {
  const a = await authed(req, env);
  if (!a) return json(401, { error: { code: 'unauthorised' } });

  const giftIds = (
    await env.DB.prepare(`SELECT id FROM gifts WHERE wedding_id = ?`)
      .bind(a.coupleRow.wedding_id)
      .all<{ id: string }>()
  ).results.map((r) => r.id);

  let events;
  if (giftIds.length > 0) {
    const ph = giftIds.map(() => '?').join(',');
    events = await env.DB.prepare(
      `SELECT ts, actor_type, event_type, entity_type, entity_id, payload_json
       FROM audit_log
       WHERE (entity_type = 'wedding' AND entity_id = ?)
          OR (entity_type = 'gift' AND entity_id IN (${ph}))
       ORDER BY ts DESC LIMIT 60`
    )
      .bind(a.coupleRow.wedding_id, ...giftIds)
      .all();
  } else {
    events = await env.DB.prepare(
      `SELECT ts, actor_type, event_type, entity_type, entity_id, payload_json
       FROM audit_log
       WHERE entity_type = 'wedding' AND entity_id = ?
       ORDER BY ts DESC LIMIT 60`
    )
      .bind(a.coupleRow.wedding_id)
      .all();
  }

  return json(200, { events: events.results });
}

// ── POST /api/couple/claim ────────────────────────────────────────────────
// Path B: the couple claims a wedding a guest set up on their behalf. Once
// onboarding is complete the wedding becomes active and every held gift
// (pending_claim) is released into the normal 14-day authorisation flow.
export async function postClaimWedding(req: Request, env: Env): Promise<Response> {
  const a = await authed(req, env);
  if (!a) return json(401, { error: { code: 'unauthorised' } });

  const wedding = await env.DB.prepare(`SELECT id, status FROM weddings WHERE id = ?`)
    .bind(a.coupleRow.wedding_id)
    .first<{ id: string; status: string }>();
  if (!wedding) return json(404, { error: { code: 'wedding_not_found' } });
  if (wedding.status === 'active') {
    return json(200, { already_claimed: true, gifts_activated: 0 });
  }
  if (wedding.status !== 'pending_couple_claim') {
    return json(400, { error: { code: 'not_claimable', message: `Wedding is ${wedding.status}.` } });
  }

  // Onboarding gate — verified mobile + a charity chosen. NRIC is not needed
  // to claim; it is required later only when approving a charity release.
  if (!a.coupleRow.mobile_verified_at) {
    return json(403, {
      error: { code: 'onboarding_incomplete', message: 'Verify your mobile before claiming.' },
    });
  }
  const charityCount = await env.DB.prepare(
    `SELECT COUNT(*) AS c FROM wedding_charities WHERE wedding_id = ? AND removed_at IS NULL`
  )
    .bind(wedding.id)
    .first<{ c: number }>();
  if ((charityCount?.c ?? 0) === 0) {
    return json(403, {
      error: { code: 'onboarding_incomplete', message: 'Select at least one charity before claiming.' },
    });
  }

  // Sanctions re-check at the point of activation.
  const sanctions = await screenEntity(env, 'couple', a.coupleId, a.coupleRow.display_name);
  if (sanctions.result !== 'pass') {
    await env.DB.prepare(`UPDATE weddings SET status = 'disputed' WHERE id = ?`)
      .bind(wedding.id)
      .run();
    await audit(env, {
      actorType: 'system',
      eventType: 'wedding.claim.sanctions_review',
      entityType: 'wedding',
      entityId: wedding.id,
      payload: { matches: sanctions.matches, list_version: sanctions.listVersion },
    });
    return json(403, {
      error: { code: 'under_review', message: 'Your claim needs a manual review. Our team will be in touch.' },
    });
  }

  const now = nowSeconds();
  await env.DB.prepare(`UPDATE weddings SET status = 'active', claimed_at = ? WHERE id = ?`)
    .bind(now, wedding.id)
    .run();

  const held = (
    await env.DB.prepare(
      `SELECT id, payment_succeeded_at FROM gifts WHERE wedding_id = ? AND state = 'pending_claim'`
    )
      .bind(wedding.id)
      .all<{ id: string; payment_succeeded_at: number | null }>()
  ).results;

  let activated = 0;
  for (const g of held) {
    const t = await transitionGiftState(
      env,
      g.id,
      'pending',
      { type: 'couple', ref: a.coupleId },
      { method: 'wedding_claim' }
    );
    if (!t.ok) continue;
    activated++;
    // A paid gift's 14-day authorisation clock starts at the claim moment.
    if (g.payment_succeeded_at) {
      await env.DB.prepare(`UPDATE gifts SET scheduled_auto_refund_at = ? WHERE id = ?`)
        .bind(now + 14 * 86400, g.id)
        .run();
    }
  }

  await audit(env, {
    actorType: 'couple',
    actorRef: a.coupleId,
    eventType: 'wedding.claimed',
    entityType: 'wedding',
    entityId: wedding.id,
    payload: { gifts_activated: activated },
  });

  return json(200, { claimed: true, gifts_activated: activated });
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

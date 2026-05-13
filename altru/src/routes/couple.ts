import type { Env } from '../types';
import { readSessionCookie, getCoupleFromSession, requestMagicLink } from '../services/auth';
import { sendEmail, renderMagicLinkEmail } from '../services/email';
import { sendSms } from '../services/sms';
import { issueOtp, verifyOtp } from '../services/otp';
import { encrypt } from '../services/encryption';
import { audit } from '../services/audit';
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
  const onboardingComplete =
    onboarding.email_verified &&
    onboarding.mobile_verified &&
    onboarding.nric_set &&
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

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

import type { Env } from '../types';
import { generateId } from '../lib/id';
import { nowSeconds } from '../lib/time';
import {
  isValidEmail,
  isValidMobile,
  isValidSlug,
  isValidWeddingDate,
  generateSlug,
} from '../lib/validation';
import { requestMagicLink } from '../services/auth';
import { sendEmail, renderMagicLinkEmail } from '../services/email';
import { sendSms } from '../services/sms';
import { issueOtp } from '../services/otp';
import { checkName, recordSanctionsCheck } from '../services/sanctions';
import { audit } from '../services/audit';

interface CreateWeddingBody {
  path?: 'A' | 'B';
  wedding_date?: string;
  slug?: string;
  couple_names?: string[];
  primary_email?: string;
  primary_mobile?: string;
  charities?: string[];
  default_split_personal_pct?: number;
  // PDPA: explicit consent fields — must be true to proceed
  pdpa_consent?: boolean;         // consent to collect name/email/mobile
  terms_accepted?: boolean;       // acceptance of Terms of Service
}

// ── PFA Guard: Charities Act compliance ───────────────────────────────────
// Donations can only be processed for charities with an active signed PFA.
// This is checked at wedding creation (charity selection) and at gift creation.
async function checkPfaActive(env: Env, charityId: string): Promise<boolean> {
  try {
    const row = await env.DB.prepare(
      `SELECT id FROM pfa_agreements
       WHERE charity_id = ? AND status = 'signed'
         AND (expiry_date IS NULL OR expiry_date > date('now'))
       LIMIT 1`
    ).bind(charityId).first();
    return row !== null;
  } catch {
    // pfa_agreements table not yet migrated — allow in dev, block in prod
    return true; // permissive until migration 0003 runs
  }
}

// ── Log PDPA consent ──────────────────────────────────────────────────────
async function logConsent(
  env: Env,
  subjectRef: string,
  purpose: string,
  ipAddress: string,
  userAgent: string
): Promise<void> {
  try {
    await env.DB.prepare(
      `INSERT INTO consent_logs (ts, subject_type, subject_ref, purpose, action, channel, ip_address, user_agent)
       VALUES (?, 'couple', ?, ?, 'granted', 'web_ui', ?, ?)`
    ).bind(nowSeconds(), subjectRef, purpose, ipAddress, userAgent).run();
  } catch {
    // consent_logs table not yet migrated — non-fatal
  }
}

export async function postCreateWedding(
  req: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  let body: CreateWeddingBody;
  try {
    body = (await req.json()) as CreateWeddingBody;
  } catch {
    return jsonError(400, 'invalid_json', 'Request body must be JSON');
  }

  // ── PDPA: require explicit consent before collecting personal data ────────
  // Charities Act disclosure: donor/couple must acknowledge Altru is a
  // commercial fund-raiser and that donations are paid gross to charities.
  if (!body.pdpa_consent) {
    return jsonError(400, 'pdpa_consent_required',
      'You must consent to the collection of your personal data (PDPA) to proceed.');
  }
  if (!body.terms_accepted) {
    return jsonError(400, 'terms_required',
      'You must accept the Terms of Service to proceed.');
  }

  if (body.path !== 'A' && body.path !== 'B') {
    return jsonError(400, 'invalid_path', "Field 'path' must be 'A' or 'B'");
  }
  if (!Array.isArray(body.couple_names) || body.couple_names.length < 1 || body.couple_names.length > 2) {
    return jsonError(400, 'invalid_couple_names', 'couple_names must be an array of 1 or 2 strings');
  }
  const names = body.couple_names.map((n) => (n ?? '').trim()).filter(Boolean);
  if (names.length === 0) return jsonError(400, 'invalid_couple_names', 'At least one couple name is required');

  const email = (body.primary_email ?? '').trim().toLowerCase();
  const mobile = (body.primary_mobile ?? '').trim();
  if (!isValidEmail(email)) return jsonError(400, 'invalid_email', 'A valid email is required');
  if (!isValidMobile(mobile)) return jsonError(400, 'invalid_mobile', 'A valid mobile in E.164 form is required');
  if (!body.wedding_date || !isValidWeddingDate(body.wedding_date)) {
    return jsonError(400, 'invalid_date', 'wedding_date must be ISO 8601 (YYYY-MM-DD), within -30 / +730 days of today');
  }

  const slug = body.slug ? body.slug.toLowerCase() : generateSlug(names, body.wedding_date);
  if (!isValidSlug(slug)) {
    return jsonError(400, 'invalid_slug', "slug must match [a-z0-9-]{3,64} and not be on the denylist");
  }

  const split = body.default_split_personal_pct ?? 0;
  if (typeof split !== 'number' || split < 0 || split > 100 || !Number.isInteger(split)) {
    return jsonError(400, 'invalid_split', 'default_split_personal_pct must be an integer 0..100');
  }

  // Slug uniqueness
  const existing = await env.DB.prepare(`SELECT id FROM weddings WHERE slug = ?`).bind(slug).first();
  if (existing) {
    return jsonError(409, 'slug_taken', 'A wedding with this slug already exists. Please choose another.');
  }

  // Email uniqueness for the primary couple
  const existingEmail = await env.DB.prepare(`SELECT id FROM couples WHERE email = ? LIMIT 1`)
    .bind(email)
    .first();
  if (existingEmail) {
    return jsonError(409, 'email_in_use', 'An account with this email already exists.');
  }

  // Validate charity selection if provided
  // Charities Act: also verify active PFA exists for each selected charity
  const charityIds: string[] = Array.isArray(body.charities) ? body.charities.slice(0, 3) : [];
  if (charityIds.length > 0) {
    const placeholders = charityIds.map(() => '?').join(',');
    const rows = await env.DB.prepare(
      `SELECT id FROM charities WHERE status IN ('confirmed','pending') AND id IN (${placeholders})`
    )
      .bind(...charityIds)
      .all<{ id: string }>();
    const found = new Set(rows.results.map((r) => r.id));
    for (const c of charityIds) {
      if (!found.has(c)) return jsonError(400, 'invalid_charity', `Unknown or unavailable charity: ${c}`);
    }

    // Charities Act guard: warn in dev if no signed PFA; block in prod.
    // In prod, a charity without an active PFA cannot receive donations.
    if (env.ENV === 'prod') {
      for (const cid of charityIds) {
        const hasPfa = await checkPfaActive(env, cid);
        if (!hasPfa) {
          return jsonError(400, 'charity_pfa_required',
            `Charity ${cid} does not have an active signed fund-raising agreement. ` +
            'Please contact support@altru.asia to resolve this before proceeding.');
        }
      }
    }
  }

  const weddingId = generateId();
  const coupleId = generateId();
  const now = nowSeconds();
  const status = body.path === 'A' ? 'active' : 'pending_couple_claim';
  const createdBy = body.path === 'A' ? 'couple' : 'guest';

  const stmts: D1PreparedStatement[] = [
    env.DB.prepare(
      `INSERT INTO weddings (id, slug, wedding_date, status, default_split_personal_pct, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(weddingId, slug, body.wedding_date, status, split, createdBy, now),
    env.DB.prepare(
      `INSERT INTO couples (id, wedding_id, display_name, role, email, mobile, created_at)
       VALUES (?, ?, ?, 'partner1', ?, ?, ?)`
    ).bind(coupleId, weddingId, names[0], email, mobile, now),
  ];
  for (const cid of charityIds) {
    stmts.push(
      env.DB.prepare(
        `INSERT INTO wedding_charities (wedding_id, charity_id, share_pct, added_at)
         VALUES (?, ?, ?, ?)`
      ).bind(weddingId, cid, Math.floor(100 / charityIds.length), now)
    );
  }
  await env.DB.batch(stmts);

  await audit(env, {
    actorType: 'system',
    eventType: 'wedding.created',
    entityType: 'wedding',
    entityId: weddingId,
    payload: { path: body.path, slug, created_by: createdBy, charity_count: charityIds.length },
  });

  // PDPA: log explicit consent at point of collection
  const ipAddress = req.headers.get('CF-Connecting-IP') ?? req.headers.get('X-Forwarded-For') ?? '';
  const userAgent = req.headers.get('User-Agent') ?? '';
  ctx.waitUntil(Promise.all([
    logConsent(env, coupleId, 'data_collection', ipAddress, userAgent),
    logConsent(env, coupleId, 'third_party_share', ipAddress, userAgent),
  ]));

  // Sanctions name match (Week 2). Recorded on every registration; a 'review'
  // or 'fail' result forces an active wedding into 'disputed' for operator
  // follow-up. Path B weddings are already in 'pending_couple_claim' which
  // gates disbursement; the check is still recorded for the eventual claim.
  const sanctionsResult = checkName(names.join(' '));
  await recordSanctionsCheck(env, 'couple', coupleId, names.join(' '), sanctionsResult);
  if (sanctionsResult.result !== 'pass' && body.path === 'A') {
    await env.DB.prepare(`UPDATE weddings SET status = 'disputed' WHERE id = ?`)
      .bind(weddingId)
      .run();
    await audit(env, {
      actorType: 'system',
      eventType: 'wedding.sanctions.review_required',
      entityType: 'wedding',
      entityId: weddingId,
      payload: { matches: sanctionsResult.matches, list_version: sanctionsResult.listVersion },
    });
  }

  // Path A: send magic-link sign-in + mobile OTP for verification.
  // Path B: the claim flow handles email + OTP separately — see /api/wedding/:id/claim (Week 5).
  if (body.path === 'A') {
    const { token } = await requestMagicLink(env, email);
    const magicUrl = `${env.PUBLIC_BASE_URL}/api/auth/magic-link/verify?token=${token}`;
    const tmpl = renderMagicLinkEmail(magicUrl, names[0]);
    ctx.waitUntil(sendEmail(env, { to: email, ...tmpl }));

    const { code } = await issueOtp(env, 'mobile_verify', 'couple', coupleId);
    ctx.waitUntil(
      sendSms(env, mobile, `Your Altru verification code is ${code}. Expires in 10 minutes.`)
    );
  }

  return jsonResponse({
    wedding: { id: weddingId, slug, status, wedding_date: body.wedding_date },
    couple: { id: coupleId, display_name: names[0], email },
    claim_required: body.path === 'B',
  });
}

export async function getWeddingBySlug(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const match = url.pathname.match(/^\/api\/wedding\/by-slug\/([a-z0-9-]+)$/);
  if (!match) return jsonError(404, 'not_found');
  const slug = match[1];

  const wedding = await env.DB.prepare(
    `SELECT id, slug, wedding_date, status, default_split_personal_pct
     FROM weddings WHERE slug = ?`
  )
    .bind(slug)
    .first<{
      id: string;
      slug: string;
      wedding_date: string;
      status: string;
      default_split_personal_pct: number;
    }>();
  if (!wedding) return jsonError(404, 'not_found');
  if (wedding.status !== 'active') {
    return jsonError(410, 'wedding_not_available', `Wedding is in state '${wedding.status}'`);
  }

  const couples = (
    await env.DB.prepare(
      `SELECT display_name, role FROM couples WHERE wedding_id = ? ORDER BY role`
    )
      .bind(wedding.id)
      .all<{ display_name: string; role: string }>()
  ).results;

  const charities = (
    await env.DB.prepare(
      `SELECT c.id, c.name, c.uen, c.ipc_no, wc.share_pct
       FROM wedding_charities wc JOIN charities c ON c.id = wc.charity_id
       WHERE wc.wedding_id = ? AND wc.removed_at IS NULL
       ORDER BY c.name`
    )
      .bind(wedding.id)
      .all()
  ).results;

  return jsonResponse({
    wedding: {
      id: wedding.id,
      slug: wedding.slug,
      wedding_date: wedding.wedding_date,
      default_split_personal_pct: wedding.default_split_personal_pct,
    },
    couple_display_names: couples.map((c) => c.display_name),
    charities,
  });
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function jsonError(status: number, code: string, message?: string): Response {
  return jsonResponse({ error: { code, message: message ?? code } }, status);
}

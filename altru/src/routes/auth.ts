import type { Env } from '../types';
import { requestMagicLink, verifyMagicLink, createSession, sessionCookieHeader } from '../services/auth';
import { sendEmail, renderMagicLinkEmail } from '../services/email';
import { audit } from '../services/audit';
import { nowSeconds } from '../lib/time';
import { isValidEmail } from '../lib/validation';

export async function postMagicLinkRequest(
  req: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError(400, 'invalid_json', 'Request body must be JSON');
  }
  const email = (body.email ?? '').trim().toLowerCase();
  if (!isValidEmail(email)) return jsonError(400, 'invalid_email', 'A valid email is required');

  const couple = await env.DB.prepare(
    `SELECT id, display_name FROM couples WHERE email = ? LIMIT 1`
  )
    .bind(email)
    .first<{ id: string; display_name: string }>();

  // Always return ok to avoid email-enumeration. Only actually send if a couple exists.
  if (couple) {
    const { token } = await requestMagicLink(env, email);
    const magicUrl = `${env.PUBLIC_BASE_URL}/api/auth/magic-link/verify?token=${token}`;
    const tmpl = renderMagicLinkEmail(magicUrl, couple.display_name);
    ctx.waitUntil(sendEmail(env, { to: email, ...tmpl }));
    ctx.waitUntil(
      audit(env, {
        actorType: 'couple',
        actorRef: couple.id,
        eventType: 'auth.magic_link.requested',
        entityType: 'couple',
        entityId: couple.id,
      })
    );
  }

  return jsonResponse({ ok: true });
}

export async function getMagicLinkVerify(
  req: Request,
  env: Env,
  _ctx: ExecutionContext
): Promise<Response> {
  const url = new URL(req.url);
  const token = url.searchParams.get('token') ?? '';
  if (!token) return htmlError('Missing sign-in token.');

  const result = await verifyMagicLink(env, token);
  if (!result) return htmlError('This sign-in link is no longer valid. Please request a new one.');

  const couple = await env.DB.prepare(
    `SELECT id, wedding_id FROM couples WHERE email = ? LIMIT 1`
  )
    .bind(result.email)
    .first<{ id: string; wedding_id: string }>();
  if (!couple) return htmlError('No account was found for this email.');

  // Mark email_verified_at if not already
  await env.DB.prepare(
    `UPDATE couples SET email_verified_at = COALESCE(email_verified_at, ?) WHERE id = ?`
  )
    .bind(nowSeconds(), couple.id)
    .run();

  const ua = req.headers.get('User-Agent') ?? '';
  const ip = req.headers.get('CF-Connecting-IP') ?? '';
  const session = await createSession(env, couple.id, ua, ip);

  await audit(env, {
    actorType: 'couple',
    actorRef: couple.id,
    eventType: 'auth.session.created',
    entityType: 'couple',
    entityId: couple.id,
    payload: { method: 'magic_link' },
  });

  // Decide redirect: incomplete onboarding → /onboard.html, else /dashboard.html.
  const profile = await env.DB.prepare(
    `SELECT mobile_verified_at, nric_consented_at FROM couples WHERE id = ?`
  )
    .bind(couple.id)
    .first<{ mobile_verified_at: number | null; nric_consented_at: number | null }>();
  const charityCount = await env.DB.prepare(
    `SELECT COUNT(*) AS c FROM wedding_charities WHERE wedding_id = ? AND removed_at IS NULL`
  )
    .bind(couple.wedding_id)
    .first<{ c: number }>();
  // NRIC is no longer part of onboarding — it is collected later, only when
  // the couple approves a charity release. Onboarding = verified + a charity.
  const onboardingComplete =
    !!profile?.mobile_verified_at &&
    (charityCount?.c ?? 0) > 0;
  const location = onboardingComplete ? '/dashboard.html' : '/onboard.html';

  const isProd = env.ENV === 'prod';
  return new Response(null, {
    status: 302,
    headers: {
      Location: location,
      'Set-Cookie': sessionCookieHeader(session.token, isProd),
    },
  });
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function jsonError(status: number, code: string, message: string): Response {
  return jsonResponse({ error: { code, message } }, status);
}

function htmlError(message: string): Response {
  const html =
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Altru — sign-in</title>` +
    `<style>body{font-family:system-ui,sans-serif;max-width:520px;margin:3rem auto;padding:0 1.5rem;color:#2D1010;line-height:1.6;}a{color:#C8102E;}</style></head>` +
    `<body><h1 style="font-family:'Playfair Display',serif;color:#C8102E;">Sign-in problem</h1>` +
    `<p>${escapeHtml(message)}</p>` +
    `<p><a href="/dashboard.html">Return to the wedding dashboard</a> to request a new sign-in link.</p>` +
    `</body></html>`;
  return new Response(html, { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

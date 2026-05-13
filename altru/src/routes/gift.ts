import type { Env } from '../types';
import { generateId } from '../lib/id';
import { nowSeconds } from '../lib/time';
import { isValidEmail, isValidMobile } from '../lib/validation';
import { hmacSha256Hex } from '../lib/hmac';
import { constantTimeEqual } from '../lib/sha256';
import { createPaymentRequest, refundPayment } from '../services/hitpay';
import { transitionGiftState } from '../services/state';
import { audit } from '../services/audit';

interface CharityPortionIn {
  charity_id: string;
  amount_cents: number;
}

interface CreateGiftBody {
  wedding_id?: string;
  guest_name?: string;
  guest_mobile?: string;
  guest_email?: string;
  gift_amount_cents?: number;
  personal_portion_cents?: number;
  charity_portions?: CharityPortionIn[];
  message?: string;
}

const MIN_GIFT_CENTS = 1000;            // S$10
const MAX_GIFT_CENTS = 5_000_000;       // S$50,000
const INITIAL_AUTO_REFUND_BUFFER_SECONDS = 14 * 86400 + 6 * 3600;
// Initial scheduled_auto_refund_at — overwritten by webhook to
// payment_succeeded_at + 14d once the payment lands. The buffer here is a
// safety net so the row has a sane value during the brief window before the
// webhook arrives.

export async function postCreateGift(
  req: Request,
  env: Env,
  _ctx: ExecutionContext
): Promise<Response> {
  let body: CreateGiftBody;
  try {
    body = (await req.json()) as CreateGiftBody;
  } catch {
    return jsonError(400, 'invalid_json', 'Body must be JSON');
  }

  const weddingId = (body.wedding_id ?? '').trim();
  const name = (body.guest_name ?? '').trim();
  const mobile = (body.guest_mobile ?? '').trim();
  const email = body.guest_email ? body.guest_email.trim().toLowerCase() : null;
  if (!weddingId) return jsonError(400, 'invalid_wedding_id', 'wedding_id is required');
  if (!name) return jsonError(400, 'invalid_name', 'guest_name is required');
  if (!isValidMobile(mobile)) return jsonError(400, 'invalid_mobile', 'Valid mobile in E.164 form is required');
  if (email && !isValidEmail(email)) return jsonError(400, 'invalid_email', 'Email looks invalid');

  const total = body.gift_amount_cents ?? 0;
  const personal = body.personal_portion_cents ?? 0;
  const portions: CharityPortionIn[] = Array.isArray(body.charity_portions) ? body.charity_portions : [];

  if (!Number.isInteger(total) || total < MIN_GIFT_CENTS || total > MAX_GIFT_CENTS) {
    return jsonError(400, 'invalid_amount', `Gift must be ${MIN_GIFT_CENTS}–${MAX_GIFT_CENTS} cents`);
  }
  if (!Number.isInteger(personal) || personal < 0 || personal > total) {
    return jsonError(400, 'invalid_personal_portion');
  }

  let charitySum = 0;
  for (const p of portions) {
    if (!p.charity_id || typeof p.charity_id !== 'string') return jsonError(400, 'invalid_charity_id');
    if (!Number.isInteger(p.amount_cents) || p.amount_cents <= 0) return jsonError(400, 'invalid_charity_amount');
    charitySum += p.amount_cents;
  }
  if (personal + charitySum !== total) {
    return jsonError(400, 'amount_mismatch', `personal + charity portions (${personal + charitySum}) must equal total (${total})`);
  }
  if (charitySum === 0 && personal === 0) {
    return jsonError(400, 'empty_gift');
  }

  // Validate wedding is accepting gifts (Path A only this week)
  const wedding = await env.DB.prepare(
    `SELECT id, slug, status FROM weddings WHERE id = ?`
  )
    .bind(weddingId)
    .first<{ id: string; slug: string; status: string }>();
  if (!wedding) return jsonError(404, 'wedding_not_found');
  if (wedding.status !== 'active') {
    return jsonError(400, 'wedding_not_accepting_gifts', `Wedding status is ${wedding.status}`);
  }

  // Validate every charity portion targets a charity selected for this wedding
  if (portions.length > 0) {
    const ids = portions.map((p) => p.charity_id);
    const placeholders = ids.map(() => '?').join(',');
    const rows = await env.DB.prepare(
      `SELECT charity_id FROM wedding_charities
       WHERE wedding_id = ? AND removed_at IS NULL AND charity_id IN (${placeholders})`
    )
      .bind(wedding.id, ...ids)
      .all<{ charity_id: string }>();
    const found = new Set(rows.results.map((r) => r.charity_id));
    for (const cid of ids) {
      if (!found.has(cid)) return jsonError(400, 'charity_not_in_wedding', `Charity not selected for this wedding: ${cid}`);
    }
  } else if (personal !== total) {
    // No charity portions and non-zero charity sum (impossible given checks above, but defensive)
    return jsonError(400, 'no_charity_selected');
  }

  // Insert gift row in 'pending' (Path A). Path B's pending_claim ships in Week 5.
  const giftId = generateId();
  const now = nowSeconds();
  await env.DB.prepare(
    `INSERT INTO gifts
     (id, wedding_id, guest_name, guest_mobile, guest_email, gift_amount_cents,
      personal_portion_cents, charity_portions_json, state, state_changed_at,
      scheduled_auto_refund_at, message_to_couple, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)`
  )
    .bind(
      giftId,
      wedding.id,
      name,
      mobile,
      email,
      total,
      personal,
      JSON.stringify(portions),
      now,
      now + INITIAL_AUTO_REFUND_BUFFER_SECONDS,
      body.message ?? null,
      now
    )
    .run();

  // Create the HitPay payment-request
  let payment;
  try {
    payment = await createPaymentRequest(env, {
      amount: (total / 100).toFixed(2),
      currency: 'SGD',
      email: email ?? undefined,
      name,
      purpose: `Altru gift · ${wedding.slug}`,
      reference_number: giftId,
      redirect_url: `${env.PUBLIC_BASE_URL}/thanks.html?g=${giftId}`,
      webhook: `${env.PUBLIC_BASE_URL}/api/hitpay/webhook`,
      payment_methods: ['paynow_online', 'card'],
    });
  } catch (err) {
    // Roll back: mark gift failed so the row doesn't sit in 'pending' forever
    console.error('HitPay create failed', err);
    await env.DB.prepare(
      `UPDATE gifts SET state = 'failed', state_changed_at = ? WHERE id = ?`
    )
      .bind(nowSeconds(), giftId)
      .run();
    await audit(env, {
      actorType: 'system',
      eventType: 'gift.failed',
      entityType: 'gift',
      entityId: giftId,
      payload: { reason: 'hitpay_create_failed' },
    });
    return jsonError(502, 'payment_provider_error', 'Could not initialise payment. Please try again.');
  }

  await env.DB.prepare(`UPDATE gifts SET payment_ref = ? WHERE id = ?`)
    .bind(payment.id, giftId)
    .run();

  await audit(env, {
    actorType: 'guest',
    actorRef: mobile,
    eventType: 'gift.created',
    entityType: 'gift',
    entityId: giftId,
    payload: {
      wedding_id: wedding.id,
      total_cents: total,
      personal_cents: personal,
      charity_count: portions.length,
      payment_ref: payment.id,
    },
  });

  return jsonResponse({ gift_id: giftId, hitpay_payment_url: payment.url });
}

export async function getGiftPublic(
  req: Request,
  env: Env,
  _ctx: ExecutionContext
): Promise<Response> {
  const url = new URL(req.url);
  const match = url.pathname.match(/^\/api\/gift\/([^/]+)$/);
  if (!match) return jsonError(404, 'not_found');
  const giftId = match[1];
  const gift = await env.DB.prepare(
    `SELECT g.id, g.state, g.gift_amount_cents, g.personal_portion_cents,
            g.charity_portions_json, g.payment_succeeded_at,
            g.scheduled_auto_refund_at, g.guest_name, w.slug AS wedding_slug
     FROM gifts g JOIN weddings w ON w.id = g.wedding_id
     WHERE g.id = ?`
  )
    .bind(giftId)
    .first();
  if (!gift) return jsonError(404, 'not_found');
  return jsonResponse({ gift });
}

export async function getRefundLink(
  req: Request,
  env: Env,
  _ctx: ExecutionContext
): Promise<Response> {
  const url = new URL(req.url);
  const match = url.pathname.match(/^\/api\/gift\/([^/]+)\/refund-link\/([a-f0-9]+)$/);
  if (!match) return htmlError('Invalid refund link.');
  const giftId = match[1];
  const token = match[2];

  const expected = await hmacSha256Hex(env.SESSION_HMAC_SECRET, `refund:${giftId}`);
  if (!constantTimeEqual(expected, token)) return htmlError('This refund link is invalid.');

  const gift = await env.DB.prepare(
    `SELECT id, state, payment_ref, scheduled_auto_refund_at, payment_succeeded_at
     FROM gifts WHERE id = ?`
  )
    .bind(giftId)
    .first<{
      id: string;
      state: string;
      payment_ref: string | null;
      scheduled_auto_refund_at: number;
      payment_succeeded_at: number | null;
    }>();
  if (!gift) return htmlError('Gift not found.');

  if (gift.state !== 'pending' && gift.state !== 'pending_claim') {
    return htmlSuccess(`This gift is in state '${gift.state}' — nothing to refund.`);
  }
  if (!gift.payment_succeeded_at || !gift.payment_ref) {
    return htmlError('This gift has not yet been confirmed by the payment processor.');
  }
  const now = nowSeconds();
  if (now >= gift.scheduled_auto_refund_at) {
    return htmlError('The 14-day refund window has closed.');
  }

  try {
    const refund = await refundPayment(env, gift.payment_ref);
    await env.DB.prepare(`UPDATE gifts SET refund_ref = ? WHERE id = ?`)
      .bind(refund.id, giftId)
      .run();
    const t = await transitionGiftState(
      env,
      giftId,
      'refunded',
      { type: 'guest' },
      { method: 'donor_refund_link', hitpay_refund_id: refund.id }
    );
    if (!t.ok) return htmlError('Could not record refund state.');
    return htmlSuccess('Your gift has been refunded. The funds will return to your account within 1–3 business days.');
  } catch (err) {
    console.error('Refund failed', err);
    return htmlError('We could not process your refund automatically. Please email support@altru.asia and we will sort it out by hand.');
  }
}

// ─── helpers ─────────────────────────────────────────

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
function jsonError(status: number, code: string, message?: string): Response {
  return jsonResponse({ error: { code, message: message ?? code } }, status);
}
function htmlPage(title: string, message: string, kind: 'ok' | 'err'): Response {
  const colour = kind === 'ok' ? '#27ae60' : '#C8102E';
  const html =
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width, initial-scale=1.0">` +
    `<title>${escapeHtml(title)} — Altru</title>` +
    `<style>body{font-family:system-ui,sans-serif;max-width:520px;margin:3rem auto;padding:0 1.5rem;color:#2D1010;line-height:1.6;}a{color:#C8102E;}h1{font-family:'Playfair Display',serif;color:${colour};}</style>` +
    `</head><body><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p>` +
    `<p><a href="/">Return home</a></p></body></html>`;
  return new Response(html, { status: kind === 'ok' ? 200 : 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
function htmlSuccess(message: string): Response { return htmlPage('Refund processed', message, 'ok'); }
function htmlError(message: string): Response   { return htmlPage('Refund problem',   message, 'err'); }
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

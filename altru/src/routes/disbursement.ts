import type { Env } from '../types';
import { nowSeconds } from '../lib/time';
import { hmacSha256Hex } from '../lib/hmac';
import { constantTimeEqual } from '../lib/sha256';
import { audit } from '../services/audit';

// ── Disbursement / invoice routes ─────────────────────────────────────────
//
// Public (HMAC-token gated):
//   GET  /api/charity/portal?c=<id>&t=<token>  — charity statement portal
//
// Operator (Cloudflare Access protects /api/admin/*):
//   GET  /api/admin/disbursements                   — list disbursements
//   POST /api/admin/disbursements/:id/sent          — mark a payout sent
//   POST /api/admin/disbursements/:id/confirmed     — mark a payout confirmed
//   GET  /api/admin/invoices                        — list invoices

// ── GET /api/charity/portal ───────────────────────────────────────────────
// Read-only charity statement. The token is a stable HMAC of the charity id,
// delivered in the monthly invoice email — no charity login system needed.
export async function getCharityPortal(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const charityId = url.searchParams.get('c') ?? '';
  const token = url.searchParams.get('t') ?? '';
  if (!charityId || !token) return json(400, { error: { code: 'missing_params' } });

  const expected = await hmacSha256Hex(env.SESSION_HMAC_SECRET, `charity-portal:${charityId}`);
  if (!constantTimeEqual(expected, token)) {
    return json(403, { error: { code: 'invalid_token', message: 'This statement link is not valid.' } });
  }

  const charity = await env.DB.prepare(
    `SELECT id, name, uen, ipc_no, status FROM charities WHERE id = ?`
  )
    .bind(charityId)
    .first();
  if (!charity) return json(404, { error: { code: 'not_found' } });

  const disbursements = (
    await env.DB.prepare(
      `SELECT id, wedding_id, amount_cents, gift_ids_json, status, queued_at, sent_at, confirmed_at, bank_ref
       FROM disbursements
       WHERE beneficiary_type = 'charity' AND charity_id = ?
       ORDER BY queued_at DESC LIMIT 200`
    )
      .bind(charityId)
      .all()
  ).results;

  const invoices = (
    await env.DB.prepare(
      `SELECT period_month, gift_count, gross_charity_amount_cents, altru_fee_cents, status, issued_at, paid_at
       FROM invoices WHERE charity_id = ? ORDER BY period_month DESC`
    )
      .bind(charityId)
      .all()
  ).results;

  return json(200, { charity, disbursements, invoices });
}

// ── GET /api/admin/disbursements ──────────────────────────────────────────
export async function getAdminDisbursements(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '100', 10), 500);

  const rows = status
    ? await env.DB.prepare(
        `SELECT d.*, c.name AS charity_name FROM disbursements d
         LEFT JOIN charities c ON c.id = d.charity_id
         WHERE d.status = ? ORDER BY d.queued_at DESC LIMIT ?`
      )
        .bind(status, limit)
        .all()
    : await env.DB.prepare(
        `SELECT d.*, c.name AS charity_name FROM disbursements d
         LEFT JOIN charities c ON c.id = d.charity_id
         ORDER BY d.queued_at DESC LIMIT ?`
      )
        .bind(limit)
        .all();

  return json(200, { disbursements: rows.results });
}

// ── POST /api/admin/disbursements/:id/sent ────────────────────────────────
export async function postDisbursementSent(req: Request, env: Env): Promise<Response> {
  const id = pathSegment(req, -2);
  if (!id) return json(400, { error: { code: 'missing_id' } });

  let body: { bank_ref?: string } = {};
  try {
    body = (await req.json()) as { bank_ref?: string };
  } catch {
    /* body optional */
  }

  const row = await env.DB.prepare(`SELECT status FROM disbursements WHERE id = ?`)
    .bind(id)
    .first<{ status: string }>();
  if (!row) return json(404, { error: { code: 'not_found' } });
  if (row.status !== 'queued') {
    return json(409, { error: { code: 'bad_state', message: `Disbursement is '${row.status}', expected 'queued'.` } });
  }

  await env.DB.prepare(`UPDATE disbursements SET status = 'sent', sent_at = ?, bank_ref = ? WHERE id = ?`)
    .bind(nowSeconds(), body.bank_ref ?? null, id)
    .run();
  await audit(env, {
    actorType: 'operator',
    eventType: 'disbursement.sent',
    entityType: 'disbursement',
    entityId: id,
    payload: { bank_ref: body.bank_ref },
  });
  return json(200, { ok: true, status: 'sent' });
}

// ── POST /api/admin/disbursements/:id/confirmed ───────────────────────────
export async function postDisbursementConfirmed(req: Request, env: Env): Promise<Response> {
  const id = pathSegment(req, -2);
  if (!id) return json(400, { error: { code: 'missing_id' } });

  const row = await env.DB.prepare(`SELECT status FROM disbursements WHERE id = ?`)
    .bind(id)
    .first<{ status: string }>();
  if (!row) return json(404, { error: { code: 'not_found' } });
  if (row.status !== 'sent') {
    return json(409, { error: { code: 'bad_state', message: `Disbursement is '${row.status}', expected 'sent'.` } });
  }

  await env.DB.prepare(`UPDATE disbursements SET status = 'confirmed', confirmed_at = ? WHERE id = ?`)
    .bind(nowSeconds(), id)
    .run();
  await audit(env, {
    actorType: 'operator',
    eventType: 'disbursement.confirmed',
    entityType: 'disbursement',
    entityId: id,
  });
  return json(200, { ok: true, status: 'confirmed' });
}

// ── GET /api/admin/invoices ───────────────────────────────────────────────
export async function getAdminInvoices(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const status = url.searchParams.get('status');

  const rows = status
    ? await env.DB.prepare(
        `SELECT i.*, c.name AS charity_name FROM invoices i
         JOIN charities c ON c.id = i.charity_id
         WHERE i.status = ? ORDER BY i.issued_at DESC LIMIT 500`
      )
        .bind(status)
        .all()
    : await env.DB.prepare(
        `SELECT i.*, c.name AS charity_name FROM invoices i
         JOIN charities c ON c.id = i.charity_id
         ORDER BY i.issued_at DESC LIMIT 500`
      ).all();

  return json(200, { invoices: rows.results });
}

// ── helpers ───────────────────────────────────────────────────────────────
function pathSegment(req: Request, fromEnd: number): string {
  const parts = new URL(req.url).pathname.split('/');
  return parts.at(fromEnd) ?? '';
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

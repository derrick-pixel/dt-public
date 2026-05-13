import type { Env } from '../types';
import { generateId } from '../lib/id';
import { nowSeconds } from '../lib/time';
import { isValidEmail } from '../lib/validation';
import { audit } from '../services/audit';
import { assessDataBreach, draftSupportResponse } from '../services/ai-ops';

// ── Compliance Routes ─────────────────────────────────────────────────────
//
// Public routes (no auth) for PDPA compliance:
//   POST /api/compliance/dsr          — data subject request (access / deletion / withdrawal)
//   POST /api/compliance/support      — contact form → AI drafts response for operator
//   GET  /api/compliance/status       — platform compliance status page (PSA posture, PFA status)
//
// Operator routes (admin auth via Cloudflare Access on /api/admin/*):
//   GET  /api/admin/dsr               — list open data subject requests
//   POST /api/admin/dsr/:id/complete  — mark DSR as completed
//   GET  /api/admin/ai-tasks          — list AI tasks awaiting review
//   POST /api/admin/ai-tasks/:id/approve — approve AI task output
//   GET  /api/admin/regulatory-updates — list regulatory updates
//   POST /api/admin/breach            — trigger data breach assessment (AI)

// ── POST /api/compliance/dsr ──────────────────────────────────────────────
// PDPA obligation: organisations must provide a way for data subjects to
// submit access, correction, or deletion requests.
// Deadline: 30 days for access/correction; reasonable period for deletion.
export async function postDataSubjectRequest(req: Request, env: Env): Promise<Response> {
  let body: {
    request_type?: string;
    contact_email?: string;
    subject_type?: string;
    message?: string;
  };
  try { body = await req.json() as typeof body; }
  catch { return err(400, 'invalid_json'); }

  const validTypes = ['access', 'correction', 'deletion', 'withdraw_consent', 'portability'];
  if (!body.request_type || !validTypes.includes(body.request_type)) {
    return err(400, 'invalid_request_type', `Must be one of: ${validTypes.join(', ')}`);
  }
  const email = (body.contact_email ?? '').trim().toLowerCase();
  if (!isValidEmail(email)) return err(400, 'invalid_email');

  const id = generateId();
  const now = nowSeconds();
  const deadlineDays = 30; // PDPA: 30-day response window for access/correction
  const deadlineAt = now + deadlineDays * 24 * 3600;

  await env.DB.prepare(
    `INSERT INTO data_subject_requests
       (id, ts, subject_type, contact_email, request_type, status, deadline_at, created_at)
     VALUES (?, ?, ?, ?, ?, 'received', ?, ?)`
  ).bind(
    id, now,
    body.subject_type ?? 'other',
    email,
    body.request_type,
    deadlineAt,
    now
  ).run();

  await audit(env, {
    actorType: 'guest',
    eventType: 'compliance.dsr.received',
    entityType: 'data_subject_request',
    entityId: id,
    payload: { request_type: body.request_type, contact_email: email },
  });

  // Send acknowledgement to requester
  if (env.RESEND_API_KEY) {
    const deadline = new Date(deadlineAt * 1000).toISOString().slice(0, 10);
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: `Altru Data Protection <${env.DPO_EMAIL ?? 'dpo@altru.asia'}>`,
        to: email,
        subject: 'Your data request has been received — Altru',
        text: `Thank you for your data ${body.request_type} request.\n\nWe have received your request (reference: ${id}) and will respond by ${deadline}.\n\nIf you have questions, contact our Data Protection Officer at ${env.DPO_EMAIL ?? 'dpo@altru.asia'}.\n\n— Altru Asia Pte Ltd`,
      }),
    }).catch(() => {/* non-fatal */});
  }

  // Notify operator
  if (env.OPERATOR_NOTIFY_EMAIL && env.RESEND_API_KEY) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Altru Compliance <noreply@altru.asia>',
        to: env.OPERATOR_NOTIFY_EMAIL,
        subject: `[Altru PDPA] New ${body.request_type} request from ${email}`,
        text: `A new PDPA data subject request has been received.\n\nType: ${body.request_type}\nFrom: ${email}\nReference: ${id}\nDeadline: ${new Date(deadlineAt * 1000).toISOString().slice(0, 10)}\n\nReview at: ${env.PUBLIC_BASE_URL}/admin/#dsr/${id}\n\n— Altru`,
      }),
    }).catch(() => {/* non-fatal */});
  }

  return ok({ reference: id, deadline: new Date(deadlineAt * 1000).toISOString().slice(0, 10) });
}

// ── POST /api/compliance/support ──────────────────────────────────────────
// Contact form — AI drafts a response, operator reviews before sending.
export async function postSupportRequest(req: Request, env: Env): Promise<Response> {
  let body: {
    inquiry_type?: string;
    contact_email?: string;
    subject?: string;
    message?: string;
  };
  try { body = await req.json() as typeof body; }
  catch { return err(400, 'invalid_json'); }

  const email = (body.contact_email ?? '').trim().toLowerCase();
  if (!isValidEmail(email)) return err(400, 'invalid_email');
  if (!body.subject?.trim()) return err(400, 'missing_subject');
  if (!body.message?.trim()) return err(400, 'missing_message');

  const validTypes = ['donor', 'couple', 'charity', 'general'];
  const inquiryType = (body.inquiry_type ?? 'general') as 'donor' | 'couple' | 'charity' | 'general';
  if (!validTypes.includes(inquiryType)) return err(400, 'invalid_inquiry_type');

  // Fire AI draft asynchronously — don't block the response
  if (env.AI_OPS_ENABLED === 'true') {
    draftSupportResponse(env, inquiryType, body.subject, body.message, email).catch(() => {});
  } else if (env.OPERATOR_NOTIFY_EMAIL && env.RESEND_API_KEY) {
    // Fallback: forward raw message to operator
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Altru Contact <noreply@altru.asia>',
        to: env.OPERATOR_NOTIFY_EMAIL,
        subject: `[Altru Contact] ${body.subject} — from ${email}`,
        text: `From: ${email}\nType: ${inquiryType}\nSubject: ${body.subject}\n\n${body.message}`,
      }),
    }).catch(() => {});
  }

  return ok({ received: true });
}

// ── GET /api/compliance/status ─────────────────────────────────────────────
// Public: shows platform compliance status. Useful for charity partners.
export async function getComplianceStatus(_req: Request, env: Env): Promise<Response> {
  const pfaCount = await env.DB.prepare(
    `SELECT COUNT(*) as cnt FROM pfa_agreements WHERE status = 'signed'`
  ).first<{ cnt: number }>();
  const permitCount = await env.DB.prepare(
    `SELECT COUNT(*) as cnt FROM fundraising_permits WHERE status IN ('issued','not_required')`
  ).first<{ cnt: number }>();

  // Derive PDPA readiness from actual system state rather than hard-coding.
  // We check that the compliance tables exist and the DPO contact is configured.
  let pdpaReady = false;
  try {
    const consentCheck = await env.DB.prepare(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='consent_logs'`
    ).first();
    pdpaReady = !!(consentCheck && env.DPO_EMAIL);
  } catch { /* non-fatal — DB may not be provisioned yet */ }

  return ok({
    psa_licence_status: env.PSA_LICENCE_STATUS ?? 'pending_legal_opinion',
    dpo_contact: env.DPO_EMAIL ?? 'dpo@altru.asia',
    active_pfa_agreements: pfaCount?.cnt ?? 0,
    fundraising_permits_active: permitCount?.cnt ?? 0,
    pdpa_compliant: pdpaReady,
    last_updated: new Date().toISOString().slice(0, 10),
  });
}

// ── Admin: GET /api/admin/ai-tasks ─────────────────────────────────────────
export async function getAiTasks(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const status = url.searchParams.get('status') ?? 'awaiting_review';
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '20', 10), 100);

  const rows = await env.DB.prepare(
    `SELECT id, task_type, status, model_used, tokens_used, created_at, completed_at, output_json
     FROM ai_tasks WHERE status = ? ORDER BY created_at DESC LIMIT ?`
  ).bind(status, limit).all();
  return ok({ tasks: rows.results });
}

// ── Admin: POST /api/admin/ai-tasks/:id/approve ────────────────────────────
export async function approveAiTask(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const taskId = url.pathname.split('/').at(-2) ?? '';
  if (!taskId) return err(400, 'missing_task_id');

  let body: { notes?: string } = {};
  try { body = await req.json() as typeof body; } catch { /* ok */ }

  await env.DB.prepare(
    `UPDATE ai_tasks SET status = 'approved', operator_notes = ?, actioned_at = ? WHERE id = ?`
  ).bind(body.notes ?? null, nowSeconds(), taskId).run();

  await audit(env, {
    actorType: 'operator',
    eventType: 'ai_task.approved',
    entityType: 'ai_task',
    entityId: taskId,
    payload: { notes: body.notes },
  });
  return ok({ approved: true });
}

// ── Admin: POST /api/admin/breach ─────────────────────────────────────────
export async function postBreachAssessment(req: Request, env: Env): Promise<Response> {
  let body: {
    description?: string;
    data_types?: string[];
    estimated_count?: number;
  };
  try { body = await req.json() as typeof body; }
  catch { return err(400, 'invalid_json'); }

  if (!body.description) return err(400, 'missing_description');

  if (env.AI_OPS_ENABLED !== 'true') {
    return err(503, 'ai_ops_disabled', 'Set AI_OPS_ENABLED=true and configure CLAUDE_API_KEY');
  }

  const result = await assessDataBreach(
    env,
    body.description,
    body.data_types ?? [],
    body.estimated_count ?? 0
  );
  return ok({ task_id: result.taskId, status: 'awaiting_review' });
}

// ── Helpers ────────────────────────────────────────────────────────────────
function ok(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
function err(status: number, code: string, message?: string): Response {
  return new Response(JSON.stringify({ error: { code, message: message ?? code } }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

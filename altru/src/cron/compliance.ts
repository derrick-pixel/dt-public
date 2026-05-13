import type { Env } from '../types';
import { refreshSanctionsList } from '../services/sanctions';
import {
  runWeeklyComplianceReview,
  draftMonthlyInvoices,
  summariseRegulatoryUpdate,
} from '../services/ai-ops';
import { audit } from '../services/audit';
import { nowSeconds } from '../lib/time';
import { generateId } from '../lib/id';

// ── Compliance Cron Dispatcher ────────────────────────────────────────────
//
// Dispatched from worker.ts → scheduled() based on event.cron pattern.
// Each job is idempotent — safe to re-run.
//
// Cron schedule (from wrangler.jsonc):
//   "0 * * * *"    → auto-refund tick (handled in cron/auto-refund.ts)
//   "0 1 * * *"    → daily disbursement (handled in cron/disbursement.ts)
//   "0 2 1 * *"    → monthly invoice generation + AI draft
//   "0 3 * * *"    → data retention sweep
//   "0 4 * * *"    → HitPay reconciliation
//   "0 5 * * *"    → MAS sanctions list refresh
//   "0 10 * * 1"   → weekly AI compliance review (Monday 18:00 SGT)
//   "0 0 * * *"    → DSR deadline checker

export async function dispatchComplianceCron(
  cron: string,
  env: Env,
  ctx: ExecutionContext
): Promise<void> {
  switch (cron) {
    case '0 5 * * *':
      ctx.waitUntil(runSanctionsRefresh(env));
      break;
    case '0 10 * * 1':
      ctx.waitUntil(runWeeklyComplianceReviewJob(env));
      break;
    case '0 2 1 * *':
      ctx.waitUntil(runMonthlyInvoiceJob(env));
      break;
    case '0 3 * * *':
      ctx.waitUntil(runRetentionSweep(env));
      break;
    case '0 0 * * *':
      ctx.waitUntil(runDsrDeadlineCheck(env));
      break;
    case '0 4 * * *':
      ctx.waitUntil(runRegulatoryUpdateScan(env));
      break;
    default:
      // Not a compliance cron — handled elsewhere
      break;
  }
}

// ── Job: MAS Sanctions List Refresh ───────────────────────────────────────
async function runSanctionsRefresh(env: Env): Promise<void> {
  try {
    const result = await refreshSanctionsList(env);
    await audit(env, {
      actorType: 'system',
      eventType: 'compliance.sanctions.refreshed',
      entityType: 'system',
      entityId: 'sanctions_list',
      payload: result,
    });
  } catch (e) {
    await audit(env, {
      actorType: 'system',
      eventType: 'compliance.sanctions.refresh_failed',
      entityType: 'system',
      entityId: 'sanctions_list',
      payload: { error: String(e) },
    });
  }
}

// ── Job: Weekly AI Compliance Review ──────────────────────────────────────
async function runWeeklyComplianceReviewJob(env: Env): Promise<void> {
  if (env.AI_OPS_ENABLED !== 'true') return;
  try {
    await runWeeklyComplianceReview(env);
    await audit(env, {
      actorType: 'system',
      eventType: 'compliance.ai_review.completed',
      entityType: 'system',
      entityId: 'weekly_review',
    });
  } catch (e) {
    await audit(env, {
      actorType: 'system',
      eventType: 'compliance.ai_review.failed',
      entityType: 'system',
      entityId: 'weekly_review',
      payload: { error: String(e) },
    });
  }
}

// ── Job: Monthly Invoice Generation ───────────────────────────────────────
async function runMonthlyInvoiceJob(env: Env): Promise<void> {
  const now = new Date();
  // Invoice for the previous month
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const periodMonth = prevMonth.toISOString().slice(0, 7); // YYYY-MM

  try {
    // Check if invoice already generated for this period
    const existing = await env.DB.prepare(
      `SELECT id FROM ai_tasks WHERE task_type = 'invoice_draft'
       AND input_json LIKE ? AND status != 'failed' LIMIT 1`
    ).bind(`%"period":"${periodMonth}"%`).first();
    if (existing) return; // Already run for this period

    if (env.AI_OPS_ENABLED === 'true') {
      await draftMonthlyInvoices(env, periodMonth);
    }
    await audit(env, {
      actorType: 'system',
      eventType: 'compliance.invoice.draft_created',
      entityType: 'system',
      entityId: periodMonth,
    });
  } catch (e) {
    await audit(env, {
      actorType: 'system',
      eventType: 'compliance.invoice.draft_failed',
      entityType: 'system',
      entityId: periodMonth,
      payload: { error: String(e) },
    });
  }
}

// ── Job: Data Retention Sweep (PDPA + Charities Act) ──────────────────────
// PDPA: no retention beyond purpose. Charities Act: 5-year minimum.
// Sessions expire per their expires_at. OTPs: purge 7 days after expiry.
// audit_log: purge entries older than 5 years.
async function runRetentionSweep(env: Env): Promise<void> {
  const now = nowSeconds();
  const fiveYearsAgo = now - 5 * 365 * 24 * 3600;
  const sevenDaysAgo = now - 7 * 24 * 3600;

  try {
    await env.DB.batch([
      // Sessions: delete expired sessions
      env.DB.prepare(`DELETE FROM sessions WHERE expires_at < ?`).bind(now),
      // OTPs: delete consumed codes older than 7 days, or expired codes older than 7 days
      env.DB.prepare(
        `DELETE FROM otp_codes WHERE (consumed_at IS NOT NULL AND consumed_at < ?) OR (expires_at < ?)`
      ).bind(sevenDaysAgo, sevenDaysAgo),
      // Pending weddings with no activity for 6 months (Path B, never claimed)
      env.DB.prepare(
        `UPDATE weddings SET status = 'closed' WHERE status = 'pending_couple_claim'
         AND created_at < ?`
      ).bind(now - 180 * 24 * 3600),
    ]);

    // Audit log: cold-archive entries older than 5 years (mark, don't hard-delete)
    // Hard deletion only after operator confirms archival to cold storage.
    const oldEntries = await env.DB.prepare(
      `SELECT COUNT(*) as cnt FROM audit_log WHERE ts < ?`
    ).bind(fiveYearsAgo).first<{ cnt: number }>();

    await audit(env, {
      actorType: 'system',
      eventType: 'compliance.retention.sweep_completed',
      entityType: 'system',
      entityId: 'retention_sweep',
      payload: { audit_log_entries_eligible_for_archive: oldEntries?.cnt ?? 0 },
    });
  } catch (e) {
    await audit(env, {
      actorType: 'system',
      eventType: 'compliance.retention.sweep_failed',
      entityType: 'system',
      entityId: 'retention_sweep',
      payload: { error: String(e) },
    });
  }
}

// ── Job: DSR Deadline Checker (PDPA 30-day clock) ─────────────────────────
// Flags any data subject requests approaching or past their 30-day deadline.
async function runDsrDeadlineCheck(env: Env): Promise<void> {
  const now = nowSeconds();
  const threeDaysFromNow = now + 3 * 24 * 3600;

  try {
    const approaching = await env.DB.prepare(
      `SELECT id, contact_email, request_type, deadline_at
       FROM data_subject_requests
       WHERE status IN ('received','in_review') AND deadline_at < ?`
    ).bind(threeDaysFromNow).all();

    if (approaching.results.length === 0) return;

    // Notify operator of approaching deadlines
    if (env.OPERATOR_NOTIFY_EMAIL && env.RESEND_API_KEY) {
      const list = approaching.results.map((r: Record<string, unknown>) =>
        `• ${r['request_type']} from ${r['contact_email']} — deadline: ${new Date((r['deadline_at'] as number) * 1000).toISOString().slice(0, 10)}`
      ).join('\n');

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Altru Compliance <noreply@altru.asia>',
          to: env.OPERATOR_NOTIFY_EMAIL,
          subject: `[Altru PDPA] ${approaching.results.length} data subject request(s) approaching deadline`,
          text: `The following PDPA data subject requests require action:\n\n${list}\n\nPlease respond within the deadline to comply with PDPA obligations.\n\nManage requests at: ${env.PUBLIC_BASE_URL}/admin/#dsr\n\n— Altru Compliance`,
        }),
      });
    }

    await audit(env, {
      actorType: 'system',
      eventType: 'compliance.dsr.deadline_alert',
      entityType: 'system',
      entityId: 'dsr_checker',
      payload: { count: approaching.results.length },
    });
  } catch (e) {
    await audit(env, {
      actorType: 'system',
      eventType: 'compliance.dsr.checker_failed',
      entityType: 'system',
      entityId: 'dsr_checker',
      payload: { error: String(e) },
    });
  }
}

// ── Job: Regulatory Update Scan ────────────────────────────────────────────
// Fetches key regulatory pages and asks AI to detect changes.
// Sources: MAS, IRAS, COC, PDPC.
const REGULATORY_SOURCES = [
  { source: 'MAS', url: 'https://www.mas.gov.sg/regulation/payments' },
  { source: 'IRAS', url: 'https://www.iras.gov.sg/taxes/other-taxes/charities/donations-tax-deductions' },
  { source: 'COC', url: 'https://www.charities.gov.sg/Pages/Fund-Raising/Fund-Raisers-Duties-and-Obligations.aspx' },
  { source: 'PDPC', url: 'https://www.pdpc.gov.sg/guidelines-and-consultation/consultation-and-guidelines' },
];

async function runRegulatoryUpdateScan(env: Env): Promise<void> {
  if (env.AI_OPS_ENABLED !== 'true') return;

  // Only run on first Monday of each month (rough check to limit API calls)
  const now = new Date();
  if (now.getDay() !== 1 || now.getDate() > 7) return;

  for (const { source, url } of REGULATORY_SOURCES) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Altru-Compliance/1.0 (dpo@altru.asia)' },
      });
      if (!res.ok) continue;
      const text = await res.text();
      // Strip HTML tags for a rough text extract
      const clean = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 4000);
      await summariseRegulatoryUpdate(env, source, url, clean);
    } catch {
      // Non-fatal: log and continue
    }
  }
}

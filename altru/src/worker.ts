import type { Env } from './types';
import { route } from './router';
import { dispatchComplianceCron } from './cron/compliance';
import { runAutoRefund } from './cron/auto-refund';
import { runDisbursement } from './cron/disbursement';
import { runMonthlyInvoices } from './cron/invoices';

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);

    // Only /api/* routes go through the Worker; everything else is a static asset.
    if (url.pathname.startsWith('/api/')) {
      return route(req, env, ctx);
    }

    // Fallback to static assets via the ASSETS binding.
    return env.ASSETS.fetch(req);
  },

  // ── Workers Cron Trigger ───────────────────────────────────────────────
  // Dispatches to the appropriate handler based on event.cron pattern.
  // All cron handlers are idempotent (safe to re-run).
  //
  // Schedule (all UTC, SGT = UTC+8):
  //   "0 * * * *"    01:xx SGT  — auto-refund tick
  //   "0 1 * * *"    09:00 SGT  — daily disbursement run
  //   "0 2 1 * *"    10:00 SGT  — monthly invoice generation
  //   "0 3 * * *"    11:00 SGT  — data retention sweep (PDPA)
  //   "0 4 * * *"    12:00 SGT  — HitPay reconciliation
  //   "0 5 * * *"    13:00 SGT  — MAS sanctions list refresh
  //   "0 10 * * 1"   18:00 SGT  — weekly AI compliance review (Monday)
  //   "0 0 * * *"    08:00 SGT  — DSR 30-day deadline checker
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log('[cron]', event.cron, new Date().toISOString());

    // Compliance cron jobs (sanctions, AI review, invoices, retention, DSR)
    await dispatchComplianceCron(event.cron, env, ctx);

    // Hourly auto-refund tick — escrow gifts past their 14-day window.
    if (event.cron === '0 * * * *') {
      ctx.waitUntil(runAutoRefund(env));
    }

    // Daily disbursement run — authorised gifts → queued payouts.
    if (event.cron === '0 1 * * *') {
      ctx.waitUntil(runDisbursement(env));
    }

    // Monthly invoice run — 5% platform fee billed to charities.
    if (event.cron === '0 2 1 * *') {
      ctx.waitUntil(runMonthlyInvoices(env));
    }

    // TODO Week 7: HitPay reconciliation → import { runReconciliation } from './cron/reconciliation'
  },
};

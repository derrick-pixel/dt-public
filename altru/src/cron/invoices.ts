import type { Env } from '../types';
import { generateId } from '../lib/id';
import { nowSeconds } from '../lib/time';
import { audit } from '../services/audit';
import { hmacSha256Hex } from '../lib/hmac';
import { sendEmail, renderCharityInvoiceEmail } from '../services/email';

// ── Monthly invoice cron ──────────────────────────────────────────────────
// Runs monthly ("0 2 1 * *"). For the previous calendar month, invoices each
// charity Altru's 5% platform fee on the gross donations it received. The
// basis is charity disbursements queued during the period — the actual money
// the charity was paid. Idempotent: one invoice per (charity, period_month).

export async function runMonthlyInvoices(env: Env): Promise<void> {
  const now = new Date();
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const periodMonth = periodStart.toISOString().slice(0, 7); // YYYY-MM
  const startSec = Math.floor(periodStart.getTime() / 1000);
  const endSec = Math.floor(periodEnd.getTime() / 1000);

  const feeBps = parseInt(env.PLATFORM_FEE_BPS ?? '500', 10);

  const rows = (
    await env.DB.prepare(
      `SELECT charity_id, amount_cents, gift_ids_json FROM disbursements
       WHERE beneficiary_type = 'charity' AND charity_id IS NOT NULL
         AND queued_at >= ? AND queued_at < ?`
    )
      .bind(startSec, endSec)
      .all<{ charity_id: string; amount_cents: number; gift_ids_json: string }>()
  ).results;
  if (rows.length === 0) return;

  const byCharity = new Map<string, { gross: number; giftIds: Set<string> }>();
  for (const r of rows) {
    let c = byCharity.get(r.charity_id);
    if (!c) {
      c = { gross: 0, giftIds: new Set() };
      byCharity.set(r.charity_id, c);
    }
    c.gross += r.amount_cents;
    try {
      for (const id of JSON.parse(r.gift_ids_json) || []) c.giftIds.add(id);
    } catch {
      /* malformed gift_ids_json — gross still counts */
    }
  }

  const charityIds = Array.from(byCharity.keys());
  const ph = charityIds.map(() => '?').join(',');
  const charities = (
    await env.DB.prepare(`SELECT id, name, finance_email FROM charities WHERE id IN (${ph})`)
      .bind(...charityIds)
      .all<{ id: string; name: string; finance_email: string | null }>()
  ).results;
  const charityInfo = new Map(charities.map((c) => [c.id, c]));

  const issuedAt = nowSeconds();
  let created = 0;

  for (const [charityId, agg] of byCharity) {
    // Idempotent — skip if this charity already has an invoice for the period.
    const existing = await env.DB.prepare(
      `SELECT id FROM invoices WHERE charity_id = ? AND period_month = ?`
    )
      .bind(charityId, periodMonth)
      .first();
    if (existing) continue;

    const fee = Math.round((agg.gross * feeBps) / 10000);
    const giftCount = agg.giftIds.size;

    await env.DB.prepare(
      `INSERT INTO invoices
         (id, charity_id, period_month, gift_count, gross_charity_amount_cents,
          altru_fee_cents, status, issued_at)
       VALUES (?, ?, ?, ?, ?, ?, 'issued', ?)`
    )
      .bind(generateId(), charityId, periodMonth, giftCount, agg.gross, fee, issuedAt)
      .run();
    created++;

    const info = charityInfo.get(charityId);
    if (info && info.finance_email && env.RESEND_API_KEY) {
      try {
        const token = await hmacSha256Hex(env.SESSION_HMAC_SECRET, `charity-portal:${charityId}`);
        const portalUrl = `${env.PUBLIC_BASE_URL}/charity.html?c=${charityId}&t=${token}`;
        const tmpl = renderCharityInvoiceEmail({
          charityName: info.name,
          periodMonth,
          giftCount,
          grossCents: agg.gross,
          feeCents: fee,
          portalUrl,
        });
        await sendEmail(env, { to: info.finance_email, subject: tmpl.subject, html: tmpl.html, text: tmpl.text });
      } catch (e) {
        console.error('invoice email failed', e);
      }
    }
  }

  await audit(env, {
    actorType: 'system',
    eventType: 'cron.invoices.completed',
    entityType: 'system',
    entityId: 'monthly_invoices',
    payload: { period: periodMonth, invoices_created: created },
  });
}

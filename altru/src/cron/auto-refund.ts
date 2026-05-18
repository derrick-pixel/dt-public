import type { Env } from '../types';
import { nowSeconds } from '../lib/time';
import { refundPayment } from '../services/hitpay';
import { transitionGiftState } from '../services/state';
import { audit } from '../services/audit';
import { sendEmail, renderAutoRefundEmail, renderCharityDeclinedEmail } from '../services/email';
import { sendSms } from '../services/sms';

// ── Auto-refund cron ──────────────────────────────────────────────────────
// Runs hourly ("0 * * * *"). Two timeouts, two behaviours:
//
//   pending_claim past its window  → couple never claimed the page.
//                                    Whole gift refunded → auto_refunded.
//   pending past its 14-day window → couple claimed but never decided.
//                                    Treated as a decline: charity portion
//                                    refunded to the guest, personal portion
//                                    still the couple's → declined.
//
// Idempotent: each one-way transition fires once.

interface DueGift {
  id: string;
  wedding_id: string;
  state: string;
  payment_ref: string;
  gift_amount_cents: number;
  personal_portion_cents: number;
  guest_name: string;
  guest_email: string | null;
  guest_mobile: string;
  couple_name: string | null;
}

const BATCH_LIMIT = 200;

export async function runAutoRefund(env: Env): Promise<void> {
  const now = nowSeconds();

  let due;
  try {
    due = await env.DB.prepare(
      `SELECT g.id, g.wedding_id, g.state, g.payment_ref, g.gift_amount_cents,
              g.personal_portion_cents, g.guest_name, g.guest_email, g.guest_mobile,
              (SELECT display_name FROM couples
                 WHERE wedding_id = g.wedding_id AND role = 'partner1' LIMIT 1) AS couple_name
       FROM gifts g
       WHERE g.state IN ('pending', 'pending_claim')
         AND g.payment_succeeded_at IS NOT NULL
         AND g.payment_ref IS NOT NULL
         AND g.scheduled_auto_refund_at <= ?
       ORDER BY g.scheduled_auto_refund_at ASC
       LIMIT ?`
    )
      .bind(now, BATCH_LIMIT)
      .all<DueGift>();
  } catch (e) {
    await audit(env, {
      actorType: 'system',
      eventType: 'cron.auto_refund.query_failed',
      entityType: 'system',
      entityId: 'auto_refund',
      payload: { error: String(e) },
    });
    return;
  }

  if (due.results.length === 0) return;

  let fullRefunds = 0;
  let declines = 0;
  let failed = 0;

  for (const gift of due.results) {
    try {
      if (gift.state === 'pending_claim') {
        // Pre-claim timeout — couple never claimed. Whole gift to the guest.
        const refund = await refundPayment(env, gift.payment_ref);
        await env.DB.prepare(`UPDATE gifts SET refund_ref = COALESCE(refund_ref, ?) WHERE id = ?`)
          .bind(refund.id, gift.id)
          .run();
        const t = await transitionGiftState(
          env,
          gift.id,
          'auto_refunded',
          { type: 'system' },
          { method: 'auto_refund_cron', reason: 'never_claimed', hitpay_refund_id: refund.id }
        );
        if (!t.ok) {
          failed++;
          continue;
        }
        fullRefunds++;
        await notifyFullRefund(env, gift);
      } else {
        // Post-claim timeout — couple did not decide. Treat as a decline:
        // charity portion back to the guest, personal portion stays the couple's.
        const charityCents = gift.gift_amount_cents - gift.personal_portion_cents;
        if (charityCents > 0) {
          const refund = await refundPayment(env, gift.payment_ref, (charityCents / 100).toFixed(2));
          await env.DB.prepare(`UPDATE gifts SET refund_ref = COALESCE(refund_ref, ?) WHERE id = ?`)
            .bind(refund.id, gift.id)
            .run();
        }
        const t = await transitionGiftState(
          env,
          gift.id,
          'declined',
          { type: 'system' },
          { method: 'auto_refund_cron', reason: 'no_decision_14d', charity_refund_cents: charityCents }
        );
        if (!t.ok) {
          failed++;
          continue;
        }
        declines++;
        if (charityCents > 0) await notifyCharityRefund(env, gift, charityCents);
      }
    } catch (e) {
      failed++;
      await audit(env, {
        actorType: 'system',
        eventType: 'gift.auto_refund_failed',
        entityType: 'gift',
        entityId: gift.id,
        payload: { error: String(e) },
      });
    }
  }

  await audit(env, {
    actorType: 'system',
    eventType: 'cron.auto_refund.completed',
    entityType: 'system',
    entityId: 'auto_refund',
    payload: { due: due.results.length, full_refunds: fullRefunds, declines, failed },
  });
}

async function notifyFullRefund(env: Env, gift: DueGift): Promise<void> {
  const coupleName = gift.couple_name ?? 'the couple';
  if (gift.guest_email) {
    try {
      const tmpl = renderAutoRefundEmail({
        guestName: gift.guest_name,
        coupleName,
        giftAmountCents: gift.gift_amount_cents,
        reason: 'couple_no_action',
      });
      await sendEmail(env, { to: gift.guest_email, subject: tmpl.subject, html: tmpl.html, text: tmpl.text });
    } catch (e) {
      console.error('full-refund donor email failed', e);
    }
  }
  try {
    const amount = (gift.gift_amount_cents / 100).toFixed(2);
    await sendSms(
      env,
      gift.guest_mobile,
      `Altru: your S$${amount} gift for ${coupleName} was refunded — the page was not claimed. Funds return in 3-5 business days.`
    );
  } catch (e) {
    console.error('full-refund donor SMS failed', e);
  }
}

async function notifyCharityRefund(env: Env, gift: DueGift, charityCents: number): Promise<void> {
  if (gift.guest_email) {
    try {
      const tmpl = renderCharityDeclinedEmail({ guestName: gift.guest_name, charityRefundCents: charityCents });
      await sendEmail(env, { to: gift.guest_email, subject: tmpl.subject, html: tmpl.html, text: tmpl.text });
    } catch (e) {
      console.error('charity-refund donor email failed', e);
    }
  }
  try {
    const amount = (charityCents / 100).toFixed(2);
    await sendSms(
      env,
      gift.guest_mobile,
      `Altru: the S$${amount} charity portion of your gift was refunded — the couple did not approve the donation in time. Funds return in 3-5 business days.`
    );
  } catch (e) {
    console.error('charity-refund donor SMS failed', e);
  }
}

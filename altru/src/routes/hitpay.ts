import type { Env } from '../types';
import { verifyWebhookSignature } from '../services/hitpay';
import { transitionGiftState } from '../services/state';
import { audit } from '../services/audit';
import { hmacSha256Hex } from '../lib/hmac';
import { nowSeconds } from '../lib/time';
import { sendSms } from '../services/sms';
import { sendEmail } from '../services/email';

const FOURTEEN_DAYS_SECONDS = 14 * 86400;
// Path B: a guest-created wedding has 90 days to be claimed by the couple.
// If it is never claimed, the held gift is auto-refunded to the guest.
const CLAIM_WINDOW_SECONDS = 90 * 86400;

interface GiftRow {
  id: string;
  wedding_id: string;
  state: string;
  payment_succeeded_at: number | null;
  gift_amount_cents: number;
  personal_portion_cents: number;
  guest_name: string;
  guest_email: string | null;
  message_to_couple: string | null;
}

export async function postHitpayWebhook(
  req: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const rawBody = await req.text();
  const header = req.headers.get('hitpay-signature');

  const verified = await verifyWebhookSignature(rawBody, header, env.HITPAY_WEBHOOK_SECRET);
  if (!verified) {
    console.warn('HitPay webhook signature verification failed');
    return new Response('Invalid signature', { status: 400 });
  }

  const params = new URLSearchParams(rawBody);
  const status = params.get('status') ?? '';
  const paymentRequestId = params.get('payment_request_id') ?? params.get('id');
  const paymentId = params.get('payment_id');

  // Always 200 on unknown/unprocessable webhooks to avoid HitPay retry storms.
  if (!paymentRequestId) return ok();

  const gift = await env.DB.prepare(
    `SELECT id, wedding_id, state, payment_succeeded_at,
            gift_amount_cents, personal_portion_cents,
            guest_name, guest_email, message_to_couple
     FROM gifts WHERE payment_ref = ?`
  )
    .bind(paymentRequestId)
    .first<GiftRow>();
  if (!gift) {
    console.warn('HitPay webhook for unknown payment_ref:', paymentRequestId);
    return ok();
  }

  if (status === 'completed') {
    return handleCompleted(env, ctx, gift, paymentId);
  }
  if (status === 'failed') {
    return handleFailed(env, gift);
  }
  if (status === 'refunded' || status === 'refund_succeeded') {
    return handleRefunded(env, gift, paymentId);
  }

  // Unknown status → record + 200
  await audit(env, {
    actorType: 'system',
    eventType: 'hitpay.webhook.unhandled',
    entityType: 'gift',
    entityId: gift.id,
    payload: { status, payment_id: paymentId },
  });
  return ok();
}

async function handleCompleted(
  env: Env,
  ctx: ExecutionContext,
  gift: GiftRow,
  paymentId: string | null
): Promise<Response> {
  if (gift.payment_succeeded_at) {
    // Idempotent — already processed
    return ok();
  }
  const now = nowSeconds();
  // A held (Path B) gift runs on the 90-day claim clock; an ordinary pending
  // gift runs on the 14-day couple-authorisation clock.
  const window = gift.state === 'pending_claim' ? CLAIM_WINDOW_SECONDS : FOURTEEN_DAYS_SECONDS;
  await env.DB.prepare(
    `UPDATE gifts SET payment_succeeded_at = ?, scheduled_auto_refund_at = ? WHERE id = ?`
  )
    .bind(now, now + window, gift.id)
    .run();
  await audit(env, {
    actorType: 'system',
    eventType: 'hitpay.webhook.completed',
    entityType: 'gift',
    entityId: gift.id,
    payload: { payment_id: paymentId, payment_succeeded_at: now, gift_state: gift.state },
  });

  // Notify the couple — an authorisation prompt (Path A) or a claim
  // invitation carrying a magic link (Path B).
  ctx.waitUntil(notifyCouple(env, gift));
  if (gift.guest_email) ctx.waitUntil(notifyGuest(env, gift));
  return ok();
}

async function handleFailed(env: Env, gift: GiftRow): Promise<Response> {
  if (gift.state === 'failed') return ok();
  // Transition only if still in pending / pending_claim
  if (gift.state === 'pending' || gift.state === 'pending_claim') {
    await transitionGiftState(env, gift.id, 'failed', { type: 'system' }, { reason: 'hitpay_payment_failed' });
  } else {
    await audit(env, {
      actorType: 'system',
      eventType: 'hitpay.webhook.failed_ignored',
      entityType: 'gift',
      entityId: gift.id,
      payload: { current_state: gift.state },
    });
  }
  return ok();
}

async function handleRefunded(env: Env, gift: GiftRow, paymentId: string | null): Promise<Response> {
  if (paymentId) {
    await env.DB.prepare(
      `UPDATE gifts SET refund_ref = COALESCE(refund_ref, ?) WHERE id = ?`
    )
      .bind(paymentId, gift.id)
      .run();
  }
  await audit(env, {
    actorType: 'system',
    eventType: 'hitpay.webhook.refund_confirmed',
    entityType: 'gift',
    entityId: gift.id,
    payload: { payment_id: paymentId, current_state: gift.state },
  });
  return ok();
}

async function notifyCouple(env: Env, gift: GiftRow): Promise<void> {
  try {
    const couple = await env.DB.prepare(
      `SELECT email, mobile, display_name FROM couples
       WHERE wedding_id = ? AND role = 'partner1' LIMIT 1`
    )
      .bind(gift.wedding_id)
      .first<{ email: string; mobile: string; display_name: string }>();
    if (!couple) return;

    const total = (gift.gift_amount_cents / 100).toFixed(2);
    const personal = (gift.personal_portion_cents / 100).toFixed(2);
    const charityCents = gift.gift_amount_cents - gift.personal_portion_cents;
    const charity = (charityCents / 100).toFixed(2);

    // Path B — the couple has not claimed their page and has no email on file.
    // Text the claim link to the mobile the attendee supplied, as a backstop
    // to the link the attendee forwards themselves.
    if (gift.state === 'pending_claim') {
      const token = await hmacSha256Hex(env.SESSION_HMAC_SECRET, `wedding-claim:${gift.wedding_id}`);
      const claimUrl = `${env.PUBLIC_BASE_URL}/claim.html?w=${gift.wedding_id}&t=${token}`;
      await sendSms(
        env,
        couple.mobile,
        `${gift.guest_name} sent you a S$${total} wedding gift via Altru. Claim your page to receive it: ${claimUrl}`
      ).catch((e) => console.error('Claim SMS to couple failed', e));
      return;
    }

    // Path A — the couple already has an active dashboard.
    await sendSms(
      env,
      couple.mobile,
      `${gift.guest_name} sent a S$${total} gift via Altru. Sign in to authorise within 14 days: ${env.PUBLIC_BASE_URL}/dashboard.html`
    ).catch((e) => console.error('SMS to couple failed', e));

    await sendEmail(env, {
      to: couple.email,
      subject: `${gift.guest_name} sent you a wedding gift through Altru`,
      text:
        `Hi ${couple.display_name},\n\n` +
        `${gift.guest_name} just sent a S$${total} wedding gift to you through Altru.\n` +
        `  · Charity portion: S$${charity}\n` +
        `  · Your portion:    S$${personal}\n\n` +
        (gift.message_to_couple ? `Message from ${gift.guest_name}: "${gift.message_to_couple}"\n\n` : '') +
        `Sign in to your dashboard to authorise release within 14 days:\n` +
        `${env.PUBLIC_BASE_URL}/dashboard.html\n\n` +
        `If you don't authorise within 14 days, the guest is automatically refunded in full.\n\n— Altru`,
      html:
        `<p>Hi ${escapeHtml(couple.display_name)},</p>` +
        `<p><strong>${escapeHtml(gift.guest_name)}</strong> just sent a <strong>S$${total}</strong> wedding gift to you through Altru.</p>` +
        `<ul><li>Charity portion: <strong>S$${charity}</strong></li><li>Your portion: <strong>S$${personal}</strong></li></ul>` +
        (gift.message_to_couple
          ? `<p style="background:#FFF8F8;padding:0.85rem 1rem;border-left:3px solid #C8102E;border-radius:0 8px 8px 0;font-style:italic;">"${escapeHtml(gift.message_to_couple)}"</p>`
          : '') +
        `<p><a href="${env.PUBLIC_BASE_URL}/dashboard.html" style="display:inline-block;background:#C8102E;color:white;padding:0.85rem 1.6rem;border-radius:8px;text-decoration:none;font-weight:700;">Open dashboard →</a></p>` +
        `<p style="font-size:0.85rem;color:#8A5C5C;">If you don't authorise within 14 days, the guest is automatically refunded in full.</p>` +
        `<p>— Altru</p>`,
    }).catch((e) => console.error('Email to couple failed', e));
  } catch (e) {
    console.error('notifyCouple failed', e);
  }
}

async function notifyGuest(env: Env, gift: GiftRow): Promise<void> {
  if (!gift.guest_email) return;
  try {
    const refundToken = await hmacSha256Hex(env.SESSION_HMAC_SECRET, `refund:${gift.id}`);
    const refundUrl = `${env.PUBLIC_BASE_URL}/api/gift/${gift.id}/refund-link/${refundToken}`;
    const total = (gift.gift_amount_cents / 100).toFixed(2);

    await sendEmail(env, {
      to: gift.guest_email,
      subject: `Your wedding gift via Altru — confirmation`,
      text:
        `Hi ${gift.guest_name},\n\n` +
        `Thanks for your S$${total} wedding gift through Altru.\n\n` +
        `The couple has 14 days to authorise release of the charity portion. ` +
        `If they don't, you'll be fully refunded automatically.\n\n` +
        `If you change your mind within the next 14 days, you can cancel here:\n${refundUrl}\n\n` +
        `After day 14, the link expires.\n\n— Altru`,
      html:
        `<p>Hi ${escapeHtml(gift.guest_name)},</p>` +
        `<p>Thanks for your <strong>S$${total}</strong> wedding gift through Altru.</p>` +
        `<p>The couple has 14 days to authorise release. If they don't, you'll be fully refunded automatically.</p>` +
        `<p>If you change your mind within the next 14 days, you can cancel here:</p>` +
        `<p><a href="${refundUrl}" style="color:#C8102E;text-decoration:underline;font-weight:700;">Cancel my gift (valid for 14 days)</a></p>` +
        `<p style="font-size:0.85rem;color:#8A5C5C;">After day 14, this link expires.</p>` +
        `<p>— Altru</p>`,
    });
  } catch (e) {
    console.error('notifyGuest failed', e);
  }
}

function ok(): Response {
  return new Response('OK', { status: 200 });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

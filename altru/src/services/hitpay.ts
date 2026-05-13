import type { Env } from '../types';
import { hmacSha256Hex } from '../lib/hmac';
import { constantTimeEqual } from '../lib/sha256';

export interface PaymentRequestInput {
  amount: string; // e.g. "120.00"
  currency: string; // "SGD"
  email?: string;
  name?: string;
  purpose: string;
  reference_number: string;
  redirect_url: string;
  webhook: string;
  payment_methods?: string[];
  send_email?: boolean;
  send_sms?: boolean;
}

export interface PaymentRequestResult {
  id: string;
  url: string;
  status: string;
}

function apiBase(env: Env): string {
  return env.ENV === 'prod'
    ? 'https://api.hit-pay.com'
    : 'https://api.sandbox.hit-pay.com';
}

export async function createPaymentRequest(
  env: Env,
  input: PaymentRequestInput
): Promise<PaymentRequestResult> {
  const body = new URLSearchParams();
  body.set('amount', input.amount);
  body.set('currency', input.currency);
  body.set('purpose', input.purpose);
  body.set('reference_number', input.reference_number);
  body.set('redirect_url', input.redirect_url);
  body.set('webhook', input.webhook);
  if (input.email) body.set('email', input.email);
  if (input.name) body.set('name', input.name);
  if (input.payment_methods) {
    for (const m of input.payment_methods) body.append('payment_methods[]', m);
  }
  body.set('send_email', input.send_email ? 'true' : 'false');
  body.set('send_sms', input.send_sms ? 'true' : 'false');

  const res = await fetch(`${apiBase(env)}/v1/payment-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-BUSINESS-API-KEY': env.HITPAY_API_KEY,
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: body.toString(),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HitPay payment-request failed (${res.status}): ${txt}`);
  }
  const data = (await res.json()) as { id: string; url: string; status: string };
  return { id: data.id, url: data.url, status: data.status };
}

export async function refundPayment(
  env: Env,
  paymentId: string,
  amountSgd?: string
): Promise<{ id: string; status: string }> {
  const body = new URLSearchParams();
  body.set('payment_id', paymentId);
  if (amountSgd) body.set('amount', amountSgd);

  const res = await fetch(`${apiBase(env)}/v1/refund`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-BUSINESS-API-KEY': env.HITPAY_API_KEY,
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: body.toString(),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HitPay refund failed (${res.status}): ${txt}`);
  }
  return (await res.json()) as { id: string; status: string };
}

// Verify a HitPay webhook signature.
// HitPay's documented pattern: HMAC-SHA256 over the form-encoded body with
// the `hmac` field removed, keys sorted alphabetically, joined as
// "key0value0key1value1..." (no separators), signed with the webhook salt.
// Some integrations also pass the same signature via a request header
// (typically `hitpay-signature`); we accept either.
export async function verifyWebhookSignature(
  rawBody: string,
  headerSignature: string | null,
  salt: string
): Promise<boolean> {
  if (!salt) return false;
  const params = new URLSearchParams(rawBody);
  const formHmac = params.get('hmac');
  const candidate = formHmac ?? headerSignature ?? '';
  if (!candidate) return false;

  const parts: { k: string; v: string }[] = [];
  params.forEach((v, k) => {
    if (k === 'hmac') return;
    parts.push({ k, v });
  });
  parts.sort((a, b) => a.k.localeCompare(b.k));
  const signString = parts.map((p) => `${p.k}${p.v}`).join('');
  const expected = await hmacSha256Hex(salt, signString);
  return constantTimeEqual(expected, candidate);
}

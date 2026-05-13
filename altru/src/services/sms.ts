import type { Env } from '../types';

export async function sendSms(env: Env, to: string, message: string): Promise<void> {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_FROM_NUMBER) {
    if (env.ENV !== 'prod') {
      // Dev convenience: log and continue when SMS isn't configured locally
      console.log(`[sms dev-stub] to=${to} msg=${message}`);
      return;
    }
    throw new Error('Twilio not configured');
  }
  const body = new URLSearchParams({
    From: env.TWILIO_FROM_NUMBER,
    To: to,
    Body: message,
  });
  const auth = btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`);
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    }
  );
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Twilio send failed (${res.status}): ${txt}`);
  }
}

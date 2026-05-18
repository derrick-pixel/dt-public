import type { Env } from '../types';

interface SendEmailOpts {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

// ── Email template registry ────────────────────────────────────────────────
// All outbound emails are defined here as render functions.
// Compliance-critical templates (gift confirmation, refund, IRAS receipt)
// include mandatory Charities Act and PDPA disclosures.
//
// Required disclosures per Charities Act s.41 (commercial fund-raiser):
//  • Altru's name and status as a commercial fund-raiser
//  • How Altru's remuneration is calculated (5% fee to charity)
//  • Proportion of proceeds going to charitable purposes

export async function sendEmail(env: Env, opts: SendEmailOpts): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: opts.from ?? 'Altru <noreply@altru.asia>',
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend send failed (${res.status}): ${body}`);
  }
}

const PRIMARY = '#C8102E';

export function renderMagicLinkEmail(magicUrl: string, displayName?: string): {
  subject: string;
  html: string;
  text: string;
} {
  const greeting = displayName ? `Hi ${escapeHtml(displayName)},` : 'Hello,';
  const greetingText = displayName ? `Hi ${displayName},` : 'Hello,';
  return {
    subject: 'Your Altru sign-in link',
    text:
      `${greetingText}\n\n` +
      `Click the link below to sign in to Altru. The link is valid for 15 minutes.\n\n` +
      `${magicUrl}\n\n` +
      `If you didn't request this, you can safely ignore this email.\n\n— Altru`,
    html:
      `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#2D1010;line-height:1.6;">` +
      `<h1 style="font-family:'Playfair Display',serif;color:${PRIMARY};">Sign in to Altru</h1>` +
      `<p>${greeting}</p>` +
      `<p>Click the button below to sign in. The link is valid for 15 minutes.</p>` +
      `<p style="margin:1.5rem 0;"><a href="${escapeAttr(magicUrl)}" ` +
        `style="display:inline-block;background:${PRIMARY};color:white;padding:0.85rem 1.6rem;` +
        `border-radius:8px;text-decoration:none;font-weight:700;">Sign in</a></p>` +
      `<p style="font-size:0.85rem;color:#8A5C5C;">Or paste this URL into your browser:<br>` +
        `<code style="word-break:break-all;">${escapeHtml(magicUrl)}</code></p>` +
      `<p style="font-size:0.85rem;color:#8A5C5C;">If you didn't request this, you can ignore this email — no further action is needed.</p>` +
      `<p style="margin-top:2rem;color:#8A5C5C;">— Altru</p>` +
      `</div>`,
  };
}

// ── Gift confirmation email (donor) ──────────────────────────────────────
// Includes: Charities Act disclosure, 14-day refund link, gift breakdown.
export function renderGiftConfirmationEmail(opts: {
  guestName: string;
  coupleName: string;
  giftAmountCents: number;
  charityAmountCents: number;
  personalAmountCents: number;
  charityName: string;
  refundUrl: string;
  refundDeadline: string; // ISO date string
}): { subject: string; html: string; text: string } {
  const total   = fmt(opts.giftAmountCents);
  const charity = fmt(opts.charityAmountCents);
  const couple  = fmt(opts.personalAmountCents);

  const text =
    `Hi ${opts.guestName},\n\n` +
    `Your altruistic ang bao for ${opts.coupleName} has been received.\n\n` +
    `GIFT SUMMARY\n` +
    `Total gift:       S$${total}\n` +
    `To ${opts.charityName}: S$${charity} (paid in full to the charity)\n` +
    `To ${opts.coupleName}: S$${couple}\n\n` +
    `REFUND RIGHTS\n` +
    `You may request a full refund at any time before ${opts.refundDeadline}:\n` +
    `${opts.refundUrl}\n\n` +
    `IMPORTANT — CHARITIES ACT DISCLOSURE\n` +
    `Altru Asia Pte Ltd is a commercial fund-raiser registered under the Charities Act 1994. ` +
    `The charity portion of your gift is paid directly and in full to ${opts.charityName}. ` +
    `Altru charges the charity a 5% platform fee separately — it is not deducted from your donation.\n\n` +
    `Questions? Email us at support@altru.asia or contact our DPO at dpo@altru.asia.\n\n— Altru`;

  const html =
    wrap(
      `<h2 style="color:${PRIMARY};">🧧 Gift Confirmed</h2>` +
      `<p>Hi ${escapeHtml(opts.guestName)},</p>` +
      `<p>Your altruistic ang bao for <strong>${escapeHtml(opts.coupleName)}</strong> has been received.</p>` +
      `<table style="width:100%;border-collapse:collapse;margin:1.25rem 0;">` +
        `<tr style="background:#FEF3C7;"><td style="padding:0.5rem 0.75rem;font-weight:700;">Total gift</td><td style="padding:0.5rem 0.75rem;text-align:right;">S$${total}</td></tr>` +
        `<tr><td style="padding:0.5rem 0.75rem;">To ${escapeHtml(opts.charityName)}</td><td style="padding:0.5rem 0.75rem;text-align:right;color:#16A34A;font-weight:700;">S$${charity}</td></tr>` +
        `<tr style="background:#F9FAFB;"><td style="padding:0.5rem 0.75rem;">To ${escapeHtml(opts.coupleName)}</td><td style="padding:0.5rem 0.75rem;text-align:right;">S$${couple}</td></tr>` +
      `</table>` +
      `<p><a href="${escapeAttr(opts.refundUrl)}" style="display:inline-block;background:#F3F4F6;color:#374151;padding:0.6rem 1.2rem;border-radius:6px;text-decoration:none;font-size:0.9rem;">Request refund (before ${escapeHtml(opts.refundDeadline)})</a></p>` +
      `<hr style="border:none;border-top:1px solid #F5DADA;margin:1.5rem 0;">` +
      `<p style="font-size:0.8rem;color:#8A5C5C;">` +
        `<strong>Charities Act Disclosure:</strong> Altru Asia Pte Ltd is a commercial fund-raiser under the Charities Act 1994. ` +
        `The charity portion of your gift is paid directly and in full to ${escapeHtml(opts.charityName)}. ` +
        `Altru's 5% platform fee is charged separately to the charity — not deducted from your donation. ` +
        `<a href="https://altru.asia/privacy.html" style="color:#8A5C5C;">Privacy Policy</a>` +
      `</p>`
    );

  return { subject: `Your Altru gift for ${opts.coupleName} is confirmed 🧧`, html, text };
}

// ── New gift notification (couple) ────────────────────────────────────────
export function renderNewGiftNotificationEmail(opts: {
  coupleName: string;
  guestName: string;
  giftAmountCents: number;
  charityAmountCents: number;
  personalAmountCents: number;
  charityName: string;
  dashboardUrl: string;
  autoRefundDeadline: string;
}): { subject: string; html: string; text: string } {
  const total   = fmt(opts.giftAmountCents);
  const charity = fmt(opts.charityAmountCents);
  const couple  = fmt(opts.personalAmountCents);

  const text =
    `Hi ${opts.coupleName},\n\n` +
    `${opts.guestName} has sent you an Altru gift of S$${total}.\n\n` +
    `S$${charity} will go to ${opts.charityName} in your name.\n` +
    `S$${couple} will go to you.\n\n` +
    `You have until ${opts.autoRefundDeadline} to authorise this gift in your dashboard.\n` +
    `If you take no action, the gift will be automatically refunded.\n\n` +
    `Dashboard: ${opts.dashboardUrl}\n\n— Altru`;

  const html =
    wrap(
      `<h2 style="color:${PRIMARY};">🧧 New Gift Received</h2>` +
      `<p>Hi ${escapeHtml(opts.coupleName)},</p>` +
      `<p><strong>${escapeHtml(opts.guestName)}</strong> has sent you an Altru gift of <strong>S$${total}</strong>.</p>` +
      `<table style="width:100%;border-collapse:collapse;margin:1.25rem 0;">` +
        `<tr style="background:#DCFCE7;"><td style="padding:0.5rem 0.75rem;">To ${escapeHtml(opts.charityName)}</td><td style="padding:0.5rem 0.75rem;text-align:right;color:#16A34A;font-weight:700;">S$${charity}</td></tr>` +
        `<tr><td style="padding:0.5rem 0.75rem;">To you</td><td style="padding:0.5rem 0.75rem;text-align:right;">S$${couple}</td></tr>` +
      `</table>` +
      `<p>Authorise this gift in your dashboard before <strong>${escapeHtml(opts.autoRefundDeadline)}</strong>. If you take no action, the gift is automatically refunded to the guest.</p>` +
      `<p><a href="${escapeAttr(opts.dashboardUrl)}" style="display:inline-block;background:${PRIMARY};color:white;padding:0.75rem 1.4rem;border-radius:8px;text-decoration:none;font-weight:700;">Open Dashboard →</a></p>`
    );

  return { subject: `🧧 ${opts.guestName} sent you a gift!`, html, text };
}

// ── Auto-refund notification (donor) ─────────────────────────────────────
export function renderAutoRefundEmail(opts: {
  guestName: string;
  coupleName: string;
  giftAmountCents: number;
  reason: 'couple_no_action' | 'guest_requested';
}): { subject: string; html: string; text: string } {
  const amount = fmt(opts.giftAmountCents);
  const reasonText = opts.reason === 'guest_requested'
    ? 'as you requested'
    : 'because the couple did not authorise the gift within the 14-day window';

  const text =
    `Hi ${opts.guestName},\n\nYour Altru gift of S$${amount} for ${opts.coupleName} has been refunded ${reasonText}.\n\n` +
    `The refund will appear in your account within 3-5 business days.\n\n` +
    `If you have questions, contact support@altru.asia.\n\n— Altru`;

  const html =
    wrap(
      `<h2 style="color:${PRIMARY};">Refund Processed</h2>` +
      `<p>Hi ${escapeHtml(opts.guestName)},</p>` +
      `<p>Your Altru gift of <strong>S$${amount}</strong> for ${escapeHtml(opts.coupleName)} has been refunded ${escapeHtml(reasonText)}.</p>` +
      `<p>The refund will appear in your account within <strong>3–5 business days</strong>.</p>` +
      `<p style="font-size:0.85rem;color:#8A5C5C;">Questions? Email <a href="mailto:support@altru.asia">support@altru.asia</a></p>`
    );

  return { subject: `Refund processed — your Altru gift for ${opts.coupleName}`, html, text };
}

// ── IRAS tax receipt transmission (to charity finance team) ───────────────
// Sent when a couple provides NRIC consent — informs the charity to issue
// an official tax-deductible donation receipt in the couple's name.
export function renderIrasReceiptRequestEmail(opts: {
  charityName: string;
  charityFinanceEmail: string;
  coupleName: string;
  donorNric: string;  // decrypted — only used at send time, never stored
  donationAmountCents: number;
  donationDate: string;
  ipcNo: string;
}): { subject: string; html: string; text: string } {
  const amount = fmt(opts.donationAmountCents);

  const text =
    `Dear ${opts.charityName} Finance Team,\n\n` +
    `Please issue an official IRAS tax-deductible donation receipt for the following gift made via the Altru platform:\n\n` +
    `Donor name:    ${opts.coupleName}\n` +
    `Donor NRIC:    ${opts.donorNric}\n` +
    `Donation amount: S$${amount}\n` +
    `Donation date:   ${opts.donationDate}\n` +
    `Your IPC No:     ${opts.ipcNo}\n\n` +
    `This gift qualifies for the 250% IRAS tax deduction under the approved IPC donation scheme.\n\n` +
    `Please retain this email as part of your donation records.\n\n` +
    `Issued by: Altru Asia Pte Ltd (commercial fund-raiser under Charities Act 1994)\n` +
    `Contact: dpo@altru.asia for data protection queries\n\n— Altru`;

  const html =
    wrap(
      `<h2 style="color:${PRIMARY};">IRAS Tax Receipt Request</h2>` +
      `<p>Dear ${escapeHtml(opts.charityName)} Finance Team,</p>` +
      `<p>Please issue an official IRAS tax-deductible donation receipt for the following gift made via the Altru platform:</p>` +
      `<table style="width:100%;border-collapse:collapse;margin:1rem 0;">` +
        `<tr><td style="padding:0.4rem 0.6rem;background:#F9FAFB;font-weight:700;">Donor name</td><td style="padding:0.4rem 0.6rem;">${escapeHtml(opts.coupleName)}</td></tr>` +
        `<tr><td style="padding:0.4rem 0.6rem;background:#F9FAFB;font-weight:700;">Donor NRIC</td><td style="padding:0.4rem 0.6rem;">${escapeHtml(opts.donorNric)}</td></tr>` +
        `<tr><td style="padding:0.4rem 0.6rem;background:#F9FAFB;font-weight:700;">Donation amount</td><td style="padding:0.4rem 0.6rem;font-weight:700;">S$${amount}</td></tr>` +
        `<tr><td style="padding:0.4rem 0.6rem;background:#F9FAFB;font-weight:700;">Donation date</td><td style="padding:0.4rem 0.6rem;">${escapeHtml(opts.donationDate)}</td></tr>` +
        `<tr><td style="padding:0.4rem 0.6rem;background:#F9FAFB;font-weight:700;">Your IPC No.</td><td style="padding:0.4rem 0.6rem;">${escapeHtml(opts.ipcNo)}</td></tr>` +
      `</table>` +
      `<p>This gift qualifies for the 250% IRAS tax deduction under the approved IPC donation scheme.</p>` +
      `<hr style="border:none;border-top:1px solid #F5DADA;margin:1.25rem 0;">` +
      `<p style="font-size:0.8rem;color:#8A5C5C;">Issued by Altru Asia Pte Ltd — commercial fund-raiser under the Charities Act 1994. Data shared with your express consent under the PDPA. Data protection queries: <a href="mailto:dpo@altru.asia">dpo@altru.asia</a></p>`
    );

  return {
    subject: `IRAS Tax Receipt Request — ${opts.coupleName} — S$${amount} — ${opts.donationDate}`,
    html,
    text,
  };
}

// ── Charity portion declined (to donor) ──────────────────────────────────
export function renderCharityDeclinedEmail(opts: {
  guestName: string;
  charityRefundCents: number;
}): { subject: string; html: string; text: string } {
  const amount = fmt(opts.charityRefundCents);

  const text =
    `Hi ${opts.guestName},\n\n` +
    `The couple has kept your personal gift but chose not to forward the charity portion. ` +
    `The charity portion of S$${amount} has been refunded to you and will appear in your account within 3-5 business days.\n\n` +
    `Questions? Email support@altru.asia.\n\n— Altru`;

  const html = wrap(
    `<h2 style="color:${PRIMARY};">Charity portion refunded</h2>` +
    `<p>Hi ${escapeHtml(opts.guestName)},</p>` +
    `<p>The couple has kept your personal gift but chose not to forward the charity portion. The charity portion of <strong>S$${amount}</strong> has been refunded to you.</p>` +
    `<p>It will appear in your account within <strong>3–5 business days</strong>.</p>` +
    `<p style="font-size:0.85rem;color:#8A5C5C;">Questions? Email <a href="mailto:support@altru.asia">support@altru.asia</a></p>`
  );

  return { subject: 'The charity portion of your Altru gift has been refunded', html, text };
}

// ── Monthly platform-fee invoice (to charity finance team) ────────────────
export function renderCharityInvoiceEmail(opts: {
  charityName: string;
  periodMonth: string;     // YYYY-MM
  giftCount: number;
  grossCents: number;
  feeCents: number;
  portalUrl: string;
}): { subject: string; html: string; text: string } {
  const gross = fmt(opts.grossCents);
  const fee = fmt(opts.feeCents);

  const text =
    `Dear ${opts.charityName} Finance Team,\n\n` +
    `Altru platform fee invoice — ${opts.periodMonth}\n\n` +
    `During ${opts.periodMonth}, ${opts.giftCount} wedding gift(s) routed donations to your charity through Altru.\n\n` +
    `Gross donations received: S$${gross}\n` +
    `Altru platform fee (5%):  S$${fee}\n\n` +
    `Donations are paid to you in full and gross — this fee is invoiced separately and is never deducted from any donation.\n\n` +
    `View your statement and disbursement history:\n${opts.portalUrl}\n\n` +
    `Our finance team will follow up with settlement details for the S$${fee} fee.\n\n` +
    `Issued by Altru Asia Pte Ltd — commercial fund-raiser under the Charities Act 1994.\n— Altru`;

  const html = wrap(
    `<h2 style="color:${PRIMARY};">Platform Fee Invoice — ${escapeHtml(opts.periodMonth)}</h2>` +
    `<p>Dear ${escapeHtml(opts.charityName)} Finance Team,</p>` +
    `<p>During <strong>${escapeHtml(opts.periodMonth)}</strong>, <strong>${opts.giftCount}</strong> wedding gift(s) routed donations to your charity through Altru.</p>` +
    `<table style="width:100%;border-collapse:collapse;margin:1.25rem 0;">` +
      `<tr><td style="padding:0.5rem 0.75rem;background:#F9FAFB;">Gross donations received</td><td style="padding:0.5rem 0.75rem;text-align:right;font-weight:700;">S$${gross}</td></tr>` +
      `<tr><td style="padding:0.5rem 0.75rem;background:#FEF3C7;">Altru platform fee (5%)</td><td style="padding:0.5rem 0.75rem;text-align:right;font-weight:700;">S$${fee}</td></tr>` +
    `</table>` +
    `<p style="font-size:0.85rem;color:#8A5C5C;">Donations are paid to you in full and gross. This 5% fee is invoiced separately and is never deducted from a donation.</p>` +
    `<p><a href="${escapeAttr(opts.portalUrl)}" style="display:inline-block;background:${PRIMARY};color:white;padding:0.75rem 1.4rem;border-radius:8px;text-decoration:none;font-weight:700;">View your Altru statement →</a></p>`
  );

  return { subject: `Altru platform fee invoice — ${opts.charityName} — ${opts.periodMonth}`, html, text };
}

// ── Shared HTML wrapper ────────────────────────────────────────────────────
function wrap(content: string): string {
  return (
    `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#2D1010;line-height:1.6;">` +
    `<div style="background:${PRIMARY};padding:1rem 1.5rem;border-radius:8px 8px 0 0;">` +
      `<span style="color:white;font-size:1.1rem;font-weight:800;">🧧 Altru</span>` +
    `</div>` +
    `<div style="background:white;padding:1.5rem;border:1px solid #F5DADA;border-top:none;border-radius:0 0 8px 8px;">` +
      content +
      `<p style="margin-top:2rem;font-size:0.8rem;color:#8A5C5C;">` +
        `Altru Asia Pte Ltd · Singapore · ` +
        `<a href="https://altru.asia/privacy.html" style="color:#8A5C5C;">Privacy Policy</a> · ` +
        `<a href="https://altru.asia/terms.html" style="color:#8A5C5C;">Terms</a>` +
      `</p>` +
    `</div>`+
    `</div>`
  );
}

// ── Format cents as decimal string (e.g. 38800 → "388.00") ──────────────
function fmt(cents: number): string {
  return (cents / 100).toFixed(2);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(s: string): string {
  return escapeHtml(s);
}

# Magic-Link Auth (Supabase + Resend)

Passwordless email sign-in. User submits email → receives a 6-digit code from your custom-domain sender → enters code → lands authenticated. (Supabase's `signInWithOtp` + `verifyOtp({ type: 'email' })` flow — "magic link" is the umbrella name, but the actual UX is type-the-code.) A Postgres allowlist hook enforces an email-domain whitelist so only known partners can complete signup.

## What you get

- Zero-password UX (no "forgot password" support burden).
- Custom-domain sender (e.g., `tender@yourdomain.com`) via Resend SMTP.
- Email-domain allowlist enforced at the database layer (not application layer — can't be bypassed by a malformed client).

## When to use

- Gated tools for known partners (you have an allowlist of email domains).
- Internal staff tools (allowlist = your own company domain).
- B2B tools where signup must be invitation-driven.

## When to skip

- True public signup needed → use Supabase Auth + social providers instead.
- You can't verify a sender domain in Resend (e.g., shared free domain).
- You need <10s end-to-end sign-in (magic-link round-trip via email is too slow for some flows).

## Wire-up steps

1. Create a Supabase project. Note the Project URL and anon key.
2. In Supabase Auth settings, set the redirect URL to your deployed origin's callback page.
3. Connect Resend as the SMTP provider in Supabase Auth → SMTP Settings.
4. Verify your sender domain in Resend (SPF + DKIM DNS records). Wait for "verified" status before first send.
5. Run the SQL trigger from snippet.html (the `before-user-created` function) against your Supabase Postgres.
6. Paste the HTML + JS from snippet.html into your sign-in page.

## Common pitfalls

See `bba-supabase-silent-public` and `bba-resend-dns-unverified` on the Pitfalls wall.

## Past uses

- **elitez-ai-tender-creator** (tender.elitezaviation.com — live, gated by this exact recipe)
- **sp-wsg-corenet** (FastAPI backend calls the same Supabase Auth flow from server-side)
- **Elitez-ESOP** (migration in progress)

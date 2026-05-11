# Example use — elitez-ai-tender-creator

The Elitez AI Tender Creator gates its 4-step proposal generator behind this exact recipe.

## Configuration in production

- Supabase Auth + Resend SMTP from `tender@elitezaviation.com`.
- `before-user-created` Postgres hook whitelists `elitez.asia` and `dhc.com.sg` domains.
- Anyone outside those domains gets rejected at user-creation time even if the magic-link email arrives.

## Why this matters

Without the database-layer hook, a client-side `signInWithOtp({ email })` call still creates the user row when the user clicks the magic link. The allowlist must run in Postgres, before insert, to be enforceable. App-layer checks are guidance, not enforcement.

## The deploy

CF Pages, deployed manually via `wrangler pages deploy` (no Git provider connected — see pitfall `bba-cf-pages-no-autodeploy`).

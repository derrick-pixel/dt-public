# Week 1 Setup — Local + Cloudflare bring-up

This is the runbook to take the Week 1 scaffold from a fresh clone to a working `wrangler dev` and a Worker deployed to production with D1.

Time: ~30 minutes if Cloudflare account and HitPay account already exist.

---

## 0 · Prerequisites

- Node.js ≥ 20
- A Cloudflare account with Workers Paid plan ($5/mo) — needed for D1 production.
- A Resend account with a verified `altru.asia` domain (for sending magic-link emails).
- (Later weeks) HitPay merchant account, Twilio account.

---

## 1 · Install dependencies

```bash
npm install
```

This installs `wrangler`, `typescript`, and `@cloudflare/workers-types` from `package.json`. No runtime dependencies — the Worker uses only Web APIs and `fetch`.

---

## 2 · Authenticate wrangler

```bash
npx wrangler login
```

Browser flow; sign in with the Cloudflare account that owns `altru.asia`.

---

## 3 · Create the D1 database

```bash
npm run db:create
```

Output will include a `database_id`. **Copy this id and paste it into `wrangler.jsonc`** at `d1_databases[0].database_id`, replacing the `TODO_run_wrangler_d1_create_altru_THEN_PASTE_ID_HERE` placeholder.

Commit the updated `wrangler.jsonc`.

---

## 4 · Apply migrations

```bash
# Against the local D1 used by `wrangler dev`:
npm run db:migrate:local

# Against the production D1:
npm run db:migrate:remote
```

Verify with:

```bash
npm run db:list:local   # or :remote
```

You should see the eleven tables from `migrations/0001_initial.sql` plus the three rows in `charities` from `migrations/0002_charity_seed.sql`.

---

## 5 · Set the Worker secrets

```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put HITPAY_API_KEY              # placeholder ok until Week 3
npx wrangler secret put HITPAY_WEBHOOK_SECRET       # placeholder ok until Week 3
npx wrangler secret put NRIC_ENCRYPTION_KEY         # 32 random bytes, base64
npx wrangler secret put SESSION_HMAC_SECRET         # random 32 bytes, hex ok
# Week 2 (SMS):
npx wrangler secret put TWILIO_ACCOUNT_SID          # placeholder ok in dev (SMS stub logs to console)
npx wrangler secret put TWILIO_AUTH_TOKEN
npx wrangler secret put TWILIO_FROM_NUMBER          # E.164 sender, e.g. +6581234567
```

Generate the keys:

```bash
# 32-byte base64 (for NRIC_ENCRYPTION_KEY):
openssl rand -base64 32

# 32-byte hex (for SESSION_HMAC_SECRET):
openssl rand -hex 32
```

For local development, mirror these into `.dev.vars` (gitignored). Example:

```
RESEND_API_KEY=re_yourkey
HITPAY_API_KEY=placeholder
HITPAY_WEBHOOK_SECRET=placeholder
NRIC_ENCRYPTION_KEY=placeholder_base64
SESSION_HMAC_SECRET=placeholder_hex
```

---

## 6 · Run locally

```bash
npm run dev
```

Wrangler will serve the static site **and** the Worker at `http://localhost:8787`. Visit `http://localhost:8787/charities.html` — should render. Visit `http://localhost:8787/api/wedding/create` — should return 405 (no route for GET).

Try a registration end-to-end:

```bash
curl -X POST http://localhost:8787/api/wedding/create \
  -H 'Content-Type: application/json' \
  -d '{
    "path": "A",
    "couple_names": ["Darren", "Priya"],
    "wedding_date": "2026-06-14",
    "primary_email": "you@example.com",
    "primary_mobile": "+6591234567",
    "charities": ["singapore-cancer-society"]
  }'
```

You should get a wedding+couple back, and a magic-link email in your inbox (or in Resend's dashboard if your domain isn't fully verified yet).

Click the magic link → it should redirect to `/couple.html` with a session cookie set.

---

## 7 · Deploy to production

```bash
npm run deploy
```

This bundles `src/worker.ts`, applies the `.assetsignore` filter to the static assets, and ships everything to Cloudflare. Migrations need to be applied separately via `npm run db:migrate:remote`.

After deploy:
- Verify static pages still serve: visit `https://altru.asia/charities.html`.
- Verify the API is reachable: `curl -X POST https://altru.asia/api/auth/magic-link/request -H 'Content-Type: application/json' -d '{"email":"missing@example.com"}'` should return `{"ok":true}` (no PII leak even on miss).
- Tail logs: `npm run tail`.

---

## 8 · Demo gate — Week 1 done

You are at the Week 1 demo gate (`/docs/stage2-build-plan.md` §10) when **all** of the below are true:

- [ ] `wrangler dev` serves both static assets and `/api/*` routes locally.
- [ ] D1 migrations apply cleanly to both local and prod databases.
- [ ] `POST /api/wedding/create` with `path: "A"` creates a wedding + couple row and queues a magic-link email.
- [ ] Clicking the magic-link URL sets an `altru_session` cookie and redirects to `/couple.html`.
- [ ] `audit_log` has rows for `wedding.created` and `auth.session.created`.

When all five are checked, Week 1 is shipped; Week 2 (SMS OTP, NRIC capture, dashboard UI) begins.

---

## 9 · Known TODOs at the end of Week 1

- The dashboard at `/couple.html` is still the demo `altru_data` localStorage scaffold — it doesn't yet read from `/api/couple/me`. Replaced in Week 4 / 8.
- The `couple` table has no `partner2` row created at registration — added in Week 2 via the add-partner flow.
- No SMS OTP yet — Week 2.
- No NRIC capture, no charity selection UI changes — Week 2.
- No gift flow — Week 3.
- The `created_by='guest'` Path B branch returns the wedding but the claim-link email is not yet sent — Week 5.

All deliberate. Week 1 establishes the auth + persistence backbone.

# Elitez ESOP — backend

Cloudflare Worker + D1 database. Hosts the append-only event ledger that powers
multi-user state. Identity is enforced by Cloudflare Access (JWT validated
inside the Worker too).

## Architecture

```
Browser  ──→  esop.derrickteo.com  ──→  Cloudflare Access (auth gate)
                                  ↓
                    ┌─────────────┴─────────────┐
                    │                           │
                Static assets               /api/* → this Worker
                (Pages or Tunnel)                 ↓
                                              D1 database
                                              (events table)
```

## One-time setup

```bash
# from the backend/ folder
cd /Users/derrickteo/codings/Elitez-ESOP/backend

# 1. Install Wrangler if not already
npm install -g wrangler

# 2. Log in (opens browser)
wrangler login

# 3. Create the D1 database — it prints a database_id
wrangler d1 create elitez-esop-db

# 4. Paste the printed database_id into wrangler.toml, replacing
#    REPLACE_WITH_D1_ID_AFTER_CREATE

# 5. Apply the schema (both local + remote)
wrangler d1 execute elitez-esop-db --remote --file=./schema.sql
wrangler d1 execute elitez-esop-db --local  --file=./schema.sql

# 6. Update wrangler.toml CF_ACCESS_AUD with your Application Audience tag
#    (Cloudflare → Zero Trust → Access → Applications → Elitez ESOP →
#     Overview → Application Audience (AUD) Tag)

# 7. Deploy the Worker
wrangler deploy

# 8. In Cloudflare dashboard:
#    Workers & Pages → elitez-esop-api → Triggers → Routes → Add route:
#       Route:  esop.derrickteo.com/api/*
#       Zone:   derrickteo.com
```

## Frontend integration

After the Worker is deployed and routed at `esop.derrickteo.com/api/*`, tell
the static frontend to use it. Add this to the top of `index.html`,
`portal.html`, `admin.html`, `committee.html`, `trading.html`, `scheme.html`,
**before** any other `<script>` tag:

```html
<script>
  window.ESOP_CONFIG = { backend_url: "https://esop.derrickteo.com" };
</script>
```

The frontend's `store.js` detects `ESOP_CONFIG.backend_url` and:
- Hydrates events from `GET /api/events` on page load
- Sends every `emit()` to `POST /api/events`
- Subscribes to `GET /api/events/sse` for real-time updates from other users
- Falls back to localStorage if the API is unreachable (so the demo still works)

Without `ESOP_CONFIG.backend_url` set, the platform behaves exactly as the
single-user demo (state in localStorage only).

## Audit

```bash
# Verify the entire event chain — checks every prev_hash and recomputed hash
curl https://esop.derrickteo.com/api/audit/validate \
  --cookie "$(... your CF Access cookie ...)"

# Backup the full ledger as a downloadable JSON
curl https://esop.derrickteo.com/api/backup -L \
  --cookie "$(...)" -o elitez-esop-backup.json
```

In production, schedule a daily backup with a Cron Trigger that POSTs to
your storage of choice (R2, S3, etc.).

## Identity

- The Worker reads `cf-access-jwt-assertion` (or the `CF_Authorization`
  cookie) and validates the signature against the team JWKS.
- Email → role mapping is in `wrangler.toml` `[vars]`. Committee emails are
  hard-coded; everyone else who Access lets through is treated as a
  holder. Holder identity (email → holder_id) is enforced in
  `worker.js handleAppendEvent` — this currently trusts the email but
  in production should mirror `data.js`'s holder list server-side.

## Costs

- D1 free tier: 5GB storage, 5M reads/day, 100k writes/day — Elitez fits.
- Workers free tier: 100k requests/day. With 28 holders + 5 committee, daily
  pageloads + emits will be well under this.
- Cloudflare Access: free up to 50 seats.

Total monthly cost: **S$0** at this scale.

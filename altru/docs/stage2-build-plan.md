# Altru · Stage 2 Build Plan

**Status:** Founder-confirmed scope, ready to execute · **Last updated:** 13 May 2026

This is the executable plan for the smallest backend that runs Altru for real. It implements the design locked in `/docs/transactions-and-accounts.md` (Path A + Path B, light sanctions check, one-partner-enough operation, etc.) and uses the stack locked in `/docs/stage0-decisions.md` (Cloudflare Workers + D1 + Workers Cron + HitPay + Resend).

Read order: §1 goals → §3 schema → §4 routes → §5 HitPay → §7 cron → §10 week plan.

---

## 1 · Goals and non-goals

**Goals**
- Run one wedding end-to-end (Path A or Path B) with real money through HitPay → Altru escrow → IPC charity UEN.
- Honour the 14-day couple-authorisation window with reliable auto-refund.
- Generate monthly remittance statements and Altru tax invoices to partner charities.
- Persist every state transition in an immutable audit log with 5-year retention.

**Non-goals at Stage 2**
- Native mobile apps. Mobile-web responsive only.
- Multi-language. English only at launch.
- Vendor / wedding-planner portal (Path C). Deferred to Phase 3.
- In-platform donor accounts. Donors are unauthenticated and remain so.
- Couple-to-couple gifting between weddings.
- Advanced analytics dashboards. Operator gets read-only audit-log views; analytics is post-launch.

**Quality bars**
- Lighthouse mobile ≥ 90 on every page.
- Every state transition logged, signed, and recoverable.
- HitPay webhook is idempotent (replay-safe).
- Cron jobs are idempotent (re-run-safe).
- No `innerHTML =` patterns (project hook).
- All money handled in **cents (integer)**, never floats.

---

## 2 · Module layout

```
src/
  worker.ts                # Workers fetch + scheduled entry
  router.ts                # itty-router or hand-rolled match
  routes/
    wedding.ts             # /api/wedding/*
    couple.ts              # /api/couple/*
    gift.ts                # /api/gift/*
    auth.ts                # /api/auth/*
    charity.ts             # /api/charity/*
    admin.ts               # /api/admin/*
    hitpay.ts              # /api/hitpay/webhook
  services/
    auth.ts                # magic-link, OTP, session tokens
    hitpay.ts              # HitPay API client + webhook verify
    sms.ts                 # SMS provider abstraction (Twilio default)
    email.ts               # Resend client + template renderer
    sanctions.ts           # MAS-list name match
    encryption.ts          # AES-256-GCM column encryption for NRIC
    audit.ts               # writes to audit_log
    state.ts               # gift state-machine transitions
  models/                  # thin data-access objects
    wedding.ts
    couple.ts
    gift.ts
    charity.ts
    disbursement.ts
    invoice.ts
  cron/
    auto_refund.ts
    disbursement.ts
    invoice.ts
    retention.ts
  lib/
    id.ts                  # ULID generator
    time.ts                # SGT helpers; never trust client clocks
    validation.ts          # zod-style validators
    money.ts               # cents math
  templates/
    email/                 # MJML or plain HTML
    sms/                   # short copy
  migrations/
    0001_initial.sql
    0002_charity_seed.sql
    ... (one file per migration)
```

Frontend stays as the existing static HTML pages, progressively enhanced with `fetch` calls to the API. No SPA framework.

---

## 3 · D1 schema — migration 0001_initial.sql

```sql
-- Migration 0001: initial schema for Altru platform
-- D1 / SQLite syntax. Money in cents (INTEGER). Times in unix seconds.

CREATE TABLE IF NOT EXISTS weddings (
  id            TEXT    PRIMARY KEY,
  slug          TEXT    NOT NULL UNIQUE,
  wedding_date  TEXT    NOT NULL,           -- ISO 8601 (YYYY-MM-DD)
  status        TEXT    NOT NULL
                CHECK (status IN ('pending_couple_claim','active','closed','past','disputed')),
  default_split_personal_pct INTEGER NOT NULL DEFAULT 0,
  created_by    TEXT    NOT NULL CHECK (created_by IN ('couple','guest')),
  created_at    INTEGER NOT NULL,
  claimed_at    INTEGER,
  closed_at     INTEGER
);
CREATE INDEX IF NOT EXISTS idx_weddings_status ON weddings(status);
CREATE INDEX IF NOT EXISTS idx_weddings_date   ON weddings(wedding_date);

CREATE TABLE IF NOT EXISTS couples (
  id                   TEXT    PRIMARY KEY,
  wedding_id           TEXT    NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  display_name         TEXT    NOT NULL,
  role                 TEXT    NOT NULL CHECK (role IN ('partner1','partner2')),
  email                TEXT    NOT NULL,
  mobile               TEXT    NOT NULL,
  email_verified_at    INTEGER,
  mobile_verified_at   INTEGER,
  nric_encrypted       TEXT,              -- AES-256-GCM ciphertext, base64
  nric_consented_at    INTEGER,
  iras_donor_share_pct INTEGER NOT NULL DEFAULT 100,  -- 0..100
  created_at           INTEGER NOT NULL,
  UNIQUE(wedding_id, role)
);
CREATE INDEX IF NOT EXISTS idx_couples_email   ON couples(email);
CREATE INDEX IF NOT EXISTS idx_couples_wedding ON couples(wedding_id);

CREATE TABLE IF NOT EXISTS charities (
  id            TEXT    PRIMARY KEY,          -- 'singapore-cancer-society'
  name          TEXT    NOT NULL,
  uen           TEXT    NOT NULL,
  ipc_no        TEXT    NOT NULL,
  paynow_uen    TEXT    NOT NULL,
  status        TEXT    NOT NULL
                CHECK (status IN ('confirmed','pending','paused','withdrawn')),
  dpo_email     TEXT,
  finance_email TEXT,
  brand_kit_url TEXT,
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS wedding_charities (
  wedding_id TEXT    NOT NULL REFERENCES weddings(id)  ON DELETE CASCADE,
  charity_id TEXT    NOT NULL REFERENCES charities(id) ON DELETE RESTRICT,
  share_pct  INTEGER NOT NULL DEFAULT 100,    -- default suggested split
  added_at   INTEGER NOT NULL,
  removed_at INTEGER,
  PRIMARY KEY (wedding_id, charity_id)
);

CREATE TABLE IF NOT EXISTS gifts (
  id                       TEXT    PRIMARY KEY,
  wedding_id               TEXT    NOT NULL REFERENCES weddings(id),
  guest_name               TEXT    NOT NULL,
  guest_mobile             TEXT    NOT NULL,
  guest_email              TEXT,
  gift_amount_cents        INTEGER NOT NULL,
  personal_portion_cents   INTEGER NOT NULL,
  charity_portions_json    TEXT    NOT NULL,    -- JSON: [{charity_id, amount_cents}]
  state                    TEXT    NOT NULL
                           CHECK (state IN ('pending_claim','pending','authorised',
                                            'released','auto_refunded','refunded',
                                            'failed','disputed')),
  state_changed_at         INTEGER NOT NULL,
  payment_ref              TEXT,                -- HitPay payment_request_id
  payment_succeeded_at     INTEGER,
  refund_ref               TEXT,                -- HitPay refund_id (if refunded)
  scheduled_auto_refund_at INTEGER NOT NULL,    -- payment_succeeded_at + 14d
  message_to_couple        TEXT,
  created_at               INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_gifts_wedding     ON gifts(wedding_id);
CREATE INDEX IF NOT EXISTS idx_gifts_state       ON gifts(state);
CREATE INDEX IF NOT EXISTS idx_gifts_auto_refund ON gifts(scheduled_auto_refund_at);
CREATE INDEX IF NOT EXISTS idx_gifts_payment_ref ON gifts(payment_ref);

CREATE TABLE IF NOT EXISTS disbursements (
  id                TEXT    PRIMARY KEY,
  wedding_id        TEXT    NOT NULL,
  beneficiary_type  TEXT    NOT NULL CHECK (beneficiary_type IN ('charity','couple')),
  charity_id        TEXT,                       -- NULL if beneficiary is couple
  beneficiary_uen   TEXT    NOT NULL,
  amount_cents      INTEGER NOT NULL,
  gift_ids_json     TEXT    NOT NULL,
  bank_ref          TEXT,
  status            TEXT    NOT NULL CHECK (status IN ('queued','sent','confirmed','failed')),
  queued_at         INTEGER NOT NULL,
  sent_at           INTEGER,
  confirmed_at      INTEGER
);
CREATE INDEX IF NOT EXISTS idx_disbursements_wedding ON disbursements(wedding_id);
CREATE INDEX IF NOT EXISTS idx_disbursements_status  ON disbursements(status);

CREATE TABLE IF NOT EXISTS invoices (
  id                          TEXT    PRIMARY KEY,
  charity_id                  TEXT    NOT NULL REFERENCES charities(id),
  period_month                TEXT    NOT NULL,      -- 'YYYY-MM'
  gift_count                  INTEGER NOT NULL,
  gross_charity_amount_cents  INTEGER NOT NULL,
  altru_fee_cents             INTEGER NOT NULL,
  pdf_r2_key                  TEXT,                  -- R2 storage key
  status                      TEXT    NOT NULL CHECK (status IN ('issued','paid','overdue')),
  issued_at                   INTEGER NOT NULL,
  paid_at                     INTEGER,
  UNIQUE (charity_id, period_month)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  ts           INTEGER NOT NULL,
  actor_type   TEXT    NOT NULL
               CHECK (actor_type IN ('couple','guest','system','operator','charity')),
  actor_ref    TEXT,
  event_type   TEXT    NOT NULL,
  entity_type  TEXT    NOT NULL,
  entity_id    TEXT    NOT NULL,
  payload_json TEXT
);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_ts     ON audit_log(ts);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash    TEXT    PRIMARY KEY,    -- SHA-256 of opaque session token
  couple_id     TEXT    NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  created_at    INTEGER NOT NULL,
  last_used_at  INTEGER NOT NULL,
  expires_at    INTEGER NOT NULL,
  user_agent    TEXT,
  ip_address    TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessions_couple  ON sessions(couple_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS otp_codes (
  code_hash     TEXT    PRIMARY KEY,    -- SHA-256 of OTP code
  purpose       TEXT    NOT NULL CHECK (purpose IN
                ('magic_link','mobile_verify','authorise_action','claim_link')),
  subject_type  TEXT    NOT NULL,
  subject_ref   TEXT    NOT NULL,
  created_at    INTEGER NOT NULL,
  expires_at    INTEGER NOT NULL,
  consumed_at   INTEGER,
  attempts      INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_subject ON otp_codes(subject_type, subject_ref);

CREATE TABLE IF NOT EXISTS sanctions_checks (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type   TEXT    NOT NULL,         -- 'couple' or 'charity'
  entity_id     TEXT    NOT NULL,
  name_checked  TEXT    NOT NULL,
  list_version  TEXT    NOT NULL,
  result        TEXT    NOT NULL CHECK (result IN ('pass','review','fail')),
  checked_at    INTEGER NOT NULL,
  payload_json  TEXT
);
CREATE INDEX IF NOT EXISTS idx_sanctions_entity ON sanctions_checks(entity_type, entity_id);
```

Migration 0002 seeds the three confirmed charities from `js/app.js` into the `charities` table — UEN, IPC No, PayNow UEN, dpo/finance emails. Migration 0003 adds the slug denylist.

---

## 4 · Workers API — every route

All routes return JSON. Errors use HTTP status + `{error: {code, message}}`. Auth = couple session cookie (HTTP-only, SameSite=Strict).

### Public routes (no auth)

| Method · Path | Purpose | Body / Query | Returns |
|---|---|---|---|
| `GET  /api/charity/list` | Partner charities | — | `[{id, name, ipc_no, brand_kit_url, ...}]` |
| `GET  /api/wedding/by-slug/:slug` | Public wedding view | — | `{wedding, charities, couple_display_names}` |
| `GET  /api/wedding/search?q=...&date=...` | Donor search | `q`, `date` (both required) | `[{wedding}]` (max 5) |
| `POST /api/wedding/create` | Path A or Path B creation | `{path: 'A' \| 'B', wedding_date, slug?, couple_names, primary_email, primary_mobile, charities?, default_split?}` | `{wedding, couple, claim_required: bool}` |
| `POST /api/wedding/:id/claim` | Couple claims a guest-created wedding | `{verify_email_token, name_confirmation, charity_selection, nric, mobile_otp}` | `{wedding, session_set: true}` |
| `POST /api/gift/create` | Donor initiates a gift | `{wedding_id, guest_name, guest_mobile, guest_email?, gift_amount_cents, personal_portion_cents, charity_portions, message?}` | `{gift_id, hitpay_payment_url, idempotency_key}` |
| `GET  /api/gift/:id/refund-link/:token` | Donor refund link from confirmation email | path param token | `{ok: true}` on success |
| `POST /api/auth/magic-link/request` | Couple requests login email | `{email}` | `{ok: true}` (no PII leak) |
| `GET  /api/auth/magic-link/verify` | Click-through from email | `?token=...` | redirect to `/couple.html` with session cookie |
| `POST /api/hitpay/webhook` | HitPay payment events | HitPay payload | `200` if accepted, `400` on signature fail |

### Couple-authenticated routes

| Method · Path | Purpose | Body | Returns |
|---|---|---|---|
| `GET  /api/couple/me` | Current session info | — | `{couple, wedding, partner, sessions}` |
| `POST /api/couple/update` | Update profile | partial couple object | `{couple}` |
| `POST /api/couple/add-partner` | Invite partner 2 | `{name, email, mobile}` | `{ok}` (sends magic link to partner 2) |
| `POST /api/couple/verify-mobile` | Submit SMS OTP | `{otp}` | `{verified: true}` |
| `POST /api/couple/set-nric` | Provide NRIC | `{nric, share_pct?}` | `{ok}` |
| `POST /api/couple/charity-selection` | Choose charities | `{charity_ids: [...]}` | `{wedding}` |
| `POST /api/couple/close-wedding` | Close account | `{reason?}` | `{ok}` (queues auto-refunds for pending) |
| `GET  /api/couple/gifts` | List of gifts | `?state=...` | `[{gift, charity_breakdown}]` |
| `POST /api/gift/:id/authorise` | Authorise release | `{otp_step_up?}` | `{gift}` (state=`authorised`) |
| `POST /api/gift/:id/dispute` | Flag for operator | `{reason}` | `{gift}` (state=`disputed`) |

### Operator-authenticated routes (Cloudflare Access on `/api/admin/*`)

| Method · Path | Purpose |
|---|---|
| `GET  /api/admin/weddings` | List with filters |
| `GET  /api/admin/audit-log/:entity_type/:entity_id` | Per-entity audit trail |
| `POST /api/admin/gift/:id/resolve-dispute` | Resolve a dispute |
| `POST /api/admin/wedding/:id/verify-manually` | Force-verify (with audit reason) |
| `POST /api/admin/charity` | CRUD charities |
| `POST /api/admin/cron/:job/run` | Dry-run / force-run a cron job (idempotent) |

### Validation rules at the route layer

- Wedding date: between today − 30 days and today + 730 days.
- Slug: `[a-z0-9-]{3,64}`, denylist check, uniqueness check.
- NRIC: regex `^[STFG]\d{7}[A-Z]$`, checksum-verified (use the published algorithm).
- Mobile: E.164 starting `+65` for Singapore; soft-permit other countries with warning.
- Email: RFC 5322 light validation (no full DNS lookup at request time).
- Money: positive integers only; max single gift S$50,000 (5,000,000 cents).
- Charity portions sum: must equal `gift_amount_cents - personal_portion_cents`.

---

## 5 · HitPay integration

We treat HitPay as the source of truth for payment state. Altru reconciles by listening to HitPay webhooks and never relies on the client to report success.

### 5.1 Payment-request creation (server side)

When a donor confirms a gift on `/donor`, the Worker:
1. Inserts a row in `gifts` with `state='pending'` (or `pending_claim` under Path B), `payment_ref=NULL` initially.
2. Calls HitPay `POST /v1/payment-requests` with `amount`, `currency='SGD'`, `email=guest_email`, `purpose='Altru gift'`, `reference_number=<gift_id>`, `redirect_url=<altru-thanks>`, `webhook=<altru-webhook>`.
3. Updates the row with `payment_ref` from the response.
4. Returns the HitPay `url` to the donor for redirect.

The Worker never sees the donor's PayNow / card data — HitPay handles it.

### 5.2 Webhook handler — POST /api/hitpay/webhook

HitPay sends a webhook with `payment_request_id`, `status`, `amount`, `currency`, `payment_method`, plus a signature header.

**Verify-first-then-process:**
1. Compute HMAC-SHA256 over the raw request body using `HITPAY_WEBHOOK_SECRET`.
2. Compare with the `hitpay-signature` header in constant time. Reject if mismatch.
3. Look up the gift by `payment_ref`. If not found, log and return 200 (idempotent).
4. Branch by status:
   - `completed`: if gift state is `pending` (Path A) → leave in `pending`, set `payment_succeeded_at`, compute `scheduled_auto_refund_at = payment_succeeded_at + 14*86400`. Send "gift received" email/SMS to couple. If Path B (`pending_claim`), additionally send the claim-link to the couple.
   - `failed`: set `state='failed'`. Notify guest of failure with retry link.
   - `refunded`: set `state='refunded'` or `'auto_refunded'` based on `refund_ref` source. Notify guest.
5. Write to `audit_log` with `event_type='hitpay.webhook.<status>'`.
6. Return `200`.

**Idempotency**: if the same webhook event arrives twice, the state-machine guards (in `services/state.ts`) refuse a no-op transition. Always returns 200 to avoid HitPay retry storms.

### 5.3 Refund API (server side)

To refund: call HitPay `POST /v1/refund` with `payment_id`. Store the `refund_id` as `refund_ref`. State transitions are driven by the webhook on `refund.succeeded` to avoid double-bookkeeping.

### 5.4 Reconciliation

Daily cron pulls `GET /v1/charges?from=<yesterday>` and reconciles HitPay's view against Altru's `gifts` table. Discrepancies raise to operator. Catches drift if a webhook was missed.

### 5.5 Where we will need to verify against actual HitPay docs at integration time

- Exact webhook payload field names (might be `status` vs `state`, `payment_id` vs `payment_request_id`).
- Whether HitPay supports payment-splitting (would simplify the MAS-posture question — see `/docs/payments-lawyer-brief.md`).
- Webhook retry policy (frequency, max retries).
- Refund finality timing.

These are integration-time tasks for Week 3; not blockers for the surrounding design.

---

## 6 · Magic-link and OTP auth

### Magic link
1. Couple submits email.
2. Worker generates 32-byte random token, stores SHA-256 in `otp_codes` with `purpose='magic_link'`, `subject_ref=<email>`, `expires_at=+15min`.
3. Worker sends email via Resend with link `/api/auth/magic-link/verify?token=<raw>`.
4. Click → Worker looks up by SHA-256 of token, validates not consumed and not expired, marks consumed, finds the matching couple by email, creates a session row, sets HTTP-only cookie `altru_session=<raw_token>`, redirects to `/couple.html`.
5. Session lifetime: 30 days from last use; sliding window updated on every authenticated request.

### Mobile OTP
- 6-digit numeric, generated server-side, SHA-256 stored. Expires 10 minutes. Max 5 attempts before invalidation.
- Sent via SMS provider (default: Twilio; abstracted so we can swap to a Singapore-native like Vonage SMS or MessageBird if pricing favours it).

### Step-up OTP for high-trust actions
- `POST /api/gift/:id/authorise` for large gifts (> S$500) may require a fresh mobile OTP within the last 5 minutes. Configurable threshold.

---

## 7 · Cron jobs

Workers Cron Triggers, configured in `wrangler.jsonc`:

```jsonc
"triggers": {
  "crons": [
    "0 * * * *",     // hourly auto-refund tick
    "0 1 * * *",     // 09:00 SGT daily disbursement
    "0 2 1 * *",     // 10:00 SGT, 1st of month: invoice generation
    "0 3 * * *",     // 11:00 SGT daily retention sweep
    "0 4 * * *"      // 12:00 SGT daily HitPay reconciliation
  ]
}
```

### 7.1 Auto-refund tick (hourly)
```
for gift in gifts where state in ('pending_claim','pending')
                   and scheduled_auto_refund_at <= now():
    issue HitPay refund
    expect webhook to flip state → auto_refunded
```
Idempotent: each refund call carries an idempotency key = `gift_id + 'auto_refund'`.

### 7.2 Disbursement (daily 09:00 SGT)
```
for gift in gifts where state='authorised':
    aggregate by beneficiary (charity_id or couple)
    create one disbursement row per beneficiary
    initiate outgoing PayNow transfer to beneficiary UEN
    on confirmation → flip gift state to 'released'
```

### 7.3 Invoice generation (monthly, 1st 10:00 SGT)
```
for charity in charities where status='confirmed':
    sum released gifts where state_changed_at in last month
    compute altru_fee = round(gross * 0.05)
    generate PDF tax invoice
    store in R2, write invoices row
    email charity finance contact
```

### 7.4 Retention sweep (daily 11:00 SGT)
```
delete sessions where expires_at < now
delete otp_codes where expires_at < now - 7d
purge audit_log entries older than 5 years from EoFY (cold-archive first)
hard-delete weddings in 'pending_couple_claim' state with no claim for 6 months
```

### 7.5 HitPay reconciliation (daily 12:00 SGT)
```
charges = hitpay.list_charges(since=yesterday)
for charge in charges:
    if not exists gifts(payment_ref=charge.id):
        raise discrepancy → operator queue
```

---

## 8 · Secrets and environment

Stored as Workers secrets via `wrangler secret put`:

| Key | Purpose |
|---|---|
| `HITPAY_API_KEY` | merchant API |
| `HITPAY_WEBHOOK_SECRET` | webhook HMAC verification |
| `RESEND_API_KEY` | transactional email |
| `TWILIO_ACCOUNT_SID` | SMS |
| `TWILIO_AUTH_TOKEN` | SMS |
| `TWILIO_FROM_NUMBER` | sender |
| `NRIC_ENCRYPTION_KEY` | 32-byte AES key, base64 |
| `SESSION_HMAC_SECRET` | session-token signing |
| `SANCTIONS_LIST_URL` | MAS-published list endpoint |
| `OPERATOR_NOTIFY_EMAIL` | where dispute alerts go |

Non-secret config in `wrangler.jsonc` env vars:
- `ENV` (`prod` / `staging` / `dev`)
- `PUBLIC_BASE_URL` (`https://altru.asia`)
- `LARGE_GIFT_THRESHOLD_CENTS` (default `50000` = S$500)
- `AUTO_REFUND_WINDOW_DAYS` (default `14`)
- `PLATFORM_FEE_BPS` (default `500` = 5%)

Key rotation: NRIC encryption key rotated annually; session HMAC rotated on suspected compromise (graceful — old sessions invalidated, users re-login).

---

## 9 · Testing strategy

**Unit (Vitest, lightweight)**
- State machine: every legal transition + every illegal transition.
- Money math: cents arithmetic, no float ever appears in computed totals.
- NRIC checksum validation.
- Slug denylist matching.

**Integration (Miniflare or `wrangler dev`)**
- D1 migrations apply cleanly from empty.
- Auth flow end-to-end with stubbed email/SMS.
- HitPay sandbox: payment-request → webhook → state.
- Refund webhook → state.
- Idempotent webhook replay (same payload twice → one effect).

**End-to-end (Playwright)**
- Path A: register → select charity → guest sends gift → authorise → released.
- Path B: guest creates → couple claims → authorise → released.
- 14-day auto-refund: simulate the clock advance, confirm refund triggers.
- Donor mid-window cancel.
- Multi-charity gift split.

**Property tests (fast-check)**
- For any sequence of legal actions, gift state is always a valid state and totals reconcile.

---

## 10 · Week-by-week sequence

### Week 1 — Foundation
- Upgrade `wrangler.jsonc` for D1 + Cron + Secrets.
- Create D1 instance (prod + staging).
- Apply migrations `0001_initial.sql` + `0002_charity_seed.sql`.
- Module skeleton (see §2).
- Auth: magic-link request + verify; sessions.
- Path A registration endpoint (`POST /api/wedding/create`).
- Resend integration: first transactional template (magic link).
- **Demo gate:** can register a wedding and log in as the couple.

### Week 2 — Couple onboarding
- SMS OTP via Twilio + `/api/couple/verify-mobile`.
- NRIC capture + encryption + `/api/couple/set-nric`.
- Charity selection endpoint + UI on `/couple.html`.
- Slug generation + denylist.
- Add-partner flow.
- Sanctions check at registration; failing matches → wedding state `disputed`.
- **Demo gate:** couple fully onboarded; charity selected; sanctioned-name registration is blocked.

### Week 3 — HitPay donor flow
- HitPay sandbox account, webhook URL configured.
- `POST /api/gift/create` → creates HitPay payment-request → returns checkout URL.
- Webhook handler with signature verification.
- Donor flow UI on `/donor.html` (Path A only this week).
- Email/SMS to couple on gift received.
- Donor refund link from confirmation email.
- **Demo gate:** a real test gift can be paid via HitPay sandbox and shows up `pending` in the couple's dashboard.

### Week 4 — Authorisation + auto-refund
- Couple dashboard: pending gifts list, authorise action.
- `POST /api/gift/:id/authorise`.
- Step-up OTP for large gifts.
- Hourly auto-refund cron.
- HitPay refund flow + state transitions on webhook.
- **Demo gate:** authorise → state `authorised`; ignore for 14 simulated days → state `auto_refunded`.

### Week 5 — Path B (guest-led creation)
- `POST /api/wedding/create` Path B branch.
- `pending_claim` state.
- Claim link email + SMS.
- `POST /api/wedding/:id/claim` flow.
- Donor flow UI extension: "can't find your wedding? create one".
- Multi-charity per gift in donor flow.
- **Demo gate:** Path B end-to-end works; couple-never-claims path auto-refunds correctly.

### Week 6 — Disbursement + invoices
- Daily disbursement cron (charity portion via PayNow to UEN; personal portion to couple's nominated bank).
- Monthly invoice generation: PDF via Workers + a minimal HTML→PDF (use a Worker-compatible lib or call out to a small service).
- R2 bucket for invoice PDFs.
- Charity dashboard (read-only): list of disbursements, list of invoices, status.
- **Demo gate:** released gifts produce a real PayNow payout in sandbox; an invoice PDF is generated for the test month.

### Week 7 — Operator tools + sanctions data
- Admin routes behind Cloudflare Access.
- Audit-log query UI.
- Dispute resolution flow.
- Sanctions list ingest (daily refresh from MAS URL).
- Sentry integration for production error tracking.
- **Demo gate:** an operator can investigate a disputed gift end-to-end from the admin surface.

### Week 8 — Hardening + polish
- E2E test plan execution (§9).
- Lighthouse mobile pass on every page.
- WCAG 2.1 AA accessibility sweep.
- Real photography swap-in on public pages.
- Replace the demo data path on `/couple.html` with real D1-backed state (delete `altru_data` localStorage code).
- Set up staging → prod deploy pipeline; document rollback.
- **Demo gate:** ship-ready.

### Week 9 — Soft launch buffer
- Run one friendly real wedding end-to-end.
- Manual reconciliation against bank + HitPay.
- Fix whatever breaks.
- Capture support volume and operator-time-per-incident metrics.
- **Demo gate:** soft launch complete; capture decisions for public launch.

---

## 11 · Definition of done — Stage 2

All of the following are true before Stage 2 is considered complete:

- [ ] Every route in §4 returns appropriate status codes and shapes; documented in a generated OpenAPI file.
- [ ] State machine has zero reachable illegal transitions in the property-test suite.
- [ ] HitPay webhook replay is provably idempotent (same event ×N → same effect ×1).
- [ ] Every cron job has a dry-run mode and writes to `audit_log`.
- [ ] All migrations apply cleanly from empty DB.
- [ ] Lighthouse mobile ≥ 90 on `/`, `/donor`, `/couple`, `/charities`, `/privacy`, `/terms`.
- [ ] E2E test suite passes Path A, Path B, auto-refund, mid-window-cancel, multi-charity.
- [ ] No `innerHTML =` literal anywhere in the codebase.
- [ ] No `console.log` of any PII; structured logger only.
- [ ] All secrets in `wrangler secret`; none in code.
- [ ] Soft launch dry-run executed with one real test wedding and one real test gift through HitPay sandbox.

---

*Reviewer: Derrick Teo. On approval, Week 1 begins.*

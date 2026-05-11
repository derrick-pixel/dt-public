# Backend-Backed App — Data Contract

JSON files and database schemas this archetype produces and consumes. See `/Users/derrickteo/codings/dt-site-creator/FIELD-DICTIONARY.md` for full JSON schemas.

---

## Produces (same as static-informational, plus auth-specific additions)

| File | Owner | Path |
|---|---|---|
| `brief.json` | Agent 1 | `/data/brief.json` |
| `palette.json` | Agent 2 | `/data/palette.json` |
| `sitemap.json` | Agent 3 | `/data/sitemap.json` |
| `design-system.json` | Agent 4 | `/data/design-system.json` |
| `copy.json` | Agent 3 | `/data/copy.json` — includes `pages.auth.*` keys |
| `assets-manifest.json` | Agent 6 | `/data/assets-manifest.json` |
| `qa-report.json` | Agent 7 | `/data/qa-report.json` |

---

## Auth data — Supabase Auth users table

Supabase manages the `auth.users` table internally. Do not add columns directly to it.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key — reference this in all app tables |
| `email` | text | Set at signup; Supabase handles verification |
| `created_at` | timestamptz | Auto-set |
| `updated_at` | timestamptz | Auto-set |
| `raw_user_meta_data` | jsonb | Use this for app-specific user attributes (display name, role, etc.) — do not add columns to `auth.users` |

For app-specific data, create a `public.profiles` table (or equivalent) with a foreign key to `auth.users.id`. This is the standard Supabase pattern and the one RLS policies expect.

---

## Allowlist enforcement — before-user-created hook

The hook contract is a Postgres function that fires before a new user row is inserted into `auth.users`.

```sql
-- Minimum contract. Actual domain list lives in a separate table or config.
CREATE OR REPLACE FUNCTION auth.enforce_email_domain_allowlist()
RETURNS trigger AS $$
DECLARE
  allowed_domains text[] := ARRAY['elitez.asia', 'dhc.com.sg'];
  user_domain text;
BEGIN
  user_domain := split_part(NEW.email, '@', 2);
  IF NOT (user_domain = ANY(allowed_domains)) THEN
    RAISE EXCEPTION 'Email domain % is not on the allowlist', user_domain;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Wire via the Supabase Auth Hook (modern path) or a trigger on `auth.users`. Either way, enforcement happens **before** the row is inserted — not in app-layer code. App-layer domain checks are UX guidance; this function is enforcement.

Store the allowed domains in a `public.email_allowlist` table (not hardcoded in the function) when the list changes more than once per quarter.

---

## Email events — Resend webhooks

Log these events for forensics and deliverability debugging.

```sql
CREATE TABLE public.email_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    text NOT NULL UNIQUE,  -- Resend's event ID
  recipient   text NOT NULL,
  event_type  text NOT NULL,         -- 'sent' | 'delivered' | 'bounced' | 'complained'
  occurred_at timestamptz NOT NULL,
  raw_payload jsonb NOT NULL,        -- full Resend webhook payload for forensics
  created_at  timestamptz DEFAULT now()
);
```

Minimum events to capture: `sent`, `delivered`, `bounced`, `complained`. Wire via Resend's webhook endpoint. Store `raw_payload` in full — you will need it when diagnosing a bounce or complaint.

---

## Health / observability — structured log schema

Every outbound HTTP request and every auth event should log a structured JSON line to stdout. Fly.io and CF Pages aggregate these automatically.

```json
{
  "request_id": "uuid",
  "user_id": "uuid | null",
  "route": "/api/v1/tenders",
  "method": "POST",
  "status": 200,
  "latency_ms": 143,
  "timestamp": "2026-05-11T09:14:22.000Z"
}
```

Minimum required fields per log line:

| Field | Type | Notes |
|---|---|---|
| `request_id` | uuid | Generate at request ingress; propagate through all internal calls |
| `user_id` | uuid or null | null for unauthenticated requests |
| `route` | text | Normalized path (no query params with PII) |
| `method` | text | HTTP verb |
| `status` | int | HTTP response status |
| `latency_ms` | int | Wall-clock ms from request start to response sent |
| `timestamp` | iso8601 | UTC |

Log to stdout in newline-delimited JSON. Do not log to files — containers are ephemeral.

---

## Local mocks contract

When the containerized stack is used, local dev must replace managed services with local equivalents.

| Service | Local mock | Ports | Purpose |
|---|---|---|---|
| Resend (SMTP) | MailHog | SMTP: 1025, UI: 8025 | Captures all outbound email; viewable in browser |
| S3-compatible storage | MinIO | API: 9000, Console: 9001 | Mimics S3 via `aws --endpoint-url http://localhost:9000` |
| Postgres (if self-hosted) | Docker postgres:16 | 5432 (or 5433 if collision) | Local DB; run Alembic migrations before dev |

Tests must use dependency injection or environment flags to swap in these mocks. Never configure a test suite to hit production credentials — not even staging ones.

For Streamlit Cloud stacks (no Docker), local mocks are not applicable. Use `.streamlit/secrets.toml` with dev-environment keys (a separate Supabase project, not the production one).

---

## Minimum viable shapes

The build chain halts if these minimums are missing.

### `brief.json` minimum (backend-backed-app additions)
- `project_name`, `archetype: "backend-backed-app"`, `domain`, `target_geo[]`
- `auth_pattern` — one of: `magic-link-auth-supabase`, `cf-zero-trust-static-admin`
- `persistence` — one of: `supabase-postgres`, `fly-postgres`, `neon` (with adoption note)
- `deploy_target` — one of: `fly`, `cf-pages`, `streamlit-cloud`, `vercel` (with adoption note)

### `copy.json` minimum (backend-backed-app additions)
Beyond the standard global + home fields:
- `pages.auth.sign_in.headline`
- `pages.auth.sign_in.subhead`
- `pages.auth.sign_in.email_label`
- `pages.auth.sign_in.cta_label`
- `pages.auth.check_email.confirmation_message`
- `pages.auth.error.invalid_domain`
- `pages.auth.error.expired_code`
- `pages.auth.session_expired.message`

### Deploy config minimum
At least one of these must be committed:
- `fly.toml` (Fly.io deploys)
- `docker-compose.yml` (containerized local + prod)
- `.streamlit/config.toml` (Streamlit Cloud)
- `supabase/config.toml` (Supabase local dev)

And `.env.example` must exist, list every variable name used in application code, and contain only placeholder values.

---

## Schema evolution

Same rule as static-informational: if this archetype needs a new field, Agent 7 proposes the addition via `qa-report.json.pitfall_proposals[]`. Do NOT silently extend the schema. Schema changes must be approved and merged into `FIELD-DICTIONARY.md` first.

# Backend-Backed App archetype + Production Stack mechanics

**Date:** 2026-05-11
**Status:** Draft (awaiting user review)
**Driver:** Last 2 weeks of shipping work introduced production-stack territory (sp-wsg-corenet, elitez-ai-tender-creator, Elitez-ESOP migration). Existing 5 archetypes pretend backend-backed apps don't exist. This spec adds a 6th archetype and a "Production Stack" mechanic category to fix that.

---

## 1. Problem

dt-site-creator was built around static / client-side patterns:

- 5 archetypes (static-informational, transactional, simulator-educational, game, dashboard-analytics)
- ~22 mechanics, all GitHub-Pages friendly
- "admin-auth-gate" is shared-password dev-grade, not real auth

The README's v2 roadmap penciled in "Supabase / Streamlit mechanics" but never shipped them. Meanwhile, real work crossed the line:

| Project | Stack | Status |
|---|---|---|
| sp-wsg-corenet | FastAPI + Postgres+pgvector + Redis + Resend + Next.js + docker-compose + Fly (backend/cron/staging) | Live |
| elitez-ai-tender-creator | Supabase OTP + Resend + CF Pages + email-domain allowlist hook | Live |
| Elitez-ESOP | Static + localStorage → Supabase (migration in progress) | WIP |
| elitez-lms | Static + mock auth + localStorage (Supabase is a "future phase" per README) | Demo |
| market-tracker, yishun-dorm-pitch | Streamlit + Streamlit Cloud | Live |
| derrickteo.com /xinceai, /aevum, /elix-eor | Cloudflare Zero Trust on static admin paths | Live (Google IdP) |

The methodology archive doesn't reflect this. Claude prompted with dt-site-creator can't reach for Supabase, Fly.io, or Cloudflare Access — they aren't in the library.

## 2. Goals

- Add the 6th archetype **Backend-Backed App** with the standard 5-file contract.
- Add a **Production Stack** mechanic category with 4 integration recipes anchored to actually-shipped projects.
- Honest framing for unshipped-but-evaluated tools (Neon, Upstash, Sentry, Railway, Vercel) — they appear in a repo-only `stack-candidates.md`, never as fake recipes.
- Document real scars as pitfalls (7 new entries).
- Add 4 new showcase entries.

## 3. Non-goals

- Migrating elitez-lms to a real backend (its own project).
- A standalone `/advanced.html` page (would drift from the assembly engine).
- Refactoring existing 5 archetypes.
- Writing full mechanic-per-tool entries for tools that aren't shipped (drift risk dt-site-creator was built to avoid).

## 4. IA changes

### 4.1 New mechanic category

In `dashboard/data/mechanics.json` → `categories[]`:

```json
{
  "id": "production-stack",
  "title": "Production Stack",
  "sub": "Servers, real auth, observability — when localStorage isn't enough.",
  "icon": "🏗️"
}
```

### 4.2 New archetype folder

`archetypes/backend-backed-app/` with the standard 5-file contract plus one extension:

```
archetypes/backend-backed-app/
  CLAUDE.md              # design rules
  prompt.md              # boilerplate "build me a backend-backed app"
  examples.md            # 3 anchors (corenet, tender, esop)
  mechanic-fit.md        # fits matrix for new + existing mechanics
  pitfalls.md            # archetype-specific scars
  stack-candidates.md    # repo-only: Neon/Upstash/Sentry/Railway/Vercel evaluator notes
```

`stack-candidates.md` is the one departure from the 5-file contract. It is **repo-only reference** — not in the Assembly engine's fetch list (Assembly fetches `CLAUDE.md`, mechanic `snippet.html`, and pitfalls), and not rendered as a public HTML page. It exists for humans or Claude reading the archetype folder directly when evaluating "should I reach for Neon here?", to keep that judgment honest without broadcasting unshipped tools on the public site.

### 4.3 Nav stays at 6 pages

No new top-level pages. Mechanics page gets a new category section header; Archetypes page gets a 6th tile. The Assembly engine stays the single front door.

## 5. The four integration recipes

Each is one mechanic with the standard 5-file contract (`snippet.html`, `README.md`, `details.plain` / `when_use` / `when_skip` in mechanics.json, `preview.jpg`).

### 5.1 `magic-link-auth-supabase` 🪄

**What:** Email OTP / magic-link sign-in via Supabase Auth, delivered through Resend SMTP, with a `before-user-created` Postgres hook that enforces an email-domain allowlist.

**Anchors:** elitez-ai-tender-creator (live), sp-wsg-corenet (live magic-link via FastAPI), Elitez-ESOP (migrating).

**When use:** gated tools for known partners; you have an allowlist of email domains; you want zero-password UX.

**When skip:** true public signup needed (use Supabase Auth + social providers instead); you can't verify a sender domain in Resend; you need <10s end-to-end sign-in (magic-link round-trip is too slow for some flows).

**Pitfalls baked in:**

- Resend sender domain DNS verification (SPF + DKIM) must complete before first send.
- The `before-user-created` hook is **mandatory**, not optional — without it, the allowlist is a comment.
- Magic-link callback URL must match exactly across Supabase config + Resend template + your deployed origin.

### 5.2 `cf-zero-trust-static-admin` 🛡️

**What:** Cloudflare Access app + Google OAuth IdP gating specific paths on an otherwise-static site. Zero Trust Free tier.

**Anchors:** derrickteo.com `/xinceai`, `/aevum`, `/elix-eor` admin paths.

**When use:** small set of known admins; underlying site is static; you don't want app-level auth machinery.

**When skip:** you need per-user state inside the app (use Supabase Auth); you need fine-grained RBAC; users are outside Google's IdP reach.

**Honest scar baked in:** OTP delivery via CF Access is unreliable for some SG email providers — start with Google OAuth IdP, not OTP. Drawn directly from project_cloudflare_access.md.

### 5.3 `containerized-fastapi-fly` 🐳

**What:** docker-compose local stack (Postgres+pgvector, Redis, MinIO = S3-local, MailHog = SMTP-local) + FastAPI backend + multi-service Fly.io deploy (`fly.backend.toml`, `fly.cron.toml`, `fly.staging.toml`).

**Anchor:** sp-wsg-corenet.

**When use:** real backend needed; jobs/queues; pgvector for embeddings; you can swallow Docker overhead.

**When skip:** no server logic actually required (most marketing sites); one developer who'd be faster shipping Streamlit; you want zero-ops.

**Pitfalls baked in:**

- Local port conflicts when multiple compose projects run on the same host.
- MinIO vs S3 client config drift (different endpoints, different signature versions).
- MailHog UI on :8025 vs SMTP on :1025 — easy to point the app at the wrong one.

### 5.4 `streamlit-cloud-analytics` 📊

**What:** Streamlit app + Streamlit Cloud deploy + `secrets.toml` pattern + guest rate-limit guard.

**Anchors:** market-tracker (live, ChicagoBooth analysis), yishun-dorm-pitch (live, SFA-restricted).

**When use:** data-heavy dashboards; one developer; Python-first; you'd rather not write React.

**When skip:** need <100ms interactivity; need multi-tenant accounts; need pixel-perfect design control.

**Pitfalls baked in:**

- Streamlit Cloud secrets vs local `.env` are different mechanisms.
- SFA-restricted means private app gated by Streamlit's own auth (not Supabase).
- Guest rate-limiter is a DIY in-process pattern in Python.

## 6. Archetype contract content (`archetypes/backend-backed-app/`)

### 6.1 `CLAUDE.md` design rules

- Real DB (Postgres / Supabase / Neon), never localStorage alone, for any data needed across devices.
- Real auth (Supabase Auth / CF Zero Trust), never shared-password gate, for anything beyond toy demos.
- Secrets never committed — `.env.example` + `gitignore` in repo, real values in deploy platform (Fly secrets / Streamlit Cloud secrets / CF env vars).
- Observability hook from day one (Sentry recommended once shipped; until then, structured logs to Fly / CF Pages).
- Deploy config lives in repo: `fly.toml`, `docker-compose.yml`, `Dockerfile`, `supabase/config.toml`, or platform equivalent.
- Local dev mirrors prod with mocks (MailHog for SMTP, MinIO for S3) when prod uses managed equivalents.

### 6.2 `prompt.md`

Boilerplate inlining the four recipe snippets when the Assembly engine picks them. Same pattern as existing archetypes.

### 6.3 `examples.md` — three real anchors

- **sp-wsg-corenet** — the full deck (FastAPI / Postgres+pgvector / Redis / Resend / Fly / docker-compose / Next.js)
- **elitez-ai-tender-creator** — the Supabase-OTP slice (CF Pages + Resend + domain allowlist hook)
- **Elitez-ESOP** — the migration story (static + localStorage → Supabase, in progress)

Link policy honored: no repo URLs exposed on the public site.

### 6.4 `mechanic-fit.md`

Fits matrix for:

- The 4 new Production Stack recipes (core / optional / rare).
- How existing mechanics re-fit **within this archetype only** (their fits for other archetypes are unchanged):
  - `admin-auth-gate` → "rare" within backend-backed-app (use magic-link-auth-supabase or cf-zero-trust-static-admin instead). Stays "core" elsewhere — we are not editing other archetypes' columns.
  - `localstorage-state` → "optional" (still useful for client-side ephemeral state inside an authenticated session).
  - `pdf-pipeline` → "optional" (still client-side, still works).
  - `schema-jsonld`, `og-social-meta`, `favicon` → "core" (unchanged).

### 6.5 `pitfalls.md`

Archetype-specific. See Section 7 for the seven entries.

### 6.6 `stack-candidates.md` (repo-only)

Honest "evaluated, not yet adopted" notes. Each tool is one short block: what it is, the closest thing already shipped, what would trigger adoption.

| Tool | Closest shipped | What would trigger adoption |
|---|---|---|
| Neon.tech | Supabase Postgres | Postgres-only need, without Supabase's auth/storage bundle |
| Upstash | docker-compose Redis (corenet) | Redis on a serverless platform that can't hold a long connection |
| Sentry.io | none — browser console + Fly logs | First production outage I couldn't diagnose from logs alone |
| Railway | Fly.io | Fly pricing/region change, comparable shape |
| Vercel | CF Pages (for static) | First Next.js project needing serverless functions + edge runtime |

## 7. New pitfalls (`pitfalls.html` additions)

All seven anchored in real shipped scars:

1. **"My CF Access OTP emails aren't arriving"** — `/xinceai|/aevum` setup. Fix: swap to Google OAuth IdP. Severity: high. Phase: deploy. Archetype: backend-backed-app.
2. **"My Supabase magic-link 'works' but anyone can sign up"** — missing `before-user-created` domain-allowlist hook. Fix: wire the hook before launching. Severity: critical. Phase: auth-config. Archetype: backend-backed-app.
3. **"Resend says 'sent' but emails don't arrive"** — sender domain DNS verification not completed. Fix: verify SPF/DKIM before first user-facing send. Severity: high. Phase: pre-launch. Archetype: backend-backed-app.
4. **"My docker-compose hangs because port 5432 is taken"** — multiple projects fighting for the same Postgres port. Fix: rename host ports in compose, or stop the other stack. Severity: medium. Phase: local-dev. Archetype: backend-backed-app.
5. **"CF Pages didn't auto-deploy my new commit"** — no Git provider connected; deploy is manual via `wrangler pages deploy`. Fix: connect a Git provider OR document the manual step in README. Severity: medium. Phase: deploy. Archetype: backend-backed-app, static-informational.
6. **"My static demo with mock auth got stuck in 'mock' forever"** — LMS path: static + localStorage works so well in v1 that migrating to Supabase looks expensive in v2. Fix: when you build the mock, pre-write the migration spec to a MIGRATION.md so the cost is visible from day one. Severity: medium. Phase: planning. Archetype: backend-backed-app. (No template generated in this scope — see Non-goals.)
7. **"Streamlit Cloud secrets vs local .env"** — two different secrets mechanisms; missed in deploy. Fix: keep a `secrets.toml.example` and document the Cloud equivalent in README. Severity: medium. Phase: deploy. Archetype: backend-backed-app.

## 8. Showcase additions (`dashboard/data/examples.json`)

| Slug | Title | Status | Notes |
|---|---|---|---|
| sp-wsg-corenet | WSG/SP/BCA AI Job Redesign Toolkit | `wip` | No live URL — private/internal. Anchors `containerized-fastapi-fly` and `magic-link-auth-supabase`. |
| elitez-lms | Elitez LMS (mock demo) | `wip` | No public mirror in dt-public (verified 2026-05-11). Lives in the showcase to document the "mock-stuck" pitfall (#6); no live link. |
| elitez-ai-tender-creator | Elitez AI Tender Creator | `wip` | tender.elitezaviation.com. Visitors hit the Supabase OTP wall — tagged "gated demo"; the wall IS the recipe demo. Marked `wip` preemptively because linkcheck doesn't accept 401/403 yet; promote to `preview` later after widening the linkcheck pass list. |
| elitez-esop | Elitez ESOP | `preview` | derrickteo.com/esop/. Static portion live; Supabase migration in progress. |

No repo URLs on the public site. Placeholder thumbnails via existing `scripts/generate-placeholders.py` until real screenshots are taken.

## 9. Ops + tooling changes

- **`mechanics.json`** — add 4 recipe entries + new `production-stack` category. Each recipe gets `details.plain`, `when_use`, `when_skip`, `fits` matrix, `past_uses`, `complexity`, `icon`.
- **`archetypes.json`** — add 6th archetype with scoring weights. Trigger keywords to weight up: "multi-user", "real auth", "email login", "sign in", "postgres", "deploy", "docker", "fastapi", "streamlit", "supabase".
- **`assembly.js`** — fetch path is folder-driven, so adding `archetypes/backend-backed-app/` should work without code changes. Verify in a local server run. Bump cache-bust `?v=N` on any JS touch.
- **`linkcheck.yml`** — already runs on `examples.json` changes; new URLs flow through automatically. Tender is marked `wip` in this scope (no live URL field for linkcheck to hit), so no linkcheck change is required. A future PR can widen the pass list to include 401/403 and promote tender to `preview`.
- **`scripts/verify-scoring.py`** — add 1-2 sanity scenarios for backend-backed-app:
  - "build me a multi-user training tracker with email login" → backend-backed-app top score.
  - "build me a Streamlit dashboard for my team" → backend-backed-app top score (Streamlit triggers).
- **Mirror to derrickteo.com** — after push, re-run `dt-public/sync-wip.sh` per existing convention.
- **Commit-and-push after every change** — per Derrick's standing preference and the GH Pages constraint.

## 10. Out of scope (deferred to separate work)

- Writing a `MIGRATION.md` template (either as elitez-lms artifact or dt-site-creator reference). User explicitly opted for "Just the pitfall, no template."
- Migrating elitez-lms or Elitez-ESOP themselves — they're separate projects.
- Real production screenshots for the 4 new showcase entries — placeholders for now.
- Sentry / Upstash / Neon / Railway / Vercel as full mechanics. They live in `stack-candidates.md` until a project actually ships them.
- Refactor of existing 5 archetypes.

## 11. Acceptance criteria

- [ ] `archetypes/backend-backed-app/` exists with all 6 files (5-file contract + stack-candidates.md).
- [ ] `mechanics.json` has new `production-stack` category and 4 new mechanic entries.
- [ ] `archetypes.json` has 6th archetype entry with scoring weights.
- [ ] 4 mechanic folders exist under `mechanics/` with snippet.html + README.md + preview.jpg.
- [ ] `pitfalls.html` (or its data source) includes 7 new entries with full title / story / fix / lesson / severity / phase / archetype.
- [ ] 4 new showcase entries in `examples.json`.
- [ ] `verify-scoring.py` passes with 2 new sanity scenarios for backend-backed-app.
- [ ] Site renders locally via `python3 -m http.server 8000` — Assembly with backend-backed-app produces a coherent prompt that inlines the 4 recipes.
- [ ] `linkcheck.yml` passes on CI.
- [ ] Pushed to derrick-pixel/dt-site-creator and mirrored to derrickteo.com.

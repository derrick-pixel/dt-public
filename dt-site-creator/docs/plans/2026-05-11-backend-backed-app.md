# Backend-Backed App Archetype + Production Stack Mechanics — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 6th archetype (`backend-backed-app`) and a `production-stack` mechanic category with 4 integration recipes anchored to actually-shipped projects (sp-wsg-corenet, elitez-ai-tender-creator, Elitez-ESOP, CF Access fleet, Streamlit Cloud apps).

**Architecture:** Drop-in extension of existing data-driven dashboard. Archetype folder follows the 7-file contract (`CLAUDE.md`, `prompt.md`, `examples.md`, `mechanic-fit.md`, `agents.md`, `data-contract.md`, `pitfalls.md`) plus one extension file (`stack-candidates.md`, repo-only). Mechanics follow the 5-file contract (`meta.json`, `snippet.html`, `README.md`, `example-use.md`, `preview.jpg`). Three JS files have hardcoded archetype lists that must be extended. Pitfalls are YAML in each archetype's `pitfalls.md` and aggregated client-side.

**Tech Stack:** Static HTML/CSS/JS, JSON data files, Python scoring + linkcheck scripts. Python 3 for local server (`python3 -m http.server 8000`).

**Spec:** `docs/specs/2026-05-11-backend-backed-app-design.md` — read this before starting.

**Repo conventions to honor:**
- Commit and push after every meaningful change (GitHub Pages serves the remote, not your disk).
- Bump cache-bust `?v=N` on any HTML page that loads modified JS.
- Run `node --check dashboard/js/<file>.js` after every JS edit (parse errors break the IIFE silently).
- No repo URLs exposed in showcase entries.
- After final push, sync `dt-public` mirror via `cd /Users/derrickteo/codings/dt-public && bash sync-wip.sh && git add -A && git commit && git push`.

---

## File Map

**New files:**
```
archetypes/backend-backed-app/
  CLAUDE.md
  prompt.md
  examples.md
  mechanic-fit.md
  agents.md
  data-contract.md
  pitfalls.md
  stack-candidates.md      # extension: repo-only, not loaded by Assembly

mechanics/magic-link-auth-supabase/
  meta.json
  snippet.html
  README.md
  example-use.md
  preview.jpg

mechanics/cf-zero-trust-static-admin/
  meta.json
  snippet.html
  README.md
  example-use.md
  preview.jpg

mechanics/containerized-fastapi-fly/
  meta.json
  snippet.html
  README.md
  example-use.md
  preview.jpg

mechanics/streamlit-cloud-analytics/
  meta.json
  snippet.html
  README.md
  example-use.md
  preview.jpg
```

**Modified files:**
- `dashboard/data/archetypes.json` — append 6th archetype entry
- `dashboard/data/mechanics.json` — add `production-stack` category + 4 mechanics; demote `admin-auth-gate.fits.backend-backed-app` to `"rare"` (the new column)
- `dashboard/data/examples.json` — append 4 showcase entries
- `dashboard/js/assembly.js` — add `'backend-backed-app'` to archetype-id array (line ~12-16)
- `dashboard/js/pitfalls.js` — add `'backend-backed-app'` to `archetypeIds` (line ~9-14)
- `dashboard/js/browse.js` — add `'backend-backed-app'` to fetch list (line ~10-14) AND short-label map (line ~553-557)
- `scripts/verify-scoring.py` — add 2 sanity scenarios
- `mechanics/README.md` — add 4 rows to the mechanic table
- `mechanics/admin-auth-gate/meta.json` — add `"backend-backed-app": "rare"` to `fits`
- All HTML pages that load modified JS — bump `?v=N`
- `README.md` (top-level) — update "5 archetypes / 21 mechanics" to "6 archetypes / 25 mechanics"

---

## Phase A — Wire the archetype skeleton

### Task 1: Create the archetype folder + 7-file scaffold

**Files:** Create `archetypes/backend-backed-app/{CLAUDE.md, prompt.md, examples.md, mechanic-fit.md, agents.md, data-contract.md, pitfalls.md, stack-candidates.md}` (empty stubs only; content filled in later phases).

- [ ] **Step 1: Create folder and empty files**

```bash
mkdir -p /Users/derrickteo/codings/dt-site-creator/archetypes/backend-backed-app
cd /Users/derrickteo/codings/dt-site-creator/archetypes/backend-backed-app
for f in CLAUDE.md prompt.md examples.md mechanic-fit.md agents.md data-contract.md pitfalls.md stack-candidates.md; do
  echo "# Backend-Backed App — $(echo $f | sed 's/.md//')" > "$f"
  echo "" >> "$f"
  echo "> Scaffolded by 2026-05-11 plan. Content lands in Phase D." >> "$f"
done
```

- [ ] **Step 2: Verify all 8 files exist**

Run: `ls /Users/derrickteo/codings/dt-site-creator/archetypes/backend-backed-app/`
Expected: 8 files listed.

- [ ] **Step 3: Commit**

```bash
git -C /Users/derrickteo/codings/dt-site-creator add archetypes/backend-backed-app/
git -C /Users/derrickteo/codings/dt-site-creator commit -m "scaffold: backend-backed-app archetype folder (empty contract files)"
git -C /Users/derrickteo/codings/dt-site-creator push
```

---

### Task 2: Add archetype entry to `archetypes.json` with scoring weights

**Files:** Modify `dashboard/data/archetypes.json` — append to the `archetypes` array.

- [ ] **Step 1: Read current file**

Read `dashboard/data/archetypes.json` to confirm the closing `]` and trailing `}` so the new entry is appended correctly before them.

- [ ] **Step 2: Append the 6th archetype entry**

Insert this object as the **last** entry in the `archetypes` array (after `dashboard-analytics`):

```json
,
{
  "id": "backend-backed-app",
  "name": "Backend-Backed App",
  "tagline": "A real server exists",
  "description": "Multi-user, real auth, persistence beyond browser, outbound email. When localStorage isn't enough.",
  "path": "archetypes/backend-backed-app/",
  "past_examples": ["sp-wsg-corenet", "elitez-ai-tender-creator", "elitez-esop"],
  "color_hint": "#a78bfa",
  "scoring_weights": {
    "q1_public": 5,  "q1_customers": 8,  "q1_internal": 8,  "q1_learners": 5,
    "q2_no_money": 5, "q2_one_time": 5,   "q2_recurring": 8, "q2_escrow": 5,
    "q3_content": 0,  "q3_interaction": 8, "q3_goal": 5,
    "q4_no_data": 0,  "q4_dashboard": 8,  "q4_api": 10
  }
}
```

Scoring rationale: backend-backed apps win on q4_api (real API/data layer) and q4_dashboard, lean toward internal/customers users, and lean toward recurring/escrow money flows. Weights are conservative — verify-scoring.py will check.

- [ ] **Step 3: Validate JSON**

Run: `python3 -c "import json; json.load(open('/Users/derrickteo/codings/dt-site-creator/dashboard/data/archetypes.json'))"`
Expected: no output (no error).

- [ ] **Step 4: Commit**

```bash
git -C /Users/derrickteo/codings/dt-site-creator add dashboard/data/archetypes.json
git -C /Users/derrickteo/codings/dt-site-creator commit -m "data: add backend-backed-app archetype to archetypes.json"
git -C /Users/derrickteo/codings/dt-site-creator push
```

---

### Task 3: Add 2 scenarios to `verify-scoring.py` and prove they pass

**Files:** Modify `scripts/verify-scoring.py`.

- [ ] **Step 1: Read the file and locate the `TESTS` list**

The existing list has 5 tuples — one per existing archetype.

- [ ] **Step 2: Run baseline test to confirm 5/5 still pass**

```bash
cd /Users/derrickteo/codings/dt-site-creator && python3 scripts/verify-scoring.py
```
Expected: all 5 baseline scenarios still pass with the new archetype in archetypes.json.

- [ ] **Step 3: Append 2 new test tuples** to the `TESTS` list:

```python
    ("Multi-user training platform with email login and Postgres",
     ["q1_customers", "q2_recurring", "q3_interaction", "q4_api"],
     "backend-backed-app"),
    ("Internal Streamlit dashboard for the ops team",
     ["q1_internal", "q2_no_money", "q3_interaction", "q4_dashboard"],
     "backend-backed-app"),
```

- [ ] **Step 4: Run scoring verifier**

```bash
cd /Users/derrickteo/codings/dt-site-creator && python3 scripts/verify-scoring.py
```
Expected: 7/7 pass.

- [ ] **Step 5: If scenario 2 ("Streamlit dashboard")** fails because dashboard-analytics outscores backend-backed-app, bump `q4_dashboard` for backend-backed-app from 8 to 10 in `archetypes.json` and re-run. If it still fails, adjust q1_internal from 8 to 10. Verify scenario 1 still passes after any adjustment.

- [ ] **Step 6: Commit**

```bash
git -C /Users/derrickteo/codings/dt-site-creator add scripts/verify-scoring.py dashboard/data/archetypes.json
git -C /Users/derrickteo/codings/dt-site-creator commit -m "test: add 2 backend-backed-app scoring scenarios + tune weights"
git -C /Users/derrickteo/codings/dt-site-creator push
```

---

### Task 4: Extend three hardcoded JS archetype lists

**Files:** Modify `dashboard/js/assembly.js`, `dashboard/js/pitfalls.js`, `dashboard/js/browse.js`.

- [ ] **Step 1: Edit `dashboard/js/assembly.js`**

Find the `archetypeIds` (or equivalent) array near lines 12-16. Change from:

```javascript
    'static-informational',
    'transactional',
    'simulator-educational',
    'game',
    'dashboard-analytics'
```

To:

```javascript
    'static-informational',
    'transactional',
    'simulator-educational',
    'game',
    'dashboard-analytics',
    'backend-backed-app'
```

- [ ] **Step 2: Edit `dashboard/js/pitfalls.js`**

Find the `const archetypeIds` array at line ~9-14 and apply the same change.

- [ ] **Step 3: Edit `dashboard/js/browse.js`**

Apply the same array edit at line ~10-14. ALSO update the short-label map at lines ~553-557 from:

```javascript
      'static-informational':   'Static',
      'transactional':          'Trans',
      'simulator-educational':  'Sim',
      'game':                   'Game',
      'dashboard-analytics':    'Dash'
```

To:

```javascript
      'static-informational':   'Static',
      'transactional':          'Trans',
      'simulator-educational':  'Sim',
      'game':                   'Game',
      'dashboard-analytics':    'Dash',
      'backend-backed-app':     'Backend'
```

- [ ] **Step 4: Run parse-time check on all three files**

```bash
cd /Users/derrickteo/codings/dt-site-creator
node --check dashboard/js/assembly.js
node --check dashboard/js/pitfalls.js
node --check dashboard/js/browse.js
```
Expected: no output (no parse errors).

- [ ] **Step 5: Commit**

```bash
git -C /Users/derrickteo/codings/dt-site-creator add dashboard/js/assembly.js dashboard/js/pitfalls.js dashboard/js/browse.js
git -C /Users/derrickteo/codings/dt-site-creator commit -m "js: register backend-backed-app in assembly/pitfalls/browse hardcoded lists"
git -C /Users/derrickteo/codings/dt-site-creator push
```

---

## Phase B — Write each integration recipe (mechanic)

For each mechanic: use `mechanics/admin-auth-gate/` as the structural template. Pull real code from the anchor project where called out.

### Task 5: Create `mechanics/magic-link-auth-supabase/`

**Files:** Create the 5-file folder.

**Source projects to extract from:**
- `/Users/derrickteo/codings/elitez-ai-tender-creator/` — Supabase OTP setup, Resend integration, before-user-created hook SQL.
- `/Users/derrickteo/codings/sp-wsg-corenet/backend/app/` — FastAPI-side magic-link callback handler.

- [ ] **Step 1: Create folder**

```bash
mkdir -p /Users/derrickteo/codings/dt-site-creator/mechanics/magic-link-auth-supabase
```

- [ ] **Step 2: Write `meta.json`**

```json
{
  "id": "magic-link-auth-supabase",
  "name": "Magic-Link Auth (Supabase + Resend)",
  "summary": "Passwordless email sign-in with domain allowlist.",
  "icon": "🪄",
  "fits": {
    "static-informational": "rare",
    "transactional": "optional",
    "simulator-educational": "rare",
    "game": "rare",
    "dashboard-analytics": "core",
    "backend-backed-app": "core"
  },
  "dependencies": [],
  "complexity": "medium",
  "past_uses": ["elitez-ai-tender-creator", "sp-wsg-corenet", "elitez-esop"],
  "linked_pitfalls": ["bba-supabase-silent-public", "bba-resend-dns-unverified"]
}
```

- [ ] **Step 3: Write `snippet.html`**

Extract from `elitez-ai-tender-creator`. Sanitize: replace real Supabase URL and anon key with `<YOUR_SUPABASE_URL>` and `<YOUR_SUPABASE_ANON_KEY>`. Replace `elitez.asia` / `dhc.com.sg` allowlist with `<YOUR_ALLOWLIST_DOMAIN_1>`. Replace `tender@elitezaviation.com` sender with `<YOUR_RESEND_SENDER>`.

Required sections in the snippet:
1. HTML — sign-in form with email input and "Send magic link" button.
2. JS — Supabase JS init + `signInWithOtp({ email, options: { emailRedirectTo } })` call.
3. JS — callback page handling: `supabase.auth.getSession()` and redirect on success.
4. SQL — `create function before_user_created()` with domain allowlist + `create trigger before_user_created_trigger before insert on auth.users for each row execute function before_user_created();`.
5. Inline comments calling out: "this hook is mandatory — without it your gated tool is silently public."

- [ ] **Step 4: Write `README.md`**

Follow the structure of `mechanics/admin-auth-gate/README.md`:

```markdown
# Magic-Link Auth (Supabase + Resend)

Passwordless email sign-in. User submits email → receives a one-click magic link from your custom-domain sender → clicks → lands authenticated. A Postgres `before-user-created` trigger enforces an email-domain allowlist so only known partners can complete signup.

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
```

- [ ] **Step 5: Write `example-use.md`**

```markdown
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
```

- [ ] **Step 6: Generate `preview.jpg`**

Add a `magic-link-auth-supabase` entry to `scripts/generate-placeholders.py` MECHANIC_PREVIEWS list (read the script to find the right list), then run:

```bash
cd /Users/derrickteo/codings/dt-site-creator && python3 scripts/generate-placeholders.py
```
Expected: `mechanics/magic-link-auth-supabase/preview.jpg` exists.

- [ ] **Step 7: Commit**

```bash
git -C /Users/derrickteo/codings/dt-site-creator add mechanics/magic-link-auth-supabase/
git -C /Users/derrickteo/codings/dt-site-creator commit -m "mechanic: add magic-link-auth-supabase (recipe 1 of 4)"
git -C /Users/derrickteo/codings/dt-site-creator push
```

---

### Task 6: Create `mechanics/cf-zero-trust-static-admin/`

**Source projects:** Memory + repo state for `derrickteo.com/xinceai`, `/aevum`, `/elix-eor` admin paths. Cloudflare Zero Trust dashboard.

- [ ] **Step 1: Create folder**

```bash
mkdir -p /Users/derrickteo/codings/dt-site-creator/mechanics/cf-zero-trust-static-admin
```

- [ ] **Step 2: Write `meta.json`**

```json
{
  "id": "cf-zero-trust-static-admin",
  "name": "CF Zero Trust (Static Admin Paths)",
  "summary": "Cloudflare Access + Google OAuth gating /admin on a static site.",
  "icon": "🛡️",
  "fits": {
    "static-informational": "optional",
    "transactional": "optional",
    "simulator-educational": "rare",
    "game": "rare",
    "dashboard-analytics": "core",
    "backend-backed-app": "optional"
  },
  "dependencies": [],
  "complexity": "low",
  "past_uses": ["derrickteo-xinceai-admin", "derrickteo-aevum-admin", "derrickteo-elix-eor-admin"],
  "linked_pitfalls": ["bba-cf-access-otp-unreliable"]
}
```

- [ ] **Step 3: Write `snippet.html`**

This recipe is mostly Cloudflare dashboard configuration, not pasteable code. The snippet.html should contain:

1. An HTML/markdown block describing the dashboard config (which is what readers paste-in mentally):
   - "Create a Self-hosted Application in Zero Trust → Access → Applications."
   - "Application URL: `yourdomain.com/admin/*`."
   - "Identity provider: Google OAuth. Configure OAuth client in Google Cloud Console; paste client ID + secret into CF."
   - "Policy: Allow users whose email is in `{ allowed_users_list }`."
2. A `<details>` block showing the JSON policy export shape from CF for backup/version control.
3. A JS snippet showing how to read the `CF_Authorization` JWT in your admin page if you want to display the signed-in user:

```javascript
// Optional: read the CF Access JWT to display signed-in user
async function getCurrentUser() {
  const r = await fetch('/cdn-cgi/access/get-identity');
  if (!r.ok) return null;
  return r.json();  // { email, name, ... }
}
```

- [ ] **Step 4: Write `README.md`**

Following the same structure as the previous mechanic. Key sections:

- **What you get:** A gate that runs on Cloudflare's edge before any of your site assets serve. Users hit the IdP login first. Works on pure-static sites (no app-side auth code).
- **When to use:** Small set of known admins; underlying site is static; you don't want to ship app-level auth.
- **When to skip:** Need per-user state inside the app (use Supabase Auth); fine-grained RBAC needed; users outside Google's IdP reach (e.g., personal Gmail addresses for partners you don't fully trust).
- **Wire-up steps:** (1) Move site to CF Pages or proxy via CF DNS; (2) Create Self-hosted App in Zero Trust; (3) Configure Google OAuth IdP first (do NOT start with OTP — see pitfall `bba-cf-access-otp-unreliable`); (4) Attach the IdP to the app; (5) Add an Allow policy listing admin emails; (6) Test in incognito.
- **Honest scar:** OTP email delivery via CF Access is unreliable for some SG providers. Use Google OAuth IdP from day one.

- [ ] **Step 5: Write `example-use.md`**

```markdown
# Example use — derrickteo.com admin paths

Three admin paths on derrickteo.com are gated by this exact recipe:

- `/xinceai/admin/*`
- `/aevum/admin/*`
- `/elix-eor/admin/*`

All three are static HTML admin shells (no backend) — CF Access is the entire auth story.

## The scar

Started with OTP delivery (CF Access's default option). Several emails never arrived in SG inboxes. Migrated to Google OAuth IdP. Delivery problem disappeared; sign-in UX got faster (no email round-trip).

## Why Google OAuth IdP over OTP

- Free tier supports it.
- Most admin users already have a Google identity (Workspace or personal).
- No email-deliverability dependency.
- Sign-in is one click + a Google consent screen.
```

- [ ] **Step 6: Generate preview.jpg**

Same pattern as Task 5 step 6.

- [ ] **Step 7: Commit**

```bash
git -C /Users/derrickteo/codings/dt-site-creator add mechanics/cf-zero-trust-static-admin/
git -C /Users/derrickteo/codings/dt-site-creator commit -m "mechanic: add cf-zero-trust-static-admin (recipe 2 of 4)"
git -C /Users/derrickteo/codings/dt-site-creator push
```

---

### Task 7: Create `mechanics/containerized-fastapi-fly/`

**Source project:** `/Users/derrickteo/codings/sp-wsg-corenet/` — read `README.md`, `docker/docker-compose.yml`, `backend/Dockerfile`, `infra/fly/fly.backend.toml`, `infra/fly/fly.cron.toml`, `infra/fly/fly.staging.toml`.

- [ ] **Step 1: Create folder**

```bash
mkdir -p /Users/derrickteo/codings/dt-site-creator/mechanics/containerized-fastapi-fly
```

- [ ] **Step 2: Write `meta.json`**

```json
{
  "id": "containerized-fastapi-fly",
  "name": "Containerized FastAPI on Fly.io",
  "summary": "Docker-compose local stack + multi-service Fly deploy.",
  "icon": "🐳",
  "fits": {
    "static-informational": "rare",
    "transactional": "optional",
    "simulator-educational": "rare",
    "game": "rare",
    "dashboard-analytics": "optional",
    "backend-backed-app": "core"
  },
  "dependencies": [],
  "complexity": "high",
  "past_uses": ["sp-wsg-corenet"],
  "linked_pitfalls": ["bba-docker-port-collision"]
}
```

- [ ] **Step 3: Write `snippet.html`**

A `<details>` per file. Each `<details>` contains a fenced code block. Sanitize app names and DB names to `<your-app>` placeholders. Required files in the snippet:

1. **`docker-compose.yml`** — pull from `sp-wsg-corenet/docker/docker-compose.yml`. Services: postgres (pgvector/pgvector:pg16), redis (redis:7-alpine), minio (minio/minio:latest), mailhog (mailhog/mailhog:latest). Volumes for pg_data + minio_data.
2. **`Dockerfile`** (backend) — pull from `sp-wsg-corenet/backend/Dockerfile`. Multi-stage Python 3.12 build with `pip install -e .`.
3. **`fly.backend.toml`** — pull from `sp-wsg-corenet/infra/fly/fly.backend.toml`. Sanitize app name and primary region.
4. **`fly.cron.toml`** — same, for the cron service.
5. **`fly.staging.toml`** — same, for staging.
6. A short bash block showing the deploy sequence:

```bash
# Deploy backend, cron, staging
fly deploy -c infra/fly/fly.backend.toml
fly deploy -c infra/fly/fly.cron.toml
fly deploy -c infra/fly/fly.staging.toml
```

- [ ] **Step 4: Write `README.md`**

Sections:
- **What you get:** Local dev that mirrors prod with disposable mocks (MinIO=S3, MailHog=SMTP); deploy via Fly to 3 separate apps (web, background workers, staging).
- **When to use:** Real backend; jobs/queues; pgvector embeddings; you can swallow Docker overhead.
- **When to skip:** Marketing site (no server logic); one developer faster on Streamlit; want zero-ops.
- **Wire-up steps:** (1) Install Docker Desktop + `flyctl`; (2) Copy compose + Dockerfile + 3 fly.tomls; (3) Run `docker-compose up`; verify Postgres on 5432, Redis on 6379, MinIO console at :9001, MailHog UI at :8025; (4) Run `fly launch --copy-config` per service; (5) `fly secrets set` for env vars.
- **Pitfalls:** port collisions across compose projects; MinIO vs S3 config drift; MailHog `:8025` vs `:1025` mix-up.

- [ ] **Step 5: Write `example-use.md`**

```markdown
# Example use — sp-wsg-corenet

The WSG/SP/BCA AI Job Redesign CORENET X Toolkit runs the full stack:

- **Backend:** FastAPI + SQLAlchemy 2 (async) + Postgres + pgvector + Redis + Resend (production); MinIO + MailHog (local mocks).
- **Frontend:** Next.js 14 + TypeScript + Tailwind.
- **Deploy:** Three Fly apps — backend, cron, staging.

## Local dev flow

```bash
./scripts/dev-up.sh                 # brings up postgres+redis+minio+mailhog
cd backend && uvicorn app.main:app --reload
cd frontend && npm run dev
```

Magic-link emails caught by MailHog UI at <http://localhost:8025> during local dev — never hits Resend until prod.

## Why three Fly apps

- `fly.backend.toml` — the HTTP app.
- `fly.cron.toml` — a separate app that runs scheduled jobs without competing with HTTP workers.
- `fly.staging.toml` — full staging environment with its own DB.

Separating services lets you scale, restart, and deploy them independently.
```

- [ ] **Step 6: Generate preview.jpg** (same pattern).

- [ ] **Step 7: Commit**

```bash
git -C /Users/derrickteo/codings/dt-site-creator add mechanics/containerized-fastapi-fly/
git -C /Users/derrickteo/codings/dt-site-creator commit -m "mechanic: add containerized-fastapi-fly (recipe 3 of 4)"
git -C /Users/derrickteo/codings/dt-site-creator push
```

---

### Task 8: Create `mechanics/streamlit-cloud-analytics/`

**Source projects:** `/Users/derrickteo/codings/` for `market-tracker` and `yishun-dorm-pitch` (or whichever folders host them — verify).

- [ ] **Step 1: Verify source repos**

```bash
ls /Users/derrickteo/codings/ | grep -i -E "market|yishun"
```
Note the actual folder names.

- [ ] **Step 2: Create folder**

```bash
mkdir -p /Users/derrickteo/codings/dt-site-creator/mechanics/streamlit-cloud-analytics
```

- [ ] **Step 3: Write `meta.json`**

```json
{
  "id": "streamlit-cloud-analytics",
  "name": "Streamlit Cloud (Rapid Analytics)",
  "summary": "Python data dashboards with one-click deploy.",
  "icon": "📊",
  "fits": {
    "static-informational": "rare",
    "transactional": "rare",
    "simulator-educational": "optional",
    "game": "rare",
    "dashboard-analytics": "core",
    "backend-backed-app": "optional"
  },
  "dependencies": [],
  "complexity": "low",
  "past_uses": ["market-tracker", "yishun-dorm-pitch"],
  "linked_pitfalls": ["bba-streamlit-secrets-mismatch"]
}
```

- [ ] **Step 4: Write `snippet.html`**

Files inside `<details>` blocks:

1. **`app.py`** — minimal Streamlit shell with title, sidebar, one chart, one table.
2. **`.streamlit/secrets.toml.example`** — template showing the secrets shape.
3. **`.streamlit/config.toml`** — theme + page-config defaults.
4. **`requirements.txt`** — pinned Streamlit + pandas + altair (or whichever the source uses).
5. **Guest rate-limiter pattern** — a Python decorator using `st.session_state` to count requests per session and block past a threshold. Pull from `market-tracker` if available.

- [ ] **Step 5: Write `README.md`**

Standard sections. Key bullets:
- **When to use:** data-heavy dashboards; Python-first; you'd rather not write React.
- **When to skip:** need <100ms interactivity; multi-tenant accounts (Streamlit's auth is per-app, not per-user-row); pixel-perfect design control.
- **Wire-up:** (1) `pip install streamlit pandas altair`; (2) `streamlit run app.py` locally; (3) push to GitHub; (4) connect repo at `share.streamlit.io`; (5) paste real secrets in the Streamlit Cloud secrets UI (different from local `.env` — see pitfall `bba-streamlit-secrets-mismatch`).
- **SFA-restricted apps:** Streamlit Cloud's "Share with specific Streamlit accounts" option — gates the app by Streamlit's own auth. Used by yishun-dorm-pitch.

- [ ] **Step 6: Write `example-use.md`**

```markdown
# Example use — market-tracker and yishun-dorm-pitch

Two live Streamlit Cloud apps in the Elitez fleet:

## market-tracker
- Public Streamlit Cloud app, light theme, ChicagoBooth analysis.
- Includes a guest rate-limiter pattern to prevent abuse of free public access.
- Deployed via derrick-pixel/markettracker repo connection.

## yishun-dorm-pitch
- Streamlit pitch app for AB Associates / Yishun factory-converted dorm co-investment.
- SFA-restricted (Elitez HQ employees only via Streamlit's "specific Streamlit accounts" gate).
- Deployed at yishun.streamlit.app.

## What's distinct about Streamlit Cloud vs FlyIO + FastAPI

You give up: real backend logic, REST APIs, multi-tenant DB rows.

You get: data-driven UI in 200 lines of Python, deploy in 5 minutes.

The choice between Streamlit Cloud and the FastAPI+Fly stack is mostly: "is this app fundamentally a data dashboard, or fundamentally an application with multiple user flows?"
```

- [ ] **Step 7: Generate preview.jpg** (same pattern).

- [ ] **Step 8: Commit**

```bash
git -C /Users/derrickteo/codings/dt-site-creator add mechanics/streamlit-cloud-analytics/
git -C /Users/derrickteo/codings/dt-site-creator commit -m "mechanic: add streamlit-cloud-analytics (recipe 4 of 4)"
git -C /Users/derrickteo/codings/dt-site-creator push
```

---

## Phase C — Wire mechanics into dashboard

### Task 9: Add `production-stack` category + 4 mechanics to `dashboard/data/mechanics.json`

**Files:** Modify `dashboard/data/mechanics.json`.

- [ ] **Step 1: Add category**

In `categories` array (which has 6 existing entries), append:

```json
,
{ "id": "production-stack", "title": "Production Stack",
  "sub": "Servers, real auth, observability — when localStorage isn't enough.",
  "icon": "🏗️" }
```

- [ ] **Step 2: Add the 4 mechanic entries**

In `mechanics` array, append the 4 new entries. Each follows the existing shape (id, name, summary, icon, category, fits, past_uses, complexity, details: { plain, when_use, when_skip }).

For each new mechanic:
- `category: "production-stack"`
- `fits` must include all 6 archetype columns: `static-informational`, `transactional`, `simulator-educational`, `game`, `dashboard-analytics`, `backend-backed-app`. Values match what we set in each mechanic's `meta.json` (Tasks 5-8).
- `details.plain` / `when_use` / `when_skip` mirror the README content in plain-language summary form.

(Full text for each entry is long — read each mechanic's `meta.json` + `README.md` from Tasks 5-8 and translate to this format.)

- [ ] **Step 3: Update `admin-auth-gate.fits` in mechanics.json**

Find the `admin-auth-gate` entry. Its `fits` object currently has 5 archetype keys. Add `"backend-backed-app": "rare"` so all existing mechanics have a complete 6-archetype fits matrix.

- [ ] **Step 4: Add `backend-backed-app` key to every existing mechanic's `fits`**

This is tedious but mandatory — `mechanics.json` will be inconsistent otherwise. For each of the ~22 existing mechanics, add a `backend-backed-app` value. Defaults:
- Foundations (favicon, og-thumbnail, og-social-meta, multi-page-scaffold, meta-tags-generator, schema-jsonld, semantic-html-audit, a11y-axe-runner): `"core"`
- Visual (canvas-hero, palette-tryout, copy-deck, stitch-bridge, intel-consumer, mobile-test-harness): `"optional"`
- Flows (wizard-form, pdf-pipeline, localstorage-state): `"optional"`
- Admin (admin-auth-gate): `"rare"` (demoted per spec)
- Data (chartjs-dashboard): `"optional"` (often replaced by server-side rendering)
- Payments (paynow-qr): `"optional"`

- [ ] **Step 5: Validate JSON**

```bash
python3 -c "import json; json.load(open('/Users/derrickteo/codings/dt-site-creator/dashboard/data/mechanics.json'))"
```
Expected: no output.

- [ ] **Step 6: Commit**

```bash
git -C /Users/derrickteo/codings/dt-site-creator add dashboard/data/mechanics.json
git -C /Users/derrickteo/codings/dt-site-creator commit -m "data: add production-stack category + 4 mechanics; backfill backend-backed-app fits"
git -C /Users/derrickteo/codings/dt-site-creator push
```

---

### Task 10: Sync `admin-auth-gate/meta.json` fits with mechanics.json

**Files:** Modify `mechanics/admin-auth-gate/meta.json`.

- [ ] **Step 1: Edit the `fits` object**

Add `"backend-backed-app": "rare"` to the existing 5-key fits object.

- [ ] **Step 2: Repeat for every other mechanic's `meta.json`**

For consistency with mechanics.json (Task 9 step 4), add the `backend-backed-app` key to every existing `mechanics/*/meta.json`. Same default values as above.

- [ ] **Step 3: Verify with a quick script**

```bash
cd /Users/derrickteo/codings/dt-site-creator
for f in mechanics/*/meta.json; do
  python3 -c "import json; d = json.load(open('$f')); assert 'backend-backed-app' in d.get('fits', {}), '$f missing'"
done
echo "all meta.json files include backend-backed-app fits column"
```
Expected: success line.

- [ ] **Step 4: Commit**

```bash
git -C /Users/derrickteo/codings/dt-site-creator add mechanics/*/meta.json
git -C /Users/derrickteo/codings/dt-site-creator commit -m "data: backfill backend-backed-app fits column in every meta.json"
git -C /Users/derrickteo/codings/dt-site-creator push
```

---

## Phase D — Write archetype content

### Task 11: Write `archetypes/backend-backed-app/CLAUDE.md`

**Template reference:** `archetypes/static-informational/CLAUDE.md` for structure (long-form playbook with numbered sections).

- [ ] **Step 1: Replace scaffold content** with a 5-7 section playbook:

1. **Trigger** — when this archetype wins. (Multi-user, real auth, persistence beyond browser, outbound email, observability.)
2. **Design rules**:
   - Real DB (Postgres / Supabase / Neon), never localStorage alone for data needed across devices.
   - Real auth (Supabase Auth / CF Zero Trust), never shared-password gate.
   - Secrets via `.env.example` + `.gitignore` + deploy-platform secrets store. Never committed.
   - Observability hook from day one (Sentry once shipped; structured logs to Fly/CF Pages until then).
   - Deploy config in repo: `fly.toml`, `docker-compose.yml`, `Dockerfile`, `supabase/config.toml`.
   - Local dev mirrors prod with mocks (MailHog for SMTP, MinIO for S3).
3. **Core mechanics** — magic-link-auth-supabase, cf-zero-trust-static-admin, containerized-fastapi-fly, streamlit-cloud-analytics.
4. **Common stacks** — pointer to the 4 recipes; pointer to `stack-candidates.md` for evaluated-but-unshipped.
5. **Pitfalls to read first** — list the 7 pitfall IDs by ID with one-line summaries.
6. **Out of scope for this archetype** — pure marketing sites (use static-informational); checkout flows that don't need auth (transactional); games (game).

- [ ] **Step 2: Commit**

```bash
git -C /Users/derrickteo/codings/dt-site-creator add archetypes/backend-backed-app/CLAUDE.md
git -C /Users/derrickteo/codings/dt-site-creator commit -m "archetype: backend-backed-app CLAUDE.md"
git -C /Users/derrickteo/codings/dt-site-creator push
```

---

### Task 12: Write `archetypes/backend-backed-app/prompt.md`

**Template reference:** `archetypes/static-informational/prompt.md`.

- [ ] **Step 1: Write a prompt template** that the Assembly engine inlines when this archetype is picked.

Structure:
1. Opening: "Build me a backend-backed app for [project description]."
2. Required choices the engineer must make before coding:
   - Auth pattern: magic-link-supabase OR cf-zero-trust (choose one).
   - Persistence: Supabase OR Postgres-on-Fly OR Neon (note Neon is in stack-candidates).
   - Email: Resend (required if magic-link chosen).
   - Observability: console + Fly/CF logs (default), or Sentry (in stack-candidates).
3. The 6 design rules from CLAUDE.md, restated.
4. Deploy expectation: target platform (Fly/Vercel/CF Pages) named explicitly.
5. Test expectation: at minimum, a sign-in flow test.

- [ ] **Step 2: Commit**

```bash
git -C /Users/derrickteo/codings/dt-site-creator add archetypes/backend-backed-app/prompt.md
git -C /Users/derrickteo/codings/dt-site-creator commit -m "archetype: backend-backed-app prompt.md"
git -C /Users/derrickteo/codings/dt-site-creator push
```

---

### Task 13: Write `archetypes/backend-backed-app/examples.md`

**Content:** Three anchors. No repo URLs. Status-honest framing.

- [ ] **Step 1: Write the file** with three subsections:

1. **sp-wsg-corenet** — Full hosted production stack. FastAPI + Postgres + pgvector + Redis + Resend + Next.js + docker-compose (local) + Fly (deploy across backend/cron/staging). Status: live; private/internal — no public URL.
2. **elitez-ai-tender-creator** — The Supabase-OTP slice. CF Pages + Resend + email-domain allowlist hook. Status: live, gated demo at tender.elitezaviation.com.
3. **Elitez-ESOP** — The migration story. Started as static + localStorage + SHA-256 auth; `supabase/` folder added (config.toml, functions, migrations, tests) — migration in progress. Documents the "static-mock to backend" graduation.

Each subsection: 2-3 paragraphs. State which recipes the project anchors. State the lesson learned that future engineers should carry forward.

- [ ] **Step 2: Commit**

```bash
git -C /Users/derrickteo/codings/dt-site-creator add archetypes/backend-backed-app/examples.md
git -C /Users/derrickteo/codings/dt-site-creator commit -m "archetype: backend-backed-app examples.md"
git -C /Users/derrickteo/codings/dt-site-creator push
```

---

### Task 14: Write `archetypes/backend-backed-app/mechanic-fit.md`

**Template reference:** `archetypes/static-informational/mechanic-fit.md`.

- [ ] **Step 1: Write the file** as a matrix of which mechanics fit at what level for this archetype.

Use a markdown table with columns: Mechanic | Fit | Why.

Rows must cover:
- All 4 new recipes (core).
- Existing mechanics with notable re-fit (admin-auth-gate → rare; localstorage-state → optional; pdf-pipeline → optional; chartjs-dashboard → optional).
- Universal mechanics (favicon, og-thumbnail, og-social-meta, schema-jsonld) → core.

State explicitly: "Fits for other archetypes are unchanged. Demotions here apply only when scoring this archetype."

- [ ] **Step 2: Commit**

```bash
git -C /Users/derrickteo/codings/dt-site-creator add archetypes/backend-backed-app/mechanic-fit.md
git -C /Users/derrickteo/codings/dt-site-creator commit -m "archetype: backend-backed-app mechanic-fit.md"
git -C /Users/derrickteo/codings/dt-site-creator push
```

---

### Task 15: Write `archetypes/backend-backed-app/agents.md`

**Template reference:** `archetypes/static-informational/agents.md`.

- [ ] **Step 1: Inspect the template**

```bash
cat /Users/derrickteo/codings/dt-site-creator/archetypes/static-informational/agents.md
```
This describes the 7-agent orchestration architecture for static sites. The backend-backed-app version should describe the agent assignments differently because the work involves backend, frontend, deploy, and observability.

- [ ] **Step 2: Write `agents.md`** that maps the existing 7-agent pattern to backend-backed-app's distinct phases:
- Agent 1 (Scoping) — same role.
- Agent 2 (Visual) — same role.
- Agent 3 (Content) — same role, plus auth-page copy.
- Agent 4 (Wiring) — extended: wires Supabase client, environment, secrets template.
- Agent 5 (Build) — extended: backend + frontend + deploy config + local mocks.
- Agent 6 (SEO/Meta) — same role.
- Agent 7 (QA) — extended: also runs the sign-in flow + checks secrets aren't committed.

Note any agents that this archetype doesn't fully use.

- [ ] **Step 3: Commit**

```bash
git -C /Users/derrickteo/codings/dt-site-creator add archetypes/backend-backed-app/agents.md
git -C /Users/derrickteo/codings/dt-site-creator commit -m "archetype: backend-backed-app agents.md"
git -C /Users/derrickteo/codings/dt-site-creator push
```

---

### Task 16: Write `archetypes/backend-backed-app/data-contract.md`

**Template reference:** `archetypes/static-informational/data-contract.md`.

- [ ] **Step 1: Write the file** describing the data shapes this archetype emits/consumes.

Key sections:
- **Auth data:** Supabase Auth users table shape (id, email, created_at, raw_user_meta_data).
- **Allowlist enforcement:** the `before-user-created` trigger contract.
- **Email-event data:** what Resend webhook events you should log (sent, bounced, complained).
- **Health/observability data:** the minimum structured-log fields per request (request_id, user_id, route, status, latency_ms).
- **Local-mocks contract:** MailHog captures all outbound SMTP; MinIO mimics S3 with `aws s3 --endpoint-url http://localhost:9000` compat.

- [ ] **Step 2: Commit**

```bash
git -C /Users/derrickteo/codings/dt-site-creator add archetypes/backend-backed-app/data-contract.md
git -C /Users/derrickteo/codings/dt-site-creator commit -m "archetype: backend-backed-app data-contract.md"
git -C /Users/derrickteo/codings/dt-site-creator push
```

---

### Task 17: Write `archetypes/backend-backed-app/pitfalls.md`

**Template reference:** `archetypes/static-informational/pitfalls.md` for YAML shape.

The pitfalls.js parser expects a triple-backtick `yaml` fenced block containing a list of objects with `id, title, severity, phase, story, source, fix, lesson, mechanic`.

- [ ] **Step 1: Write the complete file**

The file content begins below. Save it verbatim as `archetypes/backend-backed-app/pitfalls.md` (it uses a single triple-backtick `yaml` fence; the surrounding 4-backtick fence here is only to embed it in this plan).

````markdown
# Backend-Backed App — Pitfalls

Scar tissue from production-stack work. Dashboard parses this file's YAML block.

```yaml
- id: bba-cf-access-otp-unreliable
  title: "My CF Access OTP emails aren't arriving"
  severity: high
  phase: deploy
  story: "Set up Cloudflare Access on /xinceai, /aevum, /elix-eor admin paths with the default OTP option. Several invited admins on SG email providers never received the codes. Spent days debugging — turned out OTP delivery via CF Access has unreliable inbox placement for some SG providers."
  source: "derrickteo.com admin paths, Apr 2026"
  fix: |
    Use Google OAuth IdP from day one, not OTP.
    In Zero Trust → Settings → Authentication → Login methods,
    configure Google as an IdP first; attach it to your application.
    Free tier supports it.
  lesson: "OTP looks free and zero-config, but email deliverability is not your friend. Federated identity (Google) skips the email round-trip entirely."
  mechanic: cf-zero-trust-static-admin

- id: bba-supabase-silent-public
  title: "My Supabase magic-link 'works' but anyone can sign up"
  severity: critical
  phase: auth-config
  story: "Built a tool gated by magic-link sign-in. App-layer code checked email domain before showing the dashboard. Discovered later that anyone could complete signup — the user row was created the moment they clicked the link, regardless of domain. The 'allowlist' was a UI suggestion."
  source: "elitez-ai-tender-creator setup, 2026"
  fix: |
    Wire a `before-user-created` Postgres trigger that raises an exception
    when the email domain is not in your allowlist. App-layer checks are
    guidance; database-layer triggers are enforcement.
  lesson: "If your allowlist runs in the client or app server, it is not an allowlist — it is a comment. Real allowlisting runs in the DB layer."
  mechanic: magic-link-auth-supabase

- id: bba-resend-dns-unverified
  title: "Resend says 'sent' but emails don't arrive"
  severity: high
  phase: pre-launch
  story: "Configured Resend with a custom sender domain. Dashboard showed 'sent' for every magic-link. Users never received them. DNS verification for SPF + DKIM was incomplete — provider silently spam-foldered everything."
  source: "elitez-ai-tender-creator pre-launch, 2026"
  fix: |
    Verify the sender domain in Resend BEFORE first user-facing send.
    Wait for both SPF and DKIM to show 'verified' in the Resend dashboard.
    Test with an internal address from outside the org first.
  lesson: "Email is the only part of the stack where 'sent' doesn't mean 'delivered.' Always verify with a real external inbox before trusting the dashboard."
  mechanic: magic-link-auth-supabase

- id: bba-docker-port-collision
  title: "My docker-compose hangs because port 5432 is taken"
  severity: medium
  phase: local-dev
  story: "Running two projects with Postgres in docker-compose. Second project's `docker-compose up` hung silently — port 5432 was already claimed by the first stack. No clear error in the log."
  source: "Working on sp-wsg-corenet and elitez-esop migration in parallel"
  fix: |
    In docker-compose.yml, change the host-port mapping:
      ports: ["5433:5432"]  # rather than 5432:5432
    Update the project's .env to reflect the host port.
    Or stop the other compose stack first: docker-compose -p other-project down
  lesson: "Container ports are private; host ports are shared. Coordinate host-side ports across projects you run together."
  mechanic: containerized-fastapi-fly

- id: bba-cf-pages-no-autodeploy
  title: "CF Pages didn't auto-deploy my new commit"
  severity: medium
  phase: deploy
  story: "Pushed a commit to fix a bug. Refreshed the live site — same broken state. CF Pages project had no Git provider connected. Every deploy is manual via `wrangler pages deploy`."
  source: "elitez-ai-tender-creator (CF Pages 'elitez-tender'), 2026"
  fix: |
    Either connect a Git provider in CF Pages → Settings → Builds & deployments,
    OR document the manual step explicitly in the project's README:
      'Deploy: wrangler pages deploy dist --project-name=<name>'
    so future-you doesn't waste 20 minutes wondering.
  lesson: "When you skip a default convention (Git auto-deploy), document the alternative loudly. CI workflows are the kind of thing future-you will assume is in place."
  mechanic: null

- id: bba-mock-auth-stuck
  title: "My static demo with mock auth got stuck in 'mock' forever"
  severity: medium
  phase: planning
  story: "Built elitez-lms as a static demo with mock auth (pick an account, no password) and localStorage for per-user progress. Worked beautifully in v1. When time came to graduate to real Supabase auth, the migration looked expensive — every page assumed localStorage. Project stayed at v1 mock forever."
  source: "elitez-lms, 2026"
  fix: |
    When you build the mock, pre-write the migration spec to a MIGRATION.md
    in the same repo so the cost of moving to real auth is visible from day one.
    The MIGRATION.md should list: schema, auth flow swap, localStorage→DB calls, deploy.
  lesson: "Mock auth has a gravitational pull — by the time you want to leave it, you've built around it. Make the exit cost visible up front."
  mechanic: null

- id: bba-streamlit-secrets-mismatch
  title: "Streamlit Cloud secrets vs local .env"
  severity: medium
  phase: deploy
  story: "Local Streamlit app read secrets from .env via python-dotenv. Pushed to Streamlit Cloud. App crashed: .env doesn't exist in the Cloud sandbox; Streamlit Cloud uses its own secrets UI populated into st.secrets."
  source: "market-tracker and yishun-dorm-pitch deploys, 2026"
  fix: |
    Keep both:
    - .streamlit/secrets.toml.example committed (shows the shape).
    - Real local .streamlit/secrets.toml gitignored.
    - Paste the same TOML into Streamlit Cloud's Secrets UI before first deploy.
    In code, always read via st.secrets — never directly from .env or os.environ.
  lesson: "Streamlit Cloud is a sandbox, not a server you SSH into. Secrets live in the UI, accessed via st.secrets. Match local mechanism to prod from day one."
  mechanic: streamlit-cloud-analytics
```
````

- [ ] **Step 2: Verify YAML parses**

```bash
cd /Users/derrickteo/codings/dt-site-creator
python3 -c "
import re, yaml
text = open('archetypes/backend-backed-app/pitfalls.md').read()
m = re.search(r'\`\`\`yaml\n([\s\S]*?)\n\`\`\`', text)
data = yaml.safe_load(m.group(1))
assert len(data) == 7, f'expected 7 entries, got {len(data)}'
for e in data:
  for k in ['id','title','severity','phase','story','source','fix','lesson','mechanic']:
    assert k in e, f\"{e.get('id')} missing {k}\"
print('OK — 7 entries, all 9 keys present')
"
```
Expected: `OK — 7 entries, all 9 keys present`.

- [ ] **Step 3: Commit**

```bash
git -C /Users/derrickteo/codings/dt-site-creator add archetypes/backend-backed-app/pitfalls.md
git -C /Users/derrickteo/codings/dt-site-creator commit -m "archetype: backend-backed-app pitfalls.md (7 entries)"
git -C /Users/derrickteo/codings/dt-site-creator push
```

---

### Task 18: Write `archetypes/backend-backed-app/stack-candidates.md`

**Note:** Repo-only file. Not consumed by Assembly. Honest evaluator notes for unshipped tools.

- [ ] **Step 1: Write the file**

```markdown
# Backend-Backed App — Stack Candidates

Tools evaluated for this archetype but not yet shipped in any production project under derrick-pixel.

> **Why this file exists:** to keep the "evaluated, not yet adopted" judgment honest. Future-you reads this before reaching for a tool listed here and decides if the trigger condition has finally arrived.
> **Not consumed by the Assembly engine.** This is a repo-only reference page.

## Neon.tech

- **What it is:** Serverless Postgres with branching and instant compute scale-down.
- **Closest shipped:** Supabase Postgres (in elitez-ai-tender-creator, Elitez-ESOP migration).
- **Trigger for adoption:** First project that needs Postgres without Supabase's auth/storage bundle, and that benefits from per-PR branch databases (e.g., a heavy data-migration workflow).

## Upstash

- **What it is:** Serverless Redis with an HTTP API (no long-lived connection).
- **Closest shipped:** docker-compose Redis (sp-wsg-corenet local stack).
- **Trigger for adoption:** First project on a serverless platform (Vercel functions, CF Workers) that needs Redis but can't hold a long connection.

## Sentry.io

- **What it is:** Error monitoring and performance tracing.
- **Closest shipped:** browser console + Fly logs (sp-wsg-corenet).
- **Trigger for adoption:** First production outage I can't diagnose from logs alone — that's when the cost of Sentry pays itself back.

## Railway

- **What it is:** Container deploy platform (Heroku-shaped successor).
- **Closest shipped:** Fly.io (sp-wsg-corenet).
- **Trigger for adoption:** If Fly's pricing or region story changes. Same conceptual shape, so migration is feasible.

## Vercel

- **What it is:** Frontend-first deploy platform with edge functions and ISR.
- **Closest shipped:** CF Pages (for static sites — derrickteo.com fleet).
- **Trigger for adoption:** First Next.js project that needs serverless functions + edge runtime + ISR. CF Pages is fine for static; Vercel earns its keep when SSR + functions matter.
```

- [ ] **Step 2: Commit**

```bash
git -C /Users/derrickteo/codings/dt-site-creator add archetypes/backend-backed-app/stack-candidates.md
git -C /Users/derrickteo/codings/dt-site-creator commit -m "archetype: backend-backed-app stack-candidates.md (5 evaluators)"
git -C /Users/derrickteo/codings/dt-site-creator push
```

---

## Phase E — Showcase additions

### Task 19: Add 4 showcase entries to `dashboard/data/examples.json`

**Files:** Modify `dashboard/data/examples.json`.

- [ ] **Step 1: Inspect existing entry shape**

```bash
head -60 /Users/derrickteo/codings/dt-site-creator/dashboard/data/examples.json
```
Note the fields: slug, title, archetype, mechanics, status, live_url, preview_url, repo_url, thumbnail, description.

- [ ] **Step 2: Append 4 entries**

For each:
- `archetype: "backend-backed-app"` (or the actual primary archetype).
- `mechanics`: list the recipes the project anchors.
- `status` per spec Section 8.
- No `repo_url`.
- `thumbnail`: placeholder filename (Task 20 will generate the image).

Entries:

```json
{
  "slug": "sp-wsg-corenet",
  "title": "WSG / SP / BCA AI Job Redesign Toolkit",
  "archetype": "backend-backed-app",
  "mechanics": ["containerized-fastapi-fly", "magic-link-auth-supabase"],
  "status": "wip",
  "thumbnail": "dashboard/img/showcase/sp-wsg-corenet.jpg",
  "description": "FastAPI + Postgres+pgvector + Redis + Resend + Next.js. Multi-service Fly deploy. Private/internal."
},
{
  "slug": "elitez-lms",
  "title": "Elitez LMS (mock demo)",
  "archetype": "simulator-educational",
  "mechanics": ["localstorage-state"],
  "status": "wip",
  "thumbnail": "dashboard/img/showcase/elitez-lms.jpg",
  "description": "Static training platform with mocked auth. Documents the 'mock-stuck' pitfall — Supabase migration is a future phase."
},
{
  "slug": "elitez-ai-tender-creator",
  "title": "Elitez AI Tender Creator",
  "archetype": "backend-backed-app",
  "mechanics": ["magic-link-auth-supabase"],
  "status": "wip",
  "live_url": "https://tender.elitezaviation.com",
  "thumbnail": "dashboard/img/showcase/elitez-tender.jpg",
  "description": "4-step proposal generator. Gated by Supabase OTP + Resend + email-domain allowlist hook. The OTP wall IS the recipe demo."
},
{
  "slug": "elitez-esop",
  "title": "Elitez ESOP",
  "archetype": "backend-backed-app",
  "mechanics": ["magic-link-auth-supabase", "localstorage-state"],
  "status": "preview",
  "preview_url": "https://derrickteo.com/esop/",
  "thumbnail": "dashboard/img/showcase/elitez-esop.jpg",
  "description": "Employee Share Option Plan with event-sourced ledger. Migrating from static + localStorage to Supabase."
}
```

(Tender is `wip` per the preemptive decision in the spec — no live_url consumed by linkcheck.)

- [ ] **Step 3: Validate JSON**

```bash
python3 -c "import json; d = json.load(open('/Users/derrickteo/codings/dt-site-creator/dashboard/data/examples.json')); print(f'{len(d)} examples')"
```
Expected: count increased by 4.

- [ ] **Step 4: Add thumbnails**

Extend `scripts/generate-placeholders.py`'s SHOWCASE list with the 4 new slugs. Run:

```bash
cd /Users/derrickteo/codings/dt-site-creator && python3 scripts/generate-placeholders.py
```
Expected: 4 new files under `dashboard/img/showcase/`.

- [ ] **Step 5: Commit**

```bash
git -C /Users/derrickteo/codings/dt-site-creator add dashboard/data/examples.json dashboard/img/showcase/ scripts/generate-placeholders.py
git -C /Users/derrickteo/codings/dt-site-creator commit -m "showcase: add 4 backend-backed-app entries + placeholder thumbnails"
git -C /Users/derrickteo/codings/dt-site-creator push
```

---

## Phase F — Verification + housekeeping

### Task 20: Update top-level READMEs and mechanics README

**Files:** `README.md`, `mechanics/README.md`.

- [ ] **Step 1: Top-level `README.md` edits**

Update count and any "v2 (later)" roadmap items that are now shipped. Replace "Five archetype playbooks, nine reusable mechanics" (or whatever the current count says) with the new counts: 6 archetypes, ~25 mechanics.

- [ ] **Step 2: `mechanics/README.md` edits**

Add a "v3 mechanics (added 2026-05-11)" section with 4 rows for the new recipes following the existing table shape.

- [ ] **Step 3: Commit**

```bash
git -C /Users/derrickteo/codings/dt-site-creator add README.md mechanics/README.md
git -C /Users/derrickteo/codings/dt-site-creator commit -m "docs: update top-level counts; mechanics README v3 section"
git -C /Users/derrickteo/codings/dt-site-creator push
```

---

### Task 21: Bump cache-bust on every HTML page that loads modified JS

**Files:** `index.html`, `mechanics.html`, `showcase.html`, `pitfalls.html`, `assembly.html`, `setup.html`, `scope.html` (whichever load `assembly.js`, `pitfalls.js`, or `browse.js`).

- [ ] **Step 1: Find current `?v=N` values**

```bash
grep -rn "\?v=" /Users/derrickteo/codings/dt-site-creator/*.html | head -20
```
Note the highest current N. Pick N+1.

- [ ] **Step 2: Bump every `?v=` query string on `assembly.js`, `pitfalls.js`, `browse.js` references**

Edit each HTML file accordingly.

- [ ] **Step 3: Commit**

```bash
git -C /Users/derrickteo/codings/dt-site-creator add *.html
git -C /Users/derrickteo/codings/dt-site-creator commit -m "cache-bust: bump v on assembly/pitfalls/browse JS references"
git -C /Users/derrickteo/codings/dt-site-creator push
```

---

### Task 22: Run linkcheck

- [ ] **Step 1: Run locally**

```bash
cd /Users/derrickteo/codings/dt-site-creator && python3 scripts/linkcheck.py
```
Expected: passes. Tender entry has no `live_url` (it's `wip`) so no 401/403 issue.

- [ ] **Step 2: If failures**, decide per spec Section 9 (widen linkcheck pass list, OR keep entry `wip`).

---

### Task 23: Run local server and verify all 6 dashboard pages

- [ ] **Step 1: Start server**

```bash
cd /Users/derrickteo/codings/dt-site-creator && python3 -m http.server 8000
```

- [ ] **Step 2: In another terminal, smoke-test each page**

For each URL below, fetch and grep for archetype/mechanic markers:

```bash
# Archetypes page lists 6
curl -s http://localhost:8000/index.html | grep -c "backend-backed-app"  # >= 1

# Mechanics page lists production-stack category
curl -s http://localhost:8000/mechanics.html | grep -c "production-stack"  # >= 1

# Pitfalls page loads (full check requires browser)
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/pitfalls.html  # 200

# Assembly page loads
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/assembly.html  # 200

# Showcase page lists new entries
curl -s http://localhost:8000/showcase.html | grep -c "sp-wsg-corenet"  # >= 1
```

- [ ] **Step 3: Browser-mode smoke test**

Open `http://localhost:8000` in a browser. Manually verify:
1. Index shows 6 archetype tiles (look for the new "Backend-Backed App" tile).
2. Click "Backend-Backed App" → scoping flow → assembly page loads it.
3. Mechanics page shows "Production Stack" section with 4 cards.
4. Pitfalls page shows 7 new pitfalls (filter by archetype = backend-backed-app).
5. Showcase shows 4 new entries with correct status badges.
6. Assembly page: tick the new archetype + a couple of mechanics, click "Copy prompt" — verify the assembled prompt inlines the new recipe snippets.

- [ ] **Step 4: Stop the server**

`Ctrl-C` the python http.server.

- [ ] **Step 5: No commit** (verification only).

---

### Task 24: Sync derrickteo.com mirror

- [ ] **Step 1: Run sync script**

```bash
cd /Users/derrickteo/codings/dt-public
bash sync-wip.sh
git add -A
git status  # confirm dt-site-creator changes are staged
git commit -m "mirror: sync dt-site-creator with backend-backed-app archetype"
git push
```

- [ ] **Step 2: Verify live**

After ~1 minute, fetch `https://derrickteo.com/dt-site-creator/index.html` and verify the backend-backed-app tile is present.

---

## Self-review checklist (run before declaring complete)

- [ ] All 8 archetype contract files exist and are non-empty.
- [ ] All 4 mechanic folders have all 5 files (meta.json, snippet.html, README.md, example-use.md, preview.jpg).
- [ ] `python3 -c "import json; json.load(open(f))"` passes for archetypes.json, mechanics.json, examples.json, and every meta.json.
- [ ] `verify-scoring.py` reports 7/7 pass.
- [ ] `node --check` passes for the 3 modified JS files.
- [ ] `linkcheck.py` passes.
- [ ] 7 new pitfalls parse via the YAML check from Task 17 step 2.
- [ ] Mirror is synced; live URL shows the new tile.

---

## Out of scope (per spec Section 10)

- MIGRATION.md template (deferred — pitfall #6 captures the lesson; no template generated).
- Migrating elitez-lms or Elitez-ESOP themselves.
- Real screenshots for new showcase entries.
- Sentry / Upstash / Neon / Railway / Vercel as full mechanics.
- Refactor of existing 5 archetypes.
- Widening linkcheck to accept 401/403 (deferred follow-up that would promote tender to `preview`).

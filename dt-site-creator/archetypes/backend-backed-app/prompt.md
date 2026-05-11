# Backend-Backed App — Build Prompt

Copy and paste the block below into Claude Code. It boots Claude into the v2 7-agent orchestrated chain for this archetype.

---

You are dt-site-creator (v2, 7-agent orchestrator) building a **backend-backed app**.

**Project:** {{project_description}}

**Scoping context:** {{scoping_answers}}

**Required mechanics:** {{ticked_mechanics}}

**⚠️ Avoid these archetype-specific pitfalls:**
{{pitfalls_warnings}}

---

> This is the rule book Claude should follow when building a backend-backed app. The 6 design rules below are non-negotiable. The required choices come from your project description.

## 1. Open with the project goal

Replace this paragraph with what you're building. Examples:
- "Build me a multi-user training platform with email login and Postgres."
- "Build me an internal Streamlit dashboard for the ops team, SFA-restricted to elitez.asia accounts."
- "Build me a gated proposal generator: Supabase magic-link + CF Pages deploy."

If you're not sure which stack fits, declare "TBD — Agent 1 will resolve" and let the scoping agent decide. Do not skip scoping.

---

## 2. Required choices (state explicitly before any code)

Declare each choice before the first line of code is written. Agent 1 confirms these — if any are missing, the build halts.

**Auth pattern — pick one:**
- `magic-link-auth-supabase` — email OTP via Resend + Supabase Auth + `before-user-created` domain-allowlist hook. Default for any app that needs real multi-user identity.
- `cf-zero-trust-static-admin` — Cloudflare Access + Google OAuth on a static admin path. Use when the "app" is a static page and you only need to gate who can view it.

**Persistence — pick one:**
- Supabase Postgres — default when using `magic-link-auth-supabase`. Auth and DB in one place.
- Postgres on Fly — default for `containerized-fastapi-fly`. You manage the instance; more control, more ops.
- Neon.tech — stack-candidate only. Read `stack-candidates.md` trigger condition before adopting.

**Email — required if magic-link chosen:**
- Resend is the only supported provider. Sender domain must show SPF + DKIM "verified" in the Resend dashboard before first user-facing send. See pitfall `bba-resend-dns-unverified`.

**Observability:**
- Structured logs to stdout in JSON → aggregated by Fly/CF Pages. Default and required from day one.
- Sentry — stack-candidate only. Adopt after the first outage you can't diagnose from logs alone.

**Deploy target — pick one:**
- Fly.io — default for containerized stacks (`containerized-fastapi-fly`).
- CF Pages — default for static admin gate (`cf-zero-trust-static-admin`).
- Streamlit Cloud — default for data dashboards (`streamlit-cloud-analytics`).
- Vercel — stack-candidate only. Adopt when SSR + edge functions + ISR all matter simultaneously.

---

## 3. Non-negotiable design rules

These are the 6 rules from `archetypes/backend-backed-app/CLAUDE.md §2`. They apply to every build under this archetype without exception.

1. **Real DB, not localStorage alone.** Postgres is the default. localStorage is acceptable for ephemeral client-side state inside an authenticated session, not as the primary store.
2. **Real auth, not a shared-password gate.** Supabase Auth (magic-link + domain allowlist) or Cloudflare Zero Trust (Google OAuth). A hardcoded password in JS is not authentication.
3. **Secrets via `.env.example` + `.gitignore` + deploy-platform secrets store.** `.env.example` committed (placeholders only). Real `.env` gitignored. Production secrets in the platform's secrets UI.
4. **Observability from day one.** Structured JSON logs to stdout. Fly/CF aggregate automatically.
5. **Deploy config lives in the repo.** `fly.toml`, `docker-compose.yml`, `supabase/config.toml`, `.streamlit/config.toml` — whichever applies, it is committed.
6. **Local dev mirrors prod with mocks.** MailHog for SMTP (port 1025/8025). MinIO for S3-compatible storage. Tests use DI or environment flags to swap them in — never prod credentials in local dev.

---

## 4. Test expectations

Agent 7 cannot sign off until these pass:

**Auth flow tests (required):**
- Submit a known-allowlisted email → confirm the OTP/magic-link path completes successfully.
- Submit a non-allowlisted email → confirm the `before-user-created` hook raises an exception and the user row is NOT created.
- Verify the sign-in, magic-link-sent, and error screens all render correctly at 375px and 1280px.

**Secrets hygiene (required):**
```bash
git grep "RESEND_API_KEY\|SUPABASE_ANON_KEY\|SUPABASE_SERVICE_KEY" -- ':!*.example' ':!*.md'
```
This must return no matches. Any hit is a blocker.

**Deploy config audit (required):**
- Confirm `fly.toml` / `docker-compose.yml` / `.streamlit/config.toml` (whichever applies) exists and is committed.
- Confirm `.env.example` is committed and shows all required variable names with placeholder values.
- Confirm real `.env` is in `.gitignore`.

---

## 5. Deploy expectations

Before shipping, confirm:

- All deploy config files are committed to the repo.
- Secrets are NOT committed — only `.env.example` with placeholder values.
- README has two sections: **Run locally** and **Deploy**. Both are accurate to the actual stack.
- If using Fly.io: `flyctl status` shows the app as running after first deploy.
- If using Streamlit Cloud: `st.secrets` keys match `.streamlit/secrets.toml.example` keys.
- If using CF Pages: the manual `wrangler pages deploy` step is documented (or Git auto-deploy is connected).

---

## 6. Out of scope

This prompt assumes the project genuinely needs a backend. If you are not certain, run scoping first via Agent 1 (Brief & Archetype Router). The right archetype might be:

- `static-informational` — if the app is content-only with no cross-device data.
- `transactional` — if the primary flow is checkout, with no auth required.
- `simulator-educational` — if the goal is guided learning or scored scenarios.
- `game` — if the experience is goal-driven with win conditions.
- `dashboard-analytics` — if the output is read-only data visualization with no user accounts.

---

**Style authority:** `archetypes/backend-backed-app/CLAUDE.md`
**Agent dispatch order + skip rules:** `archetypes/backend-backed-app/agents.md`
**JSON schemas:** `archetypes/backend-backed-app/data-contract.md` + `FIELD-DICTIONARY.md`
**Pitfalls:** `archetypes/backend-backed-app/pitfalls.md`
**Master orchestrator:** `masterprompt.txt` + `AGENT.md`

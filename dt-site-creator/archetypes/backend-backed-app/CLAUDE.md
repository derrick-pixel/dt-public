# DT Site Creator — Backend-Backed App Archetype Playbook

This is the canonical playbook for the **backend-backed-app** archetype: multi-user apps with real auth, server-side persistence, outbound email, and observability requirements. When a project genuinely needs more than a browser can hold, this archetype takes over from static-informational.

For other archetypes, see sibling folders in `/archetypes/`.

---

## §1 — When this archetype wins

Pick backend-backed-app when the project crosses any of these lines:

- **Multi-user:** two or more people log in with separate identities and see different data.
- **Real auth:** a shared-password gate or localStorage session is not enough — the system needs email-verified identity.
- **Cross-device persistence:** data must survive a cleared browser or a different device. localStorage alone fails here.
- **Outbound email:** transactional mail (magic links, confirmations, alerts) goes out via an API, not a form-to-email relay.
- **Observability:** you need to know who did what, when, and whether it succeeded — structured logs or error tracking matter.

These are additive. One is enough to trigger this archetype. If none apply, read §7 to find the right fit.

---

## §2 — Design rules (non-negotiable)

Six rules. Follow them exactly. They encode lessons from production failures — see §5 for the war stories.

**Rule 1 — Real DB, not localStorage alone.**
Postgres (Supabase / Neon / Fly-hosted) is the default persistence layer for data shared across users or devices. localStorage is acceptable for ephemeral client-side state *inside* an authenticated session — not as the primary store.

**Rule 2 — Real auth, not a shared-password gate.**
Use Supabase Auth (magic-link OTP + domain allowlist) or Cloudflare Zero Trust (Google OAuth). A hardcoded password in JS is not authentication — it's a comment.

**Rule 3 — Secrets via `.env.example` + `.gitignore` + deploy-platform secrets store.**
`.env.example` is committed and shows the shape of every required variable with placeholder values. The real `.env` (and `.streamlit/secrets.toml`) is gitignored and never committed. Production secrets live in the deploy platform's secrets UI (Fly secrets, Streamlit Cloud Secrets, CF Pages environment variables).

**Rule 4 — Observability from day one.**
Ship structured logs to stdout in JSON from the first deployed version. Fly.io and CF Pages aggregate them automatically. Sentry is evaluated (see `stack-candidates.md`) but not required at launch — logs first, Sentry when logs aren't enough.

**Rule 5 — Deploy config lives in the repo.**
Whichever platform you deploy to, its config file is committed: `fly.toml` for Fly.io, `docker-compose.yml` + `Dockerfile` for containerized stacks, `supabase/config.toml` for Supabase local dev, `.streamlit/config.toml` for Streamlit. Future-you needs these to reproduce the deploy.

**Rule 6 — Local dev mirrors prod with mocks.**
When production uses Resend for email, local dev uses MailHog (SMTP port 1025, UI port 8025). When production uses S3-compatible storage, local dev uses MinIO. Tests swap these via dependency injection or environment flags — never by shipping untested prod credentials to developers.

---

## §3 — Core mechanics

Four integration recipes ship with this archetype. Read each mechanic's folder before wiring.

| Recipe | Emoji | What it covers |
|---|---|---|
| `magic-link-auth-supabase` | 🪄 | Email OTP via Resend + Supabase Auth + `before-user-created` domain-allowlist hook |
| `cf-zero-trust-static-admin` | 🛡️ | Cloudflare Access + Google OAuth on a static admin path; no backend required |
| `containerized-fastapi-fly` | 🐳 | FastAPI + Postgres + docker-compose local dev + multi-service Fly deploy |
| `streamlit-cloud-analytics` | 📊 | Streamlit Cloud deploy + `st.secrets` + optional Supabase Postgres data source |

These are building blocks, not a menu — most real projects combine two. See §4.

---

## §4 — Common stack pairings

Three tested configurations with real project anchors:

**Hosted production stack** (sp-wsg-corenet pattern)
Combine `containerized-fastapi-fly` + `magic-link-auth-supabase`. FastAPI handles all API routes; Supabase handles auth and the Postgres instance. Multi-service Fly deploy: backend, cron, staging as separate Fly apps. docker-compose for local dev with MailHog + MinIO mocks.

Use when: the project has meaningful API surface, background jobs, or data that changes frequently.

**Static admin gate** (derrickteo.com fleet pattern)
`cf-zero-trust-static-admin` alone. No backend — the "app" is a set of static HTML admin pages that Cloudflare Access gates with Google OAuth. Zero server to maintain.

Use when: the pages are read-only (dashboards, admin panels) and the data comes from JSON files or a third-party API. If you need writes, add a backend.

**Quick data dashboard** (market-tracker pattern)
`streamlit-cloud-analytics` alone, or paired with `magic-link-auth-supabase` when SFA restrictions apply (see yishun-dorm-pitch). Pure Python — no separate frontend framework. Secrets in Streamlit Cloud's UI.

Use when: the primary output is data visualization and the audience is internal. Don't reach for this when the app needs a polished public-facing UI.

---

## §5 — Pitfalls to read first

Seven entries in `pitfalls.md`. Read before touching auth or deploy config.

- **bba-cf-access-otp-unreliable** — CF Access OTP has inbox-placement issues on SG providers. Use Google IdP from day one.
- **bba-supabase-silent-public** — Without the `before-user-created` Postgres hook, your magic-link "allowlist" is a UI suggestion. Anyone can sign up.
- **bba-resend-dns-unverified** — Resend shows "sent" even when SPF/DKIM are unverified. Verify the sender domain before the first user-facing send.
- **bba-docker-port-collision** — Host-side port 5432 is shared. Running two Postgres containers simultaneously silently hangs.
- **bba-cf-pages-no-autodeploy** — If your CF Pages project has no Git provider connected, pushes don't deploy. Document the manual `wrangler pages deploy` step.
- **bba-mock-auth-stuck** — Static mock auth has gravitational pull. By the time you want to leave it, you've built around it. Write the migration spec up front.
- **bba-streamlit-secrets-mismatch** — Streamlit Cloud is a sandbox. Secrets live in the UI, accessed via `st.secrets`. Match local and prod from day one.

---

## §6 — Stack candidates

See `stack-candidates.md` for tools evaluated but not yet adopted in any production project under derrick-pixel. The file covers: Neon.tech, Upstash, Sentry, Railway, Vercel.

Read the trigger conditions before reaching for any tool listed there. "Evaluated" is not "recommended" — it means the tradeoffs are documented and the adoption bar is stated explicitly.

---

## §7 — Out of scope for this archetype

Route elsewhere when:

| If the project needs... | Use archetype |
|---|---|
| Pure marketing or portfolio site | `static-informational` |
| Checkout / payment flow without auth | `transactional` |
| Goal-driven gameplay or scoring | `game` |
| Read-only analytics, no user accounts | `dashboard-analytics` |
| Tutorialised / guided learning content | `simulator-educational` |

The scoping router (`archetypes/README.md`) has the decision matrix. Agent 1 follows it strictly — override with a stated reason, not instinct.

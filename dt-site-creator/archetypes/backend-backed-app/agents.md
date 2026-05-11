# Backend-Backed App — Agent Dispatch

**Sibling fork recommendation:** Optional for this archetype. If the app has a marketing-facing landing page, run `competitor-intel-template` first to hydrate `admin.html`. If the app is purely internal (no public page), skip it.

---

## Dispatch order

```
[1] Agent 1 (Brief & Archetype Router)
        ↓ confirms auth pattern + persistence + deploy target
[2] Agents 2 + 3 in parallel
        ↓ produces /data/palette.json + /colors.html
        ↓ produces /data/sitemap.json + auth-page copy
[3] Human picks palette from colors.html
        ↓
[4] Agent 4 (Wiring)
        ↓ produces .env.example, .gitignore, Supabase/CF Access config, local mocks
[5] Agent 5 (Build)
        ↓ builds backend + frontend + deploy config + docker-compose (if containerized)
[6] Agent 6 (SEO / OG / Asset Engineer)
        ↓ produces og-image.jpg, favicon set, sitemap.xml, robots.txt
[7] Agent 7 (QA & Pitfall Curator)
        ↓ runs auth flow end-to-end, secrets audit, deploy-config audit
```

Agents 2 and 3 run in parallel. Agents 4 and 5 are sequential — wiring must be complete before build begins.

---

## Agent 1 — Scoping

**Role:** Confirm this is the right archetype and lock the three required choices.

Before writing `brief.json`, Agent 1 must confirm:
1. **Auth pattern** — `magic-link-auth-supabase` or `cf-zero-trust-static-admin`. If neither is declared, ask once. If the answer is still unclear after one clarifying question, default to `magic-link-auth-supabase` and document the assumption.
2. **Persistence** — Supabase Postgres (default), Postgres on Fly (containerized), or Neon (stack-candidate — requires stated reason to adopt).
3. **Deploy target** — Fly.io, CF Pages, Streamlit Cloud, or Vercel (stack-candidate — requires stated reason to adopt).

If any of the three are missing from the brief and cannot be inferred, Agent 1 halts the chain and asks. Do not infer a deploy target from the framework — infer it from the stated constraints.

---

## Agent 2 — Visual / Palette

**Role:** Same as other archetypes. Generate `colors.html` with 5 diametrically distinct palettes. Pair the chosen palette with the project's frontend framework:
- Next.js / vanilla HTML → standard dt-site-creator palette system.
- Streamlit → document the palette but note that Streamlit theming is limited to `[theme]` in `config.toml`; full palette expression happens in custom components only.

For sign-in-gated apps, the palette must work at the sign-in screen — this is often the only public-facing page. Don't design only for the logged-in state.

---

## Agent 3 — Content / Copy

**Role:** Same as other archetypes for the public-facing pages. Extended for this archetype: write the auth-page copy.

Auth-page copy includes:
- **Sign-in screen** — headline, subhead, email input label, submit button label. Tone: reassuring and direct. The user is about to enter their email; don't interrogate them.
- **Magic-link sent screen** — confirmation message explaining what to do next. Be specific: "Check your inbox at {{email}} — a 6-digit code will arrive in under a minute."
- **Error screens** — invalid domain, expired code, generic error. Each needs a message and a recovery action. Don't show raw error strings.
- **Logged-out / session-expired screen** — brief message + sign-in CTA.

These four screens are microcopy, not hero copy. Write them in `copy.json` under `pages.auth.*`.

---

## Agent 4 — Wiring

**Role:** Extended for this archetype. Agent 4 owns the auth bootstrapping.

Wiring deliverables:
- `.env.example` — all required variable names with placeholder values. Never real keys.
- `.gitignore` — confirms `.env`, `.streamlit/secrets.toml`, and any key files are excluded.
- Supabase client init (if using Supabase) — `supabase/config.toml` for local dev, `lib/supabase.ts` or `utils/supabase.py` for app-layer client.
- CF Access config (if using CF Zero Trust) — documents the application path, IdP setup, and policy in `docs/cf-access-setup.md`.
- Local mock setup — `docker-compose.yml` services for MailHog (email) and MinIO (storage) when the containerized stack is used; `.env.local` overrides for Streamlit if using Streamlit.

Agent 4 does NOT write application logic — that belongs to Agent 5. Wiring ends at the point where the auth client is initialised and environment variables are loaded. App code is not Agent 4's scope.

---

## Agent 5 — Build

**Role:** Extended for this archetype. Builds the full application.

Build deliverables:
- **Backend** (if using `containerized-fastapi-fly`) — FastAPI app with routes, models, Alembic migrations, structured logging middleware.
- **Frontend** — pages consuming the auth state (sign-in, dashboard, protected routes).
- **Deploy config** — `fly.toml` (Fly), `Dockerfile` + `docker-compose.yml` (containerized), `supabase/config.toml` (Supabase), `.streamlit/config.toml` (Streamlit).
- **README** — two required sections: "Run locally" and "Deploy." Both must be accurate before Agent 5 hands off.

When the archetype is Streamlit Cloud only (no containerized stack), Agent 5 skips Docker entirely. Build is a single `app.py` (or `main.py`) with `requirements.txt` and `.streamlit/config.toml`.

---

## Agent 6 — SEO / Meta

**Role:** Same as other archetypes. The sign-in landing page is still a public page and needs full OG, schema, and favicon treatment.

For sign-in-gated apps: generate OG and schema for the public-facing pages only. Pages behind the auth wall do not need OG images (they won't be shared). Favicon applies everywhere.

---

## Agent 7 — QA

**Role:** Extended for this archetype. Three QA surfaces beyond the standard visual pass:

**Auth flow test:**
- Confirm sign-in with an allowlisted email succeeds end-to-end (OTP sent + code accepted + session created).
- Confirm sign-in with a non-allowlisted email fails at the DB layer — user row is NOT created.
- Confirm all four auth screens render at 375px and 1280px without layout breaks.

**Secrets audit:**
```bash
git grep "RESEND_API_KEY\|SUPABASE_ANON_KEY\|SUPABASE_SERVICE_KEY\|OPENAI_API_KEY" -- ':!*.example' ':!*.md'
```
Zero matches required. Any match is a blocker — the file with the real key is committed and must be removed from git history, not just `.gitignore`d.

**Deploy-config audit:**
- At least one of `fly.toml`, `docker-compose.yml`, `.streamlit/config.toml`, `supabase/config.toml` must be present and committed.
- `.env.example` must be committed and list all variable names referenced in application code.
- Real `.env` (and real `secrets.toml`) must be confirmed absent from the commit tree.

Agent 7 writes proposals to `methodology/proposals/<date>-<project>.md` only — does NOT edit archetype files directly.

---

## Required pages

| Page | Owner | Notes |
|---|---|---|
| `index.html` / landing | Agents 3 + 5 | Public-facing; needs full OG + schema |
| `auth/sign-in` | Agents 3 + 5 | Sign-in screen; needs auth-page copy from Agent 3 |
| `auth/check-email` | Agents 3 + 5 | Magic-link sent confirmation |
| `dashboard` | Agent 5 | Protected; visible only after sign-in |
| `colors.html` | Agent 2 | Transient — remove after palette picked |

---

## Skip rules

If `brief.constraints[]` includes:
- `no-public-landing` → skip `index.html`; the only public-facing page is `auth/sign-in`.
- `streamlit-only` → skip Dockerfile, docker-compose, Next.js scaffolding; Agent 5 ships a single Python app.
- `cf-zero-trust-only` → skip Supabase setup; Agent 4 wires CF Access config only.

Document overrides in `brief.json.constraints[]` so Agent 7 can audit them.

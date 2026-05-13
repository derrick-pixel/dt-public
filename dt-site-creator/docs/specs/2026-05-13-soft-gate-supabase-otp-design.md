# Soft Gate: Supabase OTP for Full Prompts — Design

**Date:** 2026-05-13
**Status:** Draft (awaiting user review)
**Driver:** dt-site-creator is fully public. The methodology archive's most valuable artifact — the full assembled prompts (archetype playbooks, mechanic snippets, the Assembly output) — is freely consumable by visitors, scrapers, and LLM crawlers with no email capture. We want a soft gate: browse freely, sign in with email + OTP to view full prompts. Dogfoods the `magic-link-auth-supabase` recipe shipped in the backend-backed-app archetype.

---

## 1. Problem

The full IP — the inlined-prompt output from Assembly, the snippet code in mechanic docs, the archetype playbooks — sits behind no friction. We have no idea who consumes it. We can't:

- Know who's reading.
- Reach out when a new mechanic ships.
- Tell visitors apart from scrapers.

A real edge-level gate (CF Access + disabling GH Pages) is a heavier lift and changes the site's public character. A soft in-page gate gets us email capture immediately while keeping the discovery surface open.

## 2. Goals

- Email + 6-digit OTP sign-in required to view **full prompt content** (archetype playbooks, mechanic snippets/READMEs, Assembly compose output).
- Browsing UI stays public (cards, summaries, descriptions, pitfalls wall, ecosystem diagram, scoping quiz).
- One-time sign-in per visitor — Supabase session persists across pages and reloads.
- Every sign-up email lands in the Supabase auth.users table — direct queryable lead list.
- Dogfoods the `magic-link-auth-supabase` mechanic; project-self-documents the recipe.

## 3. Non-goals

- Real security (CF Access at the edge + disabling GH Pages would do that — separate decision, deferred).
- Per-content access control (every signed-in visitor sees everything).
- Automation: webhook to Slack / Google Sheet / email marketing tool (out of scope for v1).
- Re-engagement campaigns to past sign-ups.
- Multi-tier access (e.g., "verified Elitez staff see extra content").

## 4. Public vs Gated

**Public (no sign-in required):**

- `index.html` — archetype tiles, scoping quiz, archetype recommendation panel.
- `mechanics.html` — mechanic cards (icon + name + summary + fits matrix).
- `assembly.html` — archetype picker + mechanic checklist (selection UI only).
- `showcase.html` — full showcase list.
- `pitfalls.html` — full pitfalls wall (all 50+ entries).
- `ecosystem.html` — full diagram with all 18 nodes + filter pills + tooltips.
- `setup.html` — full setup guide.

**Gated (sign-in required to reveal):**

- The **Assembly compose output** (`assembly.js` → `compose()`) — clicking "Generate prompt" or any equivalent trigger that exposes the full inlined prompt.
- The **mechanic doc modal** (`browse.js` → "View snippet" / "Full README") — content of `mechanics/<id>/snippet.html` and `mechanics/<id>/README.md` displayed in-modal.
- **Archetype playbook viewer** (`main.js` → "View playbook" button on archetype detail) — content of `archetypes/<id>/CLAUDE.md` displayed in-modal or panel.

For each gated action: if the user has no Supabase session, the auth modal opens. After successful verification, the original action proceeds (fetch + display).

## 5. Auth modal UX

Matches the existing site's modal pattern (the mechanics doc modal). Two stages:

**Stage 1 — Email:**

```
┌─────────────────────────────────────────────┐
│  Sign in to view full prompts               │
│                                             │
│  We'll email you a 6-digit code.            │
│  No password. No spam.                      │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ your.email@domain.com                 │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  [ Send code ]                              │
└─────────────────────────────────────────────┘
```

**Stage 2 — OTP:**

```
┌─────────────────────────────────────────────┐
│  Check your inbox                           │
│                                             │
│  We sent a 6-digit code to                  │
│  your.email@domain.com                      │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ 123456                                │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  [ Verify ]    Wrong email? Start over      │
└─────────────────────────────────────────────┘
```

**Success:** modal closes; the original gated action proceeds (fetch + display). A subtle "Signed in as you@email.com · Sign out" indicator appears in the site header (right of the nav, before the hamburger).

**Already signed in:** the gated action skips the modal and proceeds directly.

**Cancel / close:** the original action aborts. No content loaded.

## 6. Architecture

### 6.1 New files

- `dashboard/js/auth.js` — IIFE that exposes `window.dtsAuth` with:
  - `dtsAuth.isSignedIn()` → `Promise<boolean>`
  - `dtsAuth.getUserEmail()` → `Promise<string | null>`
  - `dtsAuth.signInFlow()` → `Promise<{ ok: true, email } | { ok: false, reason }>` — opens modal, resolves when verified or rejects on cancel
  - `dtsAuth.signOut()` → `Promise<void>`
  - `dtsAuth.requireAuthThen(fn)` — helper: if signed in, call `fn()`; else run signInFlow() then call `fn()` on success
- `dashboard/js/auth-config.js` — committed file containing:
  - `window.SUPABASE_URL = 'https://<project-ref>.supabase.co'`
  - `window.SUPABASE_ANON_KEY = '<anon-key>'`
  - Note: Supabase anon keys are designed to be public-safe (security is enforced by RLS policies in Postgres, not by hiding the key). OK to commit.
- `dashboard/css/auth.css` — modal styles + header signed-in indicator + opacity transitions.

### 6.2 External dependency

Add to all HTML pages (immediately before `auth-config.js`):

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="dashboard/js/auth-config.js"></script>
<script src="dashboard/js/auth.js"></script>
```

This must load BEFORE any other JS that calls `dtsAuth.*` (i.e., before `main.js`, `assembly.js`, `browse.js`).

### 6.3 Wiring into existing JS

- `dashboard/js/browse.js` — wrap the doc-modal fetch (`fetchText('mechanics/...')`) call. Pseudo:
  ```javascript
  modalOpenBtn.addEventListener('click', () => {
    dtsAuth.requireAuthThen(() => {
      fetchText('mechanics/' + id + '/snippet.html').then(render);
    });
  });
  ```
- `dashboard/js/assembly.js` — wrap the entry to `compose()` (the function that fetches CLAUDE.md and snippet.html files). User clicks "Generate prompt" (or whatever trigger) → `dtsAuth.requireAuthThen(compose)`.
- `dashboard/js/main.js` — wrap any "View playbook" button on archetype detail that fetches CLAUDE.md.

### 6.4 Header indicator

In each HTML page's `<nav class="nav-right">`, after the existing `<a class="btn-outline btn-sm" href="assembly.html">Prompt Assembly →</a>`, add:

```html
<span id="auth-status" class="auth-status" hidden></span>
```

`auth.js` populates it on page load: if signed in, displays `signed in as you@email · sign out`; else displays nothing (hidden). Click "sign out" → calls `dtsAuth.signOut()` → page reloads.

## 7. Supabase project setup (manual, user task)

Before any code can work, you (the user) need to:

1. Create a new Supabase project named `dt-site-creator-soft-gate` (or similar).
2. Note the Project URL and anon key — these go into `dashboard/js/auth-config.js` (committed file).
3. In Supabase → Authentication → Providers → Email — enable email OTP. Disable password sign-in (we're OTP-only).
4. In Supabase → Authentication → URL Configuration — set redirect URLs:
   - `https://derrickteo.com/dt-site-creator/**`
   - `https://derrick-pixel.github.io/dt-site-creator/**`
   - `http://localhost:8000/**` (for local dev)
5. In Supabase → Authentication → SMTP Settings — connect Resend (next section).
6. **No allowlist hook.** Per user decision, anyone with a real email can sign up. We rely on email verification (the OTP itself) to filter bots.

## 8. Resend sender setup (manual, user task)

1. In Resend, decide and verify a sender address. Recommended: `prompts@elitezaviation.com` (sub-mailbox of the already-verified `elitezaviation.com` domain — no new DNS setup).
2. Confirm SPF + DKIM still pass for the new sender.
3. In Supabase SMTP Settings (step 7.5 above), enter:
   - Host: `smtp.resend.com`
   - Port: 587 (or 465 with TLS)
   - Username: `resend`
   - Password: your Resend API key
   - Sender email: `prompts@elitezaviation.com`
   - Sender name: `DT Site Creator`
4. Send a test email to your own inbox to verify delivery.

## 9. Lead capture

For v1, all sign-ins land in Supabase `auth.users`. To pull the lead list:

```sql
select email, created_at, last_sign_in_at, raw_user_meta_data
from auth.users
order by created_at desc;
```

You can export from the Supabase dashboard or write a small Python script. Automation (webhook to a Google Sheet / Slack notification / email digest) is **out of scope** for v1 — deferrable to a future iteration if the volume justifies it.

## 10. Honest caveats (not security)

The user agreed to this in the brainstorm. Re-stating for the design doc:

- **DevTools / curl bypass.** A motivated visitor opens the network tab, sees `fetch('mechanics/X/snippet.html')`, and fetches the URL directly. The file is publicly served by GH Pages. The gate stops:
  - Casual visitors who'd respect the gate.
  - LLM crawlers that don't execute JS or persist cookies.
  - Search engine indexers (the gated content is fetched on-demand, not in the initial HTML).
  - Bots that don't bother with OTP flows.
- **github.io URL serves the same files.** The gate runs in JS on both URLs but the underlying files leak from both.
- **No edge security.** Real lockdown requires CF Access path-scoped on derrickteo.com + disabling GH Pages. Out of scope for this design but documented as a future-layer option.

This gate is a **lead-capture gate**, not a security boundary.

## 11. Files created / modified

**Created:**

- `dashboard/js/auth.js` — Supabase client wrapper, modal logic, session check.
- `dashboard/js/auth-config.js` — Supabase URL + anon key constants.
- `dashboard/css/auth.css` — modal + header-indicator styles.
- `docs/RUN-AUTH-SETUP.md` — short README documenting the manual Supabase + Resend setup steps from §7-§8 (so future-you doesn't re-figure it out).

**Modified:**

- All 7 HTML pages (`index.html`, `mechanics.html`, `assembly.html`, `showcase.html`, `ecosystem.html`, `pitfalls.html`, `setup.html`) — add Supabase JS CDN + auth-config.js + auth.js + auth.css; add `<span id="auth-status">` to nav-right.
- `dashboard/js/browse.js` — wrap mechanic doc-modal fetch in `dtsAuth.requireAuthThen(...)`.
- `dashboard/js/assembly.js` — wrap the `compose()` trigger in `dtsAuth.requireAuthThen(...)`.
- `dashboard/js/main.js` — wrap archetype "View playbook" button (if it exists) in `dtsAuth.requireAuthThen(...)`.

## 12. Out of scope

- CF Access edge gate.
- Disabling GH Pages.
- Privatizing the repo.
- Automation of lead-list export.
- Re-engagement email campaigns.
- Multi-tier access.
- Per-mechanic / per-archetype RLS rules.
- "Forgot to verify" UX (retry / resend code) beyond the basic "Wrong email? Start over" link.

## 13. Acceptance criteria

- [ ] Unauthenticated visitor can browse all 7 HTML pages and see all cards / summaries / tiles / diagrams.
- [ ] Clicking "View snippet" or "Full README" on a mechanic card opens the auth modal (if not signed in).
- [ ] Clicking the "Generate prompt" action on assembly.html opens the auth modal (if not signed in).
- [ ] Clicking "View playbook" on an archetype detail opens the auth modal (if not signed in and the button exists).
- [ ] After OTP verification, the originally-clicked action proceeds (content reveals).
- [ ] Session persists across page navigation and reload (Supabase localStorage default).
- [ ] Header shows `signed in as you@email · sign out` after sign-in.
- [ ] Clicking sign-out clears the session and reloads.
- [ ] Supabase auth.users table contains the verified email after sign-up.
- [ ] All modified JS passes `node --check`.
- [ ] No real secrets committed (only Supabase anon key, which is designed to be public).
- [ ] Mirrored to derrickteo.com via dt-public/sync-wip.sh.

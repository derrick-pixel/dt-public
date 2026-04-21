# Methodology Archive v1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship v1 of dt-site-creator as an interactive HTML dashboard + Claude-readable playbook library that proposes the right archetype, mechanics, and pitfalls at project start — browsable by Derrick, demoable to friends, teachable to trainees.

**Architecture:** Static-site dashboard at repo root (GitHub Pages) reads JSON/markdown from `/dashboard/data/`, `/archetypes/`, and `/mechanics/`. Pure vanilla HTML/CSS/JS, no frameworks, no server. Playbook library is dual-purpose: dashboard renders it, Claude reads it directly.

**Tech Stack:** Vanilla HTML5 + CSS3 + JavaScript (no frameworks), Google Fonts CDN, GitHub Pages deployment. No build tools. `localStorage` for session state.

**Spec:** [`docs/specs/2026-04-18-methodology-archive-design.md`](../specs/2026-04-18-methodology-archive-design.md)

**Scope boundary:** v1 is **breadth** — all 5 archetypes present, only `static-informational` has deep CLAUDE.md. v1.5 and v2 are separate plans.

**Security rule (applies to all JS tasks):** Never use `innerHTML` with dynamic/untrusted content. Use `textContent`, `createElement`, `appendChild`, and `setAttribute` for all user-sourced or file-sourced content. `innerHTML` is only permitted for fully-static template strings containing no `${}` interpolation.

**Commit policy:** Commit and push after every task (site is on GitHub Pages; local edits are invisible until pushed).

---

## Phase 1 — Archive backbone (Claude-readable)

### Task 1: Scaffold repo structure

**Files:** directories only, no content

- [ ] **Step 1: Create all directories**

```bash
cd /Users/derrickteo/codings/dt-site-creator
mkdir -p dashboard/{css,js,data,samples/{static-informational,transactional,simulator-educational,game,dashboard-analytics,custom}}
mkdir -p archetypes/{static-informational,transactional,simulator-educational,game,dashboard-analytics}
mkdir -p mechanics/{paynow-qr,localstorage-state,admin-auth-gate,canvas-hero,chartjs-dashboard,pdf-pipeline,wizard-form,multi-page-scaffold,og-social-meta}
```

- [ ] **Step 2: Verify** — `find . -type d -not -path './.git*' -not -path './docs*' -not -path './reference*' -not -path './prompt*' | sort`

- [ ] **Step 3: Commit** — `git add . && git commit -m "scaffold: archetype + mechanic + dashboard folders" && git push`

---

### Task 2: Write `archetypes/README.md`

**Files:** Create `archetypes/README.md`

- [ ] **Step 1: Write the file**

```markdown
# Archetypes — Decision Matrix

When Claude is asked to build a new site, it reads this matrix first, picks the matching archetype, then reads that folder's 5-file contract.

## The 5 Archetypes

| Archetype | Use when | Past examples |
|---|---|---|
| [static-informational](./static-informational/) | Marketing / content, no transactions | casket, Lumana, vectorsky, XinceAI |
| [transactional](./transactional/) | Users pay, upload, or persist data | altru, discounter, the-commons |
| [simulator-educational](./simulator-educational/) | Interactive learning, calculators, scenario engines | market_tracker, dtws_works, ELIX-resume |
| [game](./game/) | Goal-driven play, scoring, progression | elixcraft |
| [dashboard-analytics](./dashboard-analytics/) | Data-heavy internal tools, auth-gated | eco-dashboard, elitez-csuite |

## 4-Question Scoping

1. Who visits? (public / customers / internal / learners)
2. Do users give you money or data? (no / one-time / recurring / escrow)
3. Core experience? (content / interaction / goal)
4. Live data layer? (no / dashboard / API)

Canonical weights in `/dashboard/data/archetypes.json`.

## The 5-File Contract

Every archetype folder contains: `CLAUDE.md`, `prompt.md`, `examples.md`, `mechanic-fit.md`, `pitfalls.md`.
```

- [ ] **Step 2: Commit** — `git add archetypes/README.md && git commit -m "archetypes: add decision matrix README" && git push`

---

### Task 3: Deep-fill `archetypes/static-informational/`

**Files:**
- Create: `archetypes/static-informational/CLAUDE.md` (migrated from root)
- Create: `archetypes/static-informational/prompt.md`
- Create: `archetypes/static-informational/examples.md`
- Create: `archetypes/static-informational/mechanic-fit.md`
- Create: `archetypes/static-informational/pitfalls.md`

- [ ] **Step 1: Migrate root CLAUDE.md**

```bash
cp CLAUDE.md archetypes/static-informational/CLAUDE.md
```

Then edit line 1 of `archetypes/static-informational/CLAUDE.md`:

- **Replace:** `# DT Site Creator — Derrick Teo's Website Style Agent`
- **With:**

```
# DT Site Creator — Static Informational Archetype Playbook

This is the canonical playbook for the **static-informational** archetype: marketing sites, portfolios, company profiles — content-only, no transactions, no data layer. For other archetypes, see sibling folders in `/archetypes/`.
```

- [ ] **Step 2: Write `archetypes/static-informational/prompt.md`**

```markdown
# Static Informational — Starter Prompt

Copy and paste the block below into Claude Code.

---

You are dt-site-creator building a **static-informational** site.

**Project:** {{project_description}}

**Scoping context:** {{scoping_answers}}

**Required mechanics:** {{ticked_mechanics}}

**⚠️ AVOID these pitfalls specific to this archetype:**
{{pitfalls_warnings}}

**Process:**
1. Create a new GitHub repo under `derrick-pixel` using `gh repo create` and push first commit within 5 minutes.
2. Run competitive research on 30+ sites. Produce `admin.html` and `admin-insights.html`.
3. Create `colors.html` with 5 distinct palettes. Wait for my pick.
4. Build main site per `archetypes/static-informational/CLAUDE.md`.
5. Generate 1200×630 OG image.
6. Commit and push every iteration.

**Style authority:** `archetypes/static-informational/CLAUDE.md`.
```

- [ ] **Step 3: Write `archetypes/static-informational/examples.md`**

(Content per spec §5.3 — 4 entries: casket, lumana, vectorsky, xinceai with live URLs, why-it-matches paragraphs, mechanic lists, screenshot paths `/dashboard/samples/static-informational/<name>.jpg`.)

Exact content:

```markdown
# Static Informational — Past Examples

## 1. casket (Passage)
- **Live:** https://derrick-pixel.github.io/casket/
- **Why it matches:** Content-only dignified commerce site. Product showcase, knowledge base, FAQ accordion.
- **Mechanics used:** multi-page-scaffold, og-social-meta, wizard-form
- **Screenshot:** `/dashboard/samples/static-informational/casket.jpg`

## 2. Lumana
- **Live:** https://derrick-pixel.github.io/Lumana/
- **Why it matches:** Aged-care ambient monitoring marketing site. Warm teal + cream, sensitive-topic audience.
- **Mechanics used:** multi-page-scaffold, og-social-meta, canvas-hero (subtle)
- **Screenshot:** `/dashboard/samples/static-informational/lumana.jpg`

## 3. vectorsky
- **Live:** https://derrick-pixel.github.io/vectorsky/
- **Why it matches:** Defence/manpower B2B site with canvas hero, targeting-bracket logo.
- **Mechanics used:** canvas-hero, multi-page-scaffold, og-social-meta
- **Screenshot:** `/dashboard/samples/static-informational/vectorsky.jpg`

## 4. XinceAI
- **Live:** https://derrick-pixel.github.io/XinceAI/
- **Why it matches:** AI services site with 9 workflow cards, ROI calc, grant flow.
- **Mechanics used:** multi-page-scaffold, wizard-form, admin-auth-gate, og-social-meta
- **Screenshot:** `/dashboard/samples/static-informational/xinceai.jpg`
```

- [ ] **Step 4: Write `archetypes/static-informational/mechanic-fit.md`**

```markdown
# Static Informational — Mechanic Fit

Human-readable summary. Authoritative source: each mechanic's `meta.json.fits["static-informational"]`.

| Mechanic | Fit | Notes |
|---|---|---|
| og-social-meta | core | Mandatory on every site |
| multi-page-scaffold | core | Standard for content-heavy sites |
| canvas-hero | optional | Tech/defence/aviation domains |
| wizard-form | optional | Lead-capture diagnostic or ROI calculator |
| admin-auth-gate | optional | Competitor-analytics admin panels |
| localstorage-state | rare | Only for preferences |
| chartjs-dashboard | rare | Only for data viz in marketing pages |
| pdf-pipeline | rare | Only if site outputs PDF |
| paynow-qr | rare | Use transactional archetype instead |
```

- [ ] **Step 5: Write `archetypes/static-informational/pitfalls.md`**

Content: 9 entries, exactly as authored in spec §3b (adapted to YAML schema). 4 universal + 5 static-specific. Place the entire YAML block inside a fenced code block with language `yaml`. Use literal schema from spec §5.5. (Each entry: id, title, severity, phase, story, source, fix as multiline block scalar, lesson, mechanic.)

Full content:

````markdown
# Static Informational — Pitfalls

Scar tissue from past sites. Dashboard parses this file's YAML block.

```yaml
- id: universal-no-push
  title: "The site that went live but nobody could see"
  severity: high
  phase: shipping
  story: "Edited locally, demoed in browser, didn't git push. GitHub Pages served the old version. Spent 30 minutes debugging."
  source: "Universal (every site)"
  fix: |
    After every change: git add . && git commit -m "..." && git push
    Verify on the live URL, not localhost.
  lesson: "GitHub Pages serves from the remote, not your disk."
  mechanic: null

- id: universal-dark-default
  title: "Another dark-cyan site"
  severity: medium
  phase: planning
  story: "Started with dark-cyan by default. Shipped a site identical to the last 3. Client couldn't distinguish their brand."
  source: "Universal (CLAUDE.md §2)"
  fix: |
    Generate colors.html with 5 distinct palettes before main site.
    Never reuse a previous site's accent.
  lesson: "Every brand needs its own personality."
  mechanic: null

- id: universal-stale-og
  title: "The WhatsApp preview showing last week's site"
  severity: medium
  phase: shipping
  story: "Redesigned landing, shipped, shared on WhatsApp. Thumbnail showed old accent + tagline."
  source: "Universal"
  fix: |
    Regenerate og-image.jpg whenever visuals change.
    Test via WhatsApp before announcing.
  lesson: "OG images cache aggressively."
  mechanic: og-social-meta

- id: universal-no-competitors
  title: "The generic copy"
  severity: medium
  phase: planning
  story: "Skipped competitor research. Wrote from imagination. Site read like a template."
  source: "Universal"
  fix: |
    Research 30+ sites. Ship admin.html with analysis.
    Let it drive copy and feature decisions.
  lesson: "Cannot design better than the best without seeing the best."
  mechanic: null

- id: static-palette-reuse
  title: "Every Elitez site looks the same"
  severity: medium
  phase: planning
  story: "Shipped elitez-security, elitezaviation, vectorsky with near-identical dark+amber/cyan palettes."
  source: "Elitez brand family, Apr 2026"
  fix: |
    Enforce unique palette via colors.html.
    Track last 5 palettes; avoid adjacent hues.
  lesson: "Brand distinction is a product decision."
  mechanic: null

- id: static-mega-index
  title: "The 4000-line index.html"
  severity: low
  phase: building
  story: "Jammed hero + features + pricing + FAQ + footer into one file. SEO suffered, URL structure broken."
  source: "Multiple early sites"
  fix: |
    Split when content exceeds 3 bands: features.html, pricing.html, faq.html.
    Keep index.html focused on hero + CTA + top 3 sells.
  lesson: "Multi-page is a feature, not a complication."
  mechanic: multi-page-scaffold

- id: static-premature-admin-lock
  title: "The admin panel I couldn't demo"
  severity: low
  phase: shipping
  story: "Password-gated admin.html before dogfooding. Lost the password. Had to redeploy to access my own analysis."
  source: "casket admin, Apr 2026"
  fix: |
    Keep admin panels password-free until first paying client.
    Use sessionStorage auth only for multi-user sites.
  lesson: "Premature security is user-hostile to yourself."
  mechanic: admin-auth-gate

- id: static-mobile-untested
  title: "The hamburger that didn't open"
  severity: high
  phase: shipping
  story: "Tested at 1440px, shipped, opened on phone — tap did nothing. JS listener attached to wrong ID."
  source: "elitez-security, Apr 2026"
  fix: |
    Always test mobile in devtools before commit.
    console.log in menu toggle during dev; remove before ship.
  lesson: "Mobile is its own test surface."
  mechanic: null

- id: static-anim-overload
  title: "The seizure-inducing scroll"
  severity: low
  phase: building
  story: "Fade-in on every element. Page felt like animated slideshow."
  source: "Early portfolio site"
  fix: |
    Animate headlines and stat rows only. Body copy stays static.
    Threshold 0.12, transition 0.6s — no faster.
  lesson: "Animation is seasoning, not main course."
  mechanic: null
```
````

- [ ] **Step 6: Commit**

```bash
git add archetypes/static-informational/
git commit -m "archetypes: deep-fill static-informational"
git push
```

---

### Task 4: Thin-fill `archetypes/transactional/` (5 files)

**Files:** all 5 files in `archetypes/transactional/`

- [ ] **Step 1: Write `transactional/CLAUDE.md`** (thin version per spec §9 v1 rules)

```markdown
# Transactional Archetype Playbook (v1 thin — depth in v1.5)

Sites where users pay, upload, or persist data. Examples: altru, discounter, the-commons, quotation_preparer.

## Inherits from
`archetypes/static-informational/CLAUDE.md` — style, layout, typography, components all apply.

## Additional v1 rules

1. **Data persistence is mandatory.** localStorage (cart, drafts) or Supabase (orders, users). Never in-memory only.
2. **PayNow: use EMVCo spec.** See `mechanics/paynow-qr/snippet.html`. Render amount in UI text AND in QR payload — assert equivalence.
3. **Supabase gotchas.** RLS is OFF by default — enable before shipping. Never commit service-role keys (distinct from anon).
4. **Confirmation pages non-negotiable.** Route to dedicated `thank-you.html` after every transaction. Show: amount, timestamp, reference, what happens next.
5. **Admin is functional.** Reads/mutates real data, not just analytics.

## Deferred to v1.5
- Full Supabase schema conventions
- Email / SMS confirmation patterns
- Refund / dispute flows
- Stripe integration
```

- [ ] **Step 2: Write `transactional/prompt.md`** (same shape as static-informational, with data-flow.md step added to Process)

```markdown
# Transactional — Starter Prompt

---

You are dt-site-creator building a **transactional** site.

**Project:** {{project_description}}
**Scoping context:** {{scoping_answers}}
**Required mechanics:** {{ticked_mechanics}}
**⚠️ AVOID:** {{pitfalls_warnings}}

**Process:**
1. GitHub repo + first push within 5 minutes.
2. Competitive research on 30+ sites; ship admin.html + admin-insights.html.
3. colors.html for palette selection.
4. Before writing payment logic, produce `data-flow.md`: inputs, stored state, mutations, outputs.
5. Build per `archetypes/transactional/CLAUDE.md` + inherited static-informational rules.
6. Test transaction path end-to-end (happy + one failure).
7. OG image. Commit/push every iteration.

**Style authority:** `archetypes/transactional/CLAUDE.md`.
```

- [ ] **Step 3: Write `transactional/examples.md`**

```markdown
# Transactional — Past Examples

## 1. altru
- **Live:** https://derrick-pixel.github.io/Derrickclaude/
- **Why it matches:** PayNow charity pass-through, tax-relief calc, narrative to transaction.
- **Mechanics used:** paynow-qr, multi-page-scaffold, wizard-form, og-social-meta
- **Screenshot:** `/dashboard/samples/transactional/altru.jpg`

## 2. discounter
- **Live:** https://derrick-pixel.github.io/discounter/
- **Why it matches:** Cart persistence, weekly batch, PayNow EMVCo, Supabase auth.
- **Mechanics used:** paynow-qr, localstorage-state, admin-auth-gate, multi-page-scaffold
- **Screenshot:** `/dashboard/samples/transactional/discounter.jpg`

## 3. the-commons
- **Live:** https://derrick-pixel.github.io/the-commons/
- **Why it matches:** P2P event platform with escrow, marketplace, admin.
- **Mechanics used:** wizard-form, localstorage-state, admin-auth-gate, multi-page-scaffold
- **Screenshot:** `/dashboard/samples/transactional/the-commons.jpg`

## 4. studioelitez_quotation_preparer
- **Live:** Internal
- **Why it matches:** PDF upload → Gemini extraction → bilingual Excel output.
- **Mechanics used:** pdf-pipeline, wizard-form
- **Screenshot:** `/dashboard/samples/transactional/quotation-preparer.jpg`
```

- [ ] **Step 4: Write `transactional/mechanic-fit.md`**

```markdown
# Transactional — Mechanic Fit

| Mechanic | Fit | Notes |
|---|---|---|
| og-social-meta | core | Mandatory |
| paynow-qr | core | Default SG payment |
| localstorage-state | core | Cart / draft / session |
| wizard-form | core | Multi-step checkout |
| admin-auth-gate | core | Real admin |
| multi-page-scaffold | core | Landing + cart + checkout + thank-you |
| pdf-pipeline | optional | Receipts, invoices |
| canvas-hero | optional | If brand calls for it |
| chartjs-dashboard | optional | Admin analytics |
```

- [ ] **Step 5: Write `transactional/pitfalls.md`**

Content: 4 universal (same as static-informational) + 7 transactional-specific. Full YAML block with entries:
- universal-no-push, universal-dark-default, universal-stale-og, universal-no-competitors (same as Task 3)
- trans-paynow-wrong-amount, trans-paynow-no-checksum, trans-cart-memory-only, trans-supabase-rls-off, trans-service-role-exposure, trans-no-confirmation, trans-ui-qr-mismatch

Use spec §3b transactional pitfalls section as authoritative content. Author in the same YAML schema as Task 3.

- [ ] **Step 6: Commit**

```bash
git add archetypes/transactional/
git commit -m "archetypes: thin-fill transactional"
git push
```

---

### Task 5: Thin-fill `archetypes/simulator-educational/`

**Files:** 5 files in `archetypes/simulator-educational/`

- [ ] **Step 1: Write `simulator-educational/CLAUDE.md`**

```markdown
# Simulator / Educational Archetype Playbook (v1 thin)

Interactive learning tools, scenario engines, calculators, quiz engines. Examples: market_tracker, dtws_works, ELIX-resume.

## Inherits from
`archetypes/static-informational/CLAUDE.md`.

## Additional v1 rules

1. **State persistence mandatory.** Quiz progress, drafts, scenario state — survives tab close.
2. **Reset buttons everywhere.** Every simulator has a visible Reset.
3. **API rate limits handled.** Guest rate-limiter for external APIs (yfinance, OpenAI).
4. **PDFs break — test multi-page.** Always test with >1 page of content.
5. **Streamlit / Plotly allowed** as secondary Python track.

## Deferred to v2
- State-machine patterns
- Quiz engine library
- Report-generator conventions
```

- [ ] **Step 2: Write `simulator-educational/prompt.md`** — same pattern as Task 4 Step 2, with `scenarios.md` added to process (inputs, transitions, outputs per interaction).

- [ ] **Step 3: Write `simulator-educational/examples.md`** — 3 entries: market-tracker (Streamlit), dtws-works (quiz), elix-resume (editor). Screenshots at `/dashboard/samples/simulator-educational/<name>.jpg`.

- [ ] **Step 4: Write `simulator-educational/mechanic-fit.md`**

```markdown
# Simulator-Educational — Mechanic Fit

| Mechanic | Fit | Notes |
|---|---|---|
| og-social-meta | core | Mandatory |
| localstorage-state | core | Draft/progress persistence |
| wizard-form | core | Input gathering |
| multi-page-scaffold | optional | Multi-tool platforms |
| chartjs-dashboard | optional | Data-driven simulators |
| pdf-pipeline | optional | Report generators |
| admin-auth-gate | optional | Instructor dashboards |
| canvas-hero | rare | Brand-driven |
| paynow-qr | rare | Not usually transactional |
```

- [ ] **Step 5: Write `simulator-educational/pitfalls.md`** — 4 universal + 6 sim-specific from spec §3b (sim-progress-lost, sim-pdf-multipage, sim-api-no-limiter, sim-no-reset, sim-streamlit-no-rerun, sim-patronizing-tone).

- [ ] **Step 6: Commit** — `git add archetypes/simulator-educational/ && git commit -m "archetypes: thin-fill simulator-educational" && git push`

---

### Task 6: Thin-fill `archetypes/game/`

**Files:** 5 files in `archetypes/game/`

- [ ] **Step 1: Write `game/CLAUDE.md`**

```markdown
# Game Archetype Playbook (v1 thin)

Goal-driven play with scoring, levels, or character progression. Examples: elixcraft.

## Inherits from
`archetypes/static-informational/CLAUDE.md`.

## Additional v1 rules

1. **Save format versioned.** `{ "schema_version": 1, ... }` so future updates migrate.
2. **Canvas loops pause on hidden tab.** Listen to `document.visibilitychange`.
3. **Onboarding before irreversible choice.** Don't dump a new player on a faction screen.
4. **XP curves get playtested.** Plot minutes-to-level. First meaningful reward by minute 5.
5. **Trademark hygiene.** No franchise-adjacent names, fonts, or sprites.

## Deferred to v2
- Full game-loop conventions, save slots, sound, mobile controls.
```

- [ ] **Step 2: Write `game/prompt.md`** — adds `game-design.md` step (mechanics, progression, win/lose, onboarding).

- [ ] **Step 3: Write `game/examples.md`** — 1 entry: elixcraft with faction/XP/career-tree description. Screenshot `/dashboard/samples/game/elixcraft.jpg`.

- [ ] **Step 4: Write `game/mechanic-fit.md`**

```markdown
# Game — Mechanic Fit

| Mechanic | Fit | Notes |
|---|---|---|
| og-social-meta | core | Mandatory |
| canvas-hero | core | Visual hero / canvas |
| localstorage-state | core | Save game |
| wizard-form | core | Onboarding / character creation |
| admin-auth-gate | optional | Dev tools / game master |
| multi-page-scaffold | optional | About, leaderboard |
| chartjs-dashboard | optional | Stats screens |
| pdf-pipeline | rare | Completion certificates |
| paynow-qr | rare | Monetization |
```

- [ ] **Step 5: Write `game/pitfalls.md`** — 4 universal + 5 game-specific from spec §3b (game-save-no-version, game-raf-hidden, game-soft-lock, game-no-onboarding, game-trademark-adjacent).

- [ ] **Step 6: Commit** — `git add archetypes/game/ && git commit -m "archetypes: thin-fill game" && git push`

---

### Task 7: Thin-fill `archetypes/dashboard-analytics/`

**Files:** 5 files in `archetypes/dashboard-analytics/`

- [ ] **Step 1: Write `dashboard-analytics/CLAUDE.md`**

```markdown
# Dashboard / Analytics Archetype Playbook (v1 thin)

Data-heavy internal tools with charts, KPIs, auth-gated routes. Examples: eco-dashboard, elitez-csuite.

## Tech stack deviation

Unlike other archetypes, this may use **Next.js + base-ui** when complexity warrants:
- eco-dashboard: Next.js 16 + React 19 + base-ui + Chart.js
- elitez-csuite: Next.js + Gmail/Calendar integration

Vanilla HTML/CSS/JS is default for prototypes. Upgrade to Next.js only for routing/SSR/complex state.

## Inherits from
`archetypes/static-informational/CLAUDE.md` (vanilla fallback track).

## Additional v1 rules

1. **Auth-gate every dashboard.** Never public. Use `admin-auth-gate` or Supabase/NextAuth.
2. **Last-updated timestamps mandatory.** Every widget shows when refreshed.
3. **Polling backs off.** No naive setInterval. SWR or exponential backoff. Pause when `document.hidden`.
4. **Mobile-first.** Most dashboards are phone-viewed. Design phone layout first.
5. **base-ui gotchas:** use render prop (NOT asChild). `onValueChange(v)` returns `string|null` — guard `v && ...`.
6. **Chart.js in flex:** set `maintainAspectRatio: false` or it flattens to 0 height.

## Deferred to v2
- Full Next.js + base-ui conventions
- Real-time data (SSE, WebSockets)
- Role-based access patterns
```

- [ ] **Step 2: Write `dashboard-analytics/prompt.md`** — adds `data-model.md` step (data sources, refresh cadence, auth boundaries) and tech-stack decision prompt.

- [ ] **Step 3: Write `dashboard-analytics/examples.md`** — 2 entries: eco-dashboard, elitez-csuite.

- [ ] **Step 4: Write `dashboard-analytics/mechanic-fit.md`**

```markdown
# Dashboard-Analytics — Mechanic Fit

| Mechanic | Fit | Notes |
|---|---|---|
| og-social-meta | core | Mandatory |
| chartjs-dashboard | core | Viz backbone |
| admin-auth-gate | core | Must be auth-gated |
| localstorage-state | core | Filter/view prefs |
| multi-page-scaffold | optional | Multiple dashboards |
| wizard-form | optional | Report builders |
| pdf-pipeline | optional | Export reports |
| canvas-hero | rare | Out of place |
| paynow-qr | rare | Not transactional |
```

- [ ] **Step 5: Write `dashboard-analytics/pitfalls.md`** — 4 universal + 7 dashboard-specific from spec §3b (dash-baseui-aschild, dash-onvaluechange-null, dash-chart-flat, dash-poll-hammer, dash-no-timestamp, dash-weak-admin-pw, dash-mobile-shrink).

- [ ] **Step 6: Commit** — `git add archetypes/dashboard-analytics/ && git commit -m "archetypes: thin-fill dashboard-analytics" && git push`

---

### Task 8: Write `mechanics/README.md`

**Files:** Create `mechanics/README.md`

- [ ] **Step 1: Write**

```markdown
# Mechanics — The Lego Brick Library

Cross-archetype reusable building blocks. Each mechanic folder has a 5-file contract:

1. `meta.json` — dashboard-readable metadata
2. `snippet.html` — self-contained paste-in block
3. `README.md` — what / when / trade-offs / how
4. `example-use.md` — past-project excerpt
5. `preview.jpg` — 400×300 thumbnail

## The 9 v1 Mechanics

| # | ID | Summary | Core for |
|---|---|---|---|
| 1 | paynow-qr | EMVCo SG PayNow QR | Transactional |
| 2 | localstorage-state | Versioned persistence | Game, Simulator, Dashboard, Transactional |
| 3 | admin-auth-gate | sessionStorage password gate | Transactional, Dashboard |
| 4 | canvas-hero | Animated canvas background | Game (core); Static (optional) |
| 5 | chartjs-dashboard | Chart.js + last-updated | Dashboard |
| 6 | pdf-pipeline | jsPDF + html2canvas | (optional across several) |
| 7 | wizard-form | Multi-step form | Transactional, Simulator, Game |
| 8 | multi-page-scaffold | Shared nav/footer | Static, Transactional |
| 9 | og-social-meta | OG + Twitter Card | All (mandatory) |

## How Claude uses mechanics

When an archetype's `mechanic-fit.md` marks a mechanic `core`, or the user ticks it on the dashboard:
1. Read the mechanic's `README.md` for when/how.
2. Copy-adapt `snippet.html` into the project.
3. Check `linked_pitfalls` in `meta.json` and proactively avoid them.

## Adding a new mechanic

1. Create `mechanics/<slug>/` folder.
2. Author all 5 files.
3. Update every archetype's `mechanic-fit.md`.
4. Dashboard auto-detects on next load.
```

- [ ] **Step 2: Commit** — `git add mechanics/README.md && git commit -m "mechanics: add README" && git push`

---

### Task 9: Fully author `mechanics/paynow-qr/` (reference implementation)

**Files:** 5 files in `mechanics/paynow-qr/`

- [ ] **Step 1: Write `meta.json`**

```json
{
  "id": "paynow-qr",
  "name": "PayNow QR Generator",
  "summary": "EMVCo-compliant QR for Singapore payments.",
  "fits": {
    "static-informational": "rare",
    "transactional": "core",
    "simulator-educational": "rare",
    "game": "rare",
    "dashboard-analytics": "optional"
  },
  "dependencies": ["https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"],
  "complexity": "medium",
  "past_uses": ["altru", "discounter"],
  "linked_pitfalls": ["trans-paynow-wrong-amount", "trans-paynow-no-checksum", "trans-ui-qr-mismatch"]
}
```

- [ ] **Step 2: Write `README.md`**

````markdown
# PayNow QR

Generates EMVCo-compliant Singapore PayNow QR codes in the browser.

## What it does
Takes mobile number (or UEN) + amount + optional reference, produces scannable QR that SG bank apps (DBS, UOB, OCBC) parse as PayNow transaction.

## When to plug in
- Transactional sites (checkout, donations, invoicing)
- Any SG-facing site that takes payment

## Trade-offs
- **Pro:** Native SG payment, zero customer fees, instant settlement.
- **Con:** SG-only. Overseas users can't scan.
- **Con:** No webhook — you don't know if payment happened without second channel (email, phone).

## How to use

1. Include QRCode library in page head:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
   ```
2. Copy snippet block from `snippet.html` into your checkout page.
3. Call `renderPaynowQR({ targetElementId, phoneOrUEN, amountSGD, referenceText })`.

## Linked pitfalls
- `trans-paynow-wrong-amount` — verify UI amount === QR amount
- `trans-paynow-no-checksum` — CRC16 mandatory
- `trans-ui-qr-mismatch` — single source of truth for amount

## Sourced from
altru/checkout.html + discounter/src/pages/checkout.tsx.
````

- [ ] **Step 3: Write `snippet.html`**

Build the file with: CRC16-CCITT helper, TLV field encoder, `buildPaynowPayload()` (encodes type 26 merchant account, field 52 MCC, 53 currency 702, 54 amount, 58 SG, 59/60 merchant info, 62 reference, 63 CRC), `renderPaynowQR()` exposing via `window.renderPaynowQR`.

All output rendering uses `textContent` and `createElement` — no `innerHTML` with dynamic values. For the QR canvas, use `QRCode.toCanvas()` library call.

Key skeleton (full file has all helpers + styles):

```html
<script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
<style>
  .mechanic-paynow__wrap { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 24px; background: var(--card, #fff); border: 1px solid var(--border, #eee); border-radius: 12px; max-width: 360px; }
  .mechanic-paynow__amount { font-size: 1.6rem; font-weight: 700; }
  .mechanic-paynow__verify { font-size: 0.78rem; background: rgba(245,158,11,0.08); padding: 6px 12px; border-radius: 6px; border-left: 3px solid #f59e0b; }
  .mechanic-paynow__qr { background: #fff; padding: 12px; border-radius: 8px; }
  .mechanic-paynow__ref { font-size: 0.7rem; color: var(--muted, #555); letter-spacing: 0.05em; }
</style>
<div id="paynow-qr-output" class="mechanic-paynow__wrap"></div>
<script>
(function() {
  'use strict';
  function crc16ccitt(str) { let crc = 0xFFFF; for (let i = 0; i < str.length; i++) { crc ^= str.charCodeAt(i) << 8; for (let j = 0; j < 8; j++) { crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1); crc &= 0xFFFF; } } return crc.toString(16).toUpperCase().padStart(4, '0'); }
  function tlv(id, value) { return id + String(value.length).padStart(2, '0') + value; }
  function buildPaynowPayload(opts) {
    const isUEN = /^\d{8,10}[A-Z]$/.test(opts.phoneOrUEN);
    const proxyType = isUEN ? '2' : '0';
    const normalizedPhone = isUEN ? opts.phoneOrUEN : (opts.phoneOrUEN.startsWith('+') ? opts.phoneOrUEN : '+65' + opts.phoneOrUEN.replace(/\D/g,''));
    const merchantAccount = tlv('00','SG.PAYNOW') + tlv('01',proxyType) + tlv('02',normalizedPhone) + tlv('03','1');
    const amount = (Math.round(opts.amountSGD * 100) / 100).toFixed(2);
    let payload = tlv('00','01') + tlv('01','12') + tlv('26',merchantAccount) + tlv('52','0000') + tlv('53','702') + tlv('54',amount) + tlv('58','SG') + tlv('59','NA') + tlv('60','Singapore');
    if (opts.referenceText) payload += tlv('62', tlv('01', opts.referenceText));
    const toChecksum = payload + '6304';
    return toChecksum + crc16ccitt(toChecksum);
  }
  window.renderPaynowQR = function(opts) {
    const el = document.getElementById(opts.targetElementId);
    if (!el) { console.error('paynow-qr: target not found'); return; }
    const payload = buildPaynowPayload(opts);
    // Build DOM with createElement (NOT innerHTML + template interpolation)
    el.replaceChildren();
    const amt = document.createElement('div'); amt.className = 'mechanic-paynow__amount'; amt.textContent = 'SGD ' + opts.amountSGD.toFixed(2); el.appendChild(amt);
    const verify = document.createElement('div'); verify.className = 'mechanic-paynow__verify'; verify.textContent = '⚠ Verify this amount matches what you expect to pay'; el.appendChild(verify);
    const qrWrap = document.createElement('div'); qrWrap.className = 'mechanic-paynow__qr';
    const canvas = document.createElement('canvas'); canvas.id = 'paynow-canvas'; qrWrap.appendChild(canvas); el.appendChild(qrWrap);
    if (opts.referenceText) { const ref = document.createElement('div'); ref.className = 'mechanic-paynow__ref'; ref.textContent = 'Ref: ' + opts.referenceText; el.appendChild(ref); }
    QRCode.toCanvas(canvas, payload, { width: 240, margin: 1 }, function(err) { if (err) console.error('paynow-qr render error:', err); });
    if (!payload.includes(opts.amountSGD.toFixed(2))) {
      el.replaceChildren();
      const warn = document.createElement('p'); warn.style.color = 'red'; warn.textContent = 'Payment QR failed — amount mismatch.'; el.appendChild(warn);
    }
  };
})();
</script>
```

- [ ] **Step 4: Write `example-use.md`**

```markdown
# PayNow QR — Past Use

## altru (Derrickclaude)
- **File:** index.html lines ~850-920
- **Context:** Wedding red-packet → charity pass-through. Amount input → Donate CTA → QR with tax-relief sidebar.

## discounter
- **File:** src/pages/checkout.tsx (React; this snippet is vanilla adaptation)
- **Context:** Weekly FMCG batch cart. Confirm order → PayNow QR with order reference. Status polled from Supabase.
```

- [ ] **Step 5: Create `preview.jpg`** placeholder (1x1 transparent — Task 18 replaces with real mockup)

```bash
# Minimal placeholder; Task 18 replaces
printf '\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xc4\x00\xb5\x10\x00\x02\x01\x03\x03\x02\x04\x03\x05\x05\x04\x04\x00\x00\x01}\x01\x02\x03\x00\x04\x11\x05\x12!1A\x06\x13Qa\x07"q\x142\x81\x91\xa1\x08#B\xb1\xc1\x15R\xd1\xf0$3br\x82\t\n\x16\x17\x18\x19\x1a%&\'()*456789:CDEFGHIJSTUVWXYZcdefghijstuvwxyz\x83\x84\x85\x86\x87\x88\x89\x8a\x92\x93\x94\x95\x96\x97\x98\x99\x9a\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xfb\xd0\xff\xd9' > mechanics/paynow-qr/preview.jpg
```

- [ ] **Step 6: Commit** — `git add mechanics/paynow-qr/ && git commit -m "mechanics: fully author paynow-qr reference" && git push`

---

### Task 10: Author the 8 remaining mechanics

**Files:** 5 files × 8 mechanics = 40 files across localstorage-state, admin-auth-gate, canvas-hero, chartjs-dashboard, pdf-pipeline, wizard-form, multi-page-scaffold, og-social-meta.

For EACH mechanic, follow the Task 9 pattern (meta.json + README.md + snippet.html + example-use.md + preview.jpg).

**Authoritative fit matrix** — use these values in each mechanic's `meta.json.fits`:

| Mechanic | Static | Transactional | Simulator | Game | Dashboard |
|---|---|---|---|---|---|
| localstorage-state | rare | core | core | core | core |
| admin-auth-gate | optional | core | optional | optional | core |
| canvas-hero | optional | optional | rare | core | rare |
| chartjs-dashboard | rare | optional | optional | optional | core |
| pdf-pipeline | rare | optional | optional | rare | optional |
| wizard-form | optional | core | core | core | optional |
| multi-page-scaffold | core | core | optional | optional | optional |
| og-social-meta | core | core | core | core | core |

**past_uses and linked_pitfalls** — pull from spec §6 v1 slate + pitfall IDs from Tasks 3-7.

- [ ] **Step 1: localstorage-state**

`meta.json` — fits above, past_uses `["elixcraft", "elix-resume", "dtws-works"]`, linked_pitfalls `["sim-progress-lost", "trans-cart-memory-only", "game-save-no-version"]`.

`snippet.html` — exports `window.dtState` with:
```js
// ── Namespaced, versioned localStorage wrapper ───────────
window.dtState = {
  _ns: 'dtsite',
  get(key, defaultValue, version = 1) {
    try {
      const raw = localStorage.getItem(this._ns + ':' + key + ':v' + version);
      if (!raw) return defaultValue;
      return JSON.parse(raw);
    } catch(e) { return defaultValue; }
  },
  set(key, value, version = 1) {
    localStorage.setItem(this._ns + ':' + key + ':v' + version, JSON.stringify(value));
  },
  migrate(key, fromVersion, toVersion, migratorFn) {
    const old = this.get(key, null, fromVersion);
    if (old === null) return;
    const migrated = migratorFn(old);
    this.set(key, migrated, toVersion);
    localStorage.removeItem(this._ns + ':' + key + ':v' + fromVersion);
  }
};
```

`README.md` — explains get/set/migrate, when to version (breaking schema changes), 3-step usage.

`example-use.md` — elixcraft save slot version 1, elix-resume draft auto-save every 2s.

- [ ] **Step 2: admin-auth-gate**

`meta.json` — past_uses `["dtws-works", "the-commons", "elixcraft"]`, linked_pitfalls `["dash-weak-admin-pw", "static-premature-admin-lock"]`.

`snippet.html` — SHA-256 hash check against a stored constant, prompt modal on missing `sessionStorage.getItem('dtsite:admin-authed')`. Uses `crypto.subtle.digest` for hashing. Example hash in code comments: `"// Default password 'admin': e3b0c44..."` with instructions to replace.

All DOM construction via `createElement` + `textContent`/`setAttribute`. No innerHTML.

`README.md` — explains it's dev-grade (not production). For prod use Supabase/NextAuth.

`example-use.md` — dtws-works hardcoded password flow.

- [ ] **Step 3: canvas-hero**

`meta.json` — past_uses `["elixcraft", "vectorsky", "elitezaviation"]`, linked_pitfalls `["game-raf-hidden"]`.

`snippet.html` — full-bleed canvas with starfield particles, respects `document.visibilitychange` (pauses RAF when hidden), responsive via `window.resize`.

- [ ] **Step 4: chartjs-dashboard**

`meta.json` — past_uses `["eco-dashboard", "elitez-csuite", "market-tracker"]`, linked_pitfalls `["dash-chart-flat", "dash-no-timestamp"]`, dependencies `["https://cdn.jsdelivr.net/npm/chart.js@4"]`.

`snippet.html` — Chart.js line chart, wraps canvas in `.mechanic-chart__wrap { position: relative; height: 300px; }`, sets `maintainAspectRatio: false`, renders a "Last updated Xs ago" subtitle updating every 10s via setInterval.

- [ ] **Step 5: pdf-pipeline**

`meta.json` — past_uses `["market-tracker", "studioelitez", "quotation-preparer"]`, linked_pitfalls `["sim-pdf-multipage"]`, dependencies `["https://cdn.jsdelivr.net/npm/jspdf@2","https://cdn.jsdelivr.net/npm/html2canvas@1"]`.

`snippet.html` — exposes `window.renderPDF(targetElementId, options)` using html2canvas → jsPDF.addImage with multi-page handling (slices canvas into pages).

- [ ] **Step 6: wizard-form**

`meta.json` — past_uses `["wsg-jrplus", "elix-resume", "quotation-preparer"]`, linked_pitfalls `[]`.

`snippet.html` — 3-step wizard with progress bar, Next/Back/Submit buttons. Uses `createElement` DOM construction throughout. Supports `input[type=text|radio|checkbox]` and Likert 1-5 scale.

- [ ] **Step 7: multi-page-scaffold**

`meta.json` — past_uses `["casket", "altru", "elitez-security"]`, linked_pitfalls `["static-mega-index", "static-mobile-untested"]`.

`snippet.html` — template block for a shared glassmorphic top-nav + footer, with current-page highlight via `<body data-current-page="X">` attribute. Mirrors the nav spec from `archetypes/static-informational/CLAUDE.md` §5.

- [ ] **Step 8: og-social-meta**

`meta.json` — past_uses `["~all sites"]`, linked_pitfalls `["universal-stale-og"]`.

`snippet.html` — `<head>` block with OG + Twitter Card tags, `{{placeholders}}` for title/description/image/url. Includes validator URLs in comments.

- [ ] **Step 9: Commit all 8 mechanics**

```bash
git add mechanics/
git commit -m "mechanics: author 8 remaining mechanics with 5-file contract"
git push
```

---

### Task 11: Write dashboard JSON data files

**Files:**
- Create: `dashboard/data/archetypes.json`
- Create: `dashboard/data/mechanics.json`
- Create: `dashboard/data/examples.json`
- Create: `dashboard/samples/custom/custom-index.json`

- [ ] **Step 1: Write `archetypes.json`**

Full content from spec §4 scoring weights. Structure: `{ "archetypes": [...5 objects...], "scoring_rules": {...} }`. Each archetype object has: id, name, tagline, description, path, past_examples, color_hint, scoring_weights (keys for each answer option).

Complete authored content — 5 archetype blocks. Use canonical weights:

```json
{
  "archetypes": [
    {
      "id": "static-informational",
      "name": "Static Informational",
      "tagline": "Marketing, content, no transactions",
      "description": "Users read and browse. No payments, no data layer beyond email.",
      "path": "archetypes/static-informational/",
      "past_examples": ["casket", "lumana", "vectorsky", "xinceai"],
      "color_hint": "#38bdf8",
      "scoring_weights": { "q1_public": 10, "q1_customers": 3, "q1_internal": 0, "q1_learners": 0, "q2_no_money": 10, "q2_one_time": 3, "q2_recurring": 0, "q2_escrow": 0, "q3_content": 10, "q3_interaction": 3, "q3_goal": 0, "q4_no_data": 10, "q4_dashboard": 0, "q4_api": 2 }
    },
    {
      "id": "transactional",
      "name": "Transactional",
      "tagline": "Users give you money or data",
      "description": "Payment flows, form persistence, uploads with processing.",
      "path": "archetypes/transactional/",
      "past_examples": ["altru", "discounter", "the-commons", "quotation-preparer"],
      "color_hint": "#f59e0b",
      "scoring_weights": { "q1_public": 5, "q1_customers": 10, "q1_internal": 3, "q1_learners": 0, "q2_no_money": 0, "q2_one_time": 8, "q2_recurring": 10, "q2_escrow": 10, "q3_content": 3, "q3_interaction": 10, "q3_goal": 2, "q4_no_data": 0, "q4_dashboard": 3, "q4_api": 8 }
    },
    {
      "id": "simulator-educational",
      "name": "Simulator / Educational",
      "tagline": "Learning, calculators, scenario engines",
      "description": "Interactive tools that teach, calculate, or simulate.",
      "path": "archetypes/simulator-educational/",
      "past_examples": ["market-tracker", "dtws-works", "elix-resume"],
      "color_hint": "#34d399",
      "scoring_weights": { "q1_public": 3, "q1_customers": 3, "q1_internal": 5, "q1_learners": 10, "q2_no_money": 8, "q2_one_time": 3, "q2_recurring": 3, "q2_escrow": 0, "q3_content": 3, "q3_interaction": 10, "q3_goal": 5, "q4_no_data": 3, "q4_dashboard": 5, "q4_api": 8 }
    },
    {
      "id": "game",
      "name": "Game",
      "tagline": "Goal-driven play, scoring, levels",
      "description": "Gamified experiences with progression and win states.",
      "path": "archetypes/game/",
      "past_examples": ["elixcraft"],
      "color_hint": "#f87171",
      "scoring_weights": { "q1_public": 5, "q1_customers": 3, "q1_internal": 3, "q1_learners": 5, "q2_no_money": 8, "q2_one_time": 2, "q2_recurring": 2, "q2_escrow": 0, "q3_content": 0, "q3_interaction": 5, "q3_goal": 10, "q4_no_data": 5, "q4_dashboard": 0, "q4_api": 3 }
    },
    {
      "id": "dashboard-analytics",
      "name": "Dashboard / Analytics",
      "tagline": "Data-heavy, charts, KPIs, auth-gated",
      "description": "Internal tools and executive dashboards.",
      "path": "archetypes/dashboard-analytics/",
      "past_examples": ["eco-dashboard", "elitez-csuite"],
      "color_hint": "#818cf8",
      "scoring_weights": { "q1_public": 0, "q1_customers": 3, "q1_internal": 10, "q1_learners": 3, "q2_no_money": 5, "q2_one_time": 3, "q2_recurring": 5, "q2_escrow": 3, "q3_content": 5, "q3_interaction": 8, "q3_goal": 3, "q4_no_data": 0, "q4_dashboard": 10, "q4_api": 10 }
    }
  ],
  "scoring_rules": {
    "description": "Each answer adds weights. Highest total wins. Ties break alphabetically.",
    "questions": [
      { "id": "q1", "text": "Who visits?", "options": ["public", "customers", "internal", "learners"] },
      { "id": "q2", "text": "Do users give you money or data?", "options": ["no_money", "one_time", "recurring", "escrow"] },
      { "id": "q3", "text": "Core experience?", "options": ["content", "interaction", "goal"] },
      { "id": "q4", "text": "Live data layer?", "options": ["no_data", "dashboard", "api"] }
    ]
  }
}
```

- [ ] **Step 2: Write `mechanics.json`**

9-entry list. Each entry: id, name, summary, icon (emoji), fits (per-archetype), past_uses, complexity. Structure:

```json
{
  "mechanics": [
    { "id": "paynow-qr", "name": "PayNow QR Generator", "summary": "EMVCo-compliant QR for Singapore payments.", "icon": "💳", "fits": { "static-informational": "rare", "transactional": "core", "simulator-educational": "rare", "game": "rare", "dashboard-analytics": "optional" }, "past_uses": ["altru", "discounter"], "complexity": "medium" },
    { "id": "localstorage-state", "name": "LocalStorage State", "summary": "Versioned persistence wrapper.", "icon": "💾", "fits": { "static-informational": "rare", "transactional": "core", "simulator-educational": "core", "game": "core", "dashboard-analytics": "core" }, "past_uses": ["elixcraft", "elix-resume", "dtws-works"], "complexity": "low" },
    { "id": "admin-auth-gate", "name": "Admin Auth Gate", "summary": "sessionStorage password gate (dev-grade).", "icon": "🔐", "fits": { "static-informational": "optional", "transactional": "core", "simulator-educational": "optional", "game": "optional", "dashboard-analytics": "core" }, "past_uses": ["dtws-works", "the-commons", "elixcraft"], "complexity": "low" },
    { "id": "canvas-hero", "name": "Canvas Hero", "summary": "Full-bleed animated canvas background.", "icon": "🌌", "fits": { "static-informational": "optional", "transactional": "optional", "simulator-educational": "rare", "game": "core", "dashboard-analytics": "rare" }, "past_uses": ["elixcraft", "vectorsky", "elitezaviation"], "complexity": "medium" },
    { "id": "chartjs-dashboard", "name": "Chart.js Dashboard", "summary": "Chart.js with last-updated + flex-safe sizing.", "icon": "📊", "fits": { "static-informational": "rare", "transactional": "optional", "simulator-educational": "optional", "game": "optional", "dashboard-analytics": "core" }, "past_uses": ["eco-dashboard", "elitez-csuite", "market-tracker"], "complexity": "medium" },
    { "id": "pdf-pipeline", "name": "PDF Pipeline", "summary": "jsPDF + html2canvas report generator.", "icon": "📄", "fits": { "static-informational": "rare", "transactional": "optional", "simulator-educational": "optional", "game": "rare", "dashboard-analytics": "optional" }, "past_uses": ["market-tracker", "studioelitez", "quotation-preparer"], "complexity": "high" },
    { "id": "wizard-form", "name": "Wizard Form", "summary": "Multi-step form with progress bar.", "icon": "🪜", "fits": { "static-informational": "optional", "transactional": "core", "simulator-educational": "core", "game": "core", "dashboard-analytics": "optional" }, "past_uses": ["wsg-jrplus", "elix-resume", "quotation-preparer"], "complexity": "medium" },
    { "id": "multi-page-scaffold", "name": "Multi-Page Scaffold", "summary": "Shared nav + footer with current-page highlight.", "icon": "🗂️", "fits": { "static-informational": "core", "transactional": "core", "simulator-educational": "optional", "game": "optional", "dashboard-analytics": "optional" }, "past_uses": ["casket", "altru", "elitez-security"], "complexity": "low" },
    { "id": "og-social-meta", "name": "OG / Social Meta", "summary": "Open Graph + Twitter Card for WhatsApp-shareable previews.", "icon": "📱", "fits": { "static-informational": "core", "transactional": "core", "simulator-educational": "core", "game": "core", "dashboard-analytics": "core" }, "past_uses": ["all sites"], "complexity": "low" }
  ]
}
```

- [ ] **Step 3: Write `examples.json`**

14 entries (one per past-project). Each: id, name, archetype, live_url, repo_url, screenshot, mechanics, why_it_matches.

Full authored content listing: casket, lumana, vectorsky, xinceai (static-informational); altru, discounter, the-commons, quotation-preparer (transactional); market-tracker, dtws-works, elix-resume (simulator); elixcraft (game); eco-dashboard, elitez-csuite (dashboard).

- [ ] **Step 4: Write `custom-index.json`**

```json
{ "custom_samples": [] }
```

- [ ] **Step 5: Commit**

```bash
git add dashboard/data/ dashboard/samples/custom/
git commit -m "dashboard: add JSON data files (archetypes, mechanics, examples, custom-index)"
git push
```

---

## Phase 2 — Dashboard UI

### Task 12: Write `dashboard/css/style.css`

**Files:** Create `dashboard/css/style.css`

- [ ] **Step 1: Author the stylesheet**

Consult `archetypes/static-informational/CLAUDE.md` §2-§7 for the dt-site-creator component library. Unique palette for this site (deep-slate + amber/blue/violet — never reuse past site palettes):

```css
:root {
  --bg: #0d1117; --surface: #161b22; --card: #1c2128;
  --border: rgba(255,255,255,0.08); --border2: rgba(255,255,255,0.16);
  --text: #f0f6fc; --muted: #8b949e; --muted2: #adbac7;
  --accent: #ffa657; --accent-2: #79c0ff; --accent-3: #d2a8ff;
  --glow: rgba(255,166,87,0.15);
  --danger: #f85149; --success: #3fb950;
}
```

Stylesheet sections: reset, typography (Inter + Manrope), container, grids, fixed glass nav + hamburger, hero, card, buttons (primary/outline/back), badges, modal, accordion, toast, stage-container + transitions, scoping-q + match-meter, archetype-card, example-card, mechanic-item + fit labels, pitfall-card (with front/back for teaching mode), pitfalls-grid, pitfall-strip, filters, footer.

Target: ~800 lines.

Key sections to include explicitly:

```css
/* Stages (SPA-like) */
.stage { display: none; min-height: calc(100vh - 64px); padding: 80px 0; }
.stage.active { display: block; }

/* Match meter */
.match-bar { display: grid; grid-template-columns: 200px 1fr 40px; gap: 12px; align-items: center; padding: 6px 0; }
.match-bar-track { background: var(--surface); border-radius: 100px; height: 8px; overflow: hidden; }
.match-bar-fill { height: 100%; transition: width 0.4s ease; border-radius: 100px; }

/* Mechanic fit labels */
.fit-core { background: rgba(52,211,153,0.12); color: #34d399; }
.fit-optional { background: rgba(129,140,248,0.12); color: #818cf8; }
.fit-rare { background: rgba(100,116,139,0.12); color: #64748b; }

/* Pitfall card */
.pitfall-card { position: relative; border-radius: 12px; padding: 20px; background: var(--card); border: 1px solid var(--border); transition: all 0.2s; }
.pitfall-card.severity-critical { border-left: 4px solid var(--danger); }
.pitfall-card.severity-high { border-left: 4px solid var(--accent); }
.pitfall-card.severity-medium { border-left: 4px solid var(--accent-2); }
.pitfall-card.severity-low { border-left: 4px solid var(--muted); }
body.teaching-mode .pitfall-card:hover .pitfall-back { display: block; }
.pitfall-back { display: none; }
```

- [ ] **Step 2: Visual smoke test**

Create a scratch `test.html` that uses `<link rel="stylesheet" href="dashboard/css/style.css">`, renders one of each component (nav, card, button, badge, accordion, modal trigger, match-bar, pitfall-card). Open in browser; confirm visual parity with existing dt-site-creator sites. Delete scratch file after verification.

- [ ] **Step 3: Commit** — `git add dashboard/css/style.css && git commit -m "dashboard: unified stylesheet" && git push`

---

### Task 13: Write `index.html` shell

**Files:** Create `index.html`

- [ ] **Step 1: Author the file**

Use the complete HTML shell below. Note: all dynamic content insertion happens in JS via DOM APIs; the shell contains only static markup:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DT Site Creator — Methodology Archive</title>
  <meta name="description" content="Browse 5 project archetypes, 9 reusable mechanics, 40+ pitfalls." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://derrick-pixel.github.io/dt-site-creator/" />
  <meta property="og:title" content="DT Site Creator — Methodology Archive" />
  <meta property="og:description" content="Browse 5 project archetypes, 9 reusable mechanics, 40+ pitfalls." />
  <meta property="og:image" content="https://derrick-pixel.github.io/dt-site-creator/og-image.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="dashboard/css/style.css" />
</head>
<body>
  <nav id="site-nav">
    <a href="/" class="nav-logo">DT<span>.</span>site</a>
    <ul class="nav-links">
      <li><a href="#archetypes">Archetypes</a></li>
      <li><a href="#mechanics">Mechanics</a></li>
      <li><a href="pitfalls.html">Pitfalls</a></li>
      <li><a href="#gallery">Gallery</a></li>
      <li><a href="#about">About</a></li>
    </ul>
    <div class="nav-right">
      <label class="teaching-toggle"><input type="checkbox" id="teaching-toggle"> <span>Teaching mode</span></label>
      <button class="hamburger" id="hamburger" aria-label="Menu"><span></span><span></span><span></span></button>
    </div>
  </nav>
  <div id="mobile-menu" class="mobile-menu">
    <a href="#archetypes">Archetypes</a>
    <a href="#mechanics">Mechanics</a>
    <a href="pitfalls.html">Pitfalls</a>
    <a href="#gallery">Gallery</a>
    <a href="#about">About</a>
  </div>

  <main>
    <section id="stage-1" class="stage active">
      <div class="container">
        <h1>What are you <em>building</em>?</h1>
        <p class="hero-sub">Describe it in a sentence. We'll match the right archetype, mechanics, and pitfalls.</p>
        <textarea id="project-description" rows="3" placeholder="e.g., A donation site for a wedding routing red packets to charity."></textarea>
        <div class="quick-chips">
          <button class="chip" data-chip="A marketing site for a new SaaS product">Marketing site</button>
          <button class="chip" data-chip="An app that takes customer payments">Payment app</button>
          <button class="chip" data-chip="An internal tool for operations team">Internal tool</button>
        </div>
        <button class="btn-primary" id="btn-find-archetype">Find my archetype →</button>
      </div>
    </section>

    <section id="stage-2" class="stage">
      <div class="container">
        <h2>4 quick questions</h2>
        <div id="scoping-questions"></div>
        <div class="match-meter" id="match-meter"></div>
        <button class="btn-primary" id="btn-see-recommendations" disabled>See recommendations →</button>
      </div>
    </section>

    <section id="stage-3" class="stage">
      <div class="container">
        <h2>Your top matches</h2>
        <div id="archetype-recommendations"></div>
      </div>
    </section>

    <section id="stage-4" class="stage">
      <div class="container">
        <div id="archetype-detail"></div>
      </div>
    </section>

    <section id="stage-5" class="stage">
      <div class="container">
        <h2>Your assembled prompt</h2>
        <div class="prompt-output-wrap">
          <div class="prompt-header">
            <h3>Main prompt (paste into Claude)</h3>
            <button class="btn-primary" id="btn-copy-prompt">📋 Copy prompt</button>
          </div>
          <pre id="assembled-prompt"></pre>
        </div>
        <div class="prompt-output-wrap">
          <div class="prompt-header">
            <h3>CONTEXT.md (commit to your new repo)</h3>
            <button class="btn-outline" id="btn-copy-context">📋 Copy context pack</button>
          </div>
          <pre id="context-pack"></pre>
        </div>
        <button class="btn-outline" id="btn-generate-fresh">⚡ Generate fresh samples</button>
      </div>
    </section>
  </main>

  <div class="modal-overlay" id="modal-generate-fresh">
    <div class="modal">
      <h3>Generate custom samples</h3>
      <p>Copy this prompt, paste into a Claude Code session in this folder.</p>
      <pre id="generate-fresh-prompt"></pre>
      <button class="btn-primary" id="btn-copy-generate-prompt">📋 Copy</button>
      <button class="btn-outline" id="btn-close-modal">Close</button>
    </div>
  </div>

  <div class="toast" id="toast"></div>

  <footer>
    <div class="container">
      <p>dt-site-creator — methodology archive by Derrick Teo.</p>
      <p><a href="https://github.com/derrick-pixel/dt-site-creator">Fork on GitHub</a> · <a href="about.html">About</a></p>
    </div>
  </footer>

  <script src="dashboard/js/yaml-mini.js"></script>
  <script src="dashboard/js/main.js"></script>
  <script src="dashboard/js/scoping.js"></script>
  <script src="dashboard/js/assemble.js"></script>
</body>
</html>
```

- [ ] **Step 2: Open in browser** — confirm Stage 1 renders with hero, textarea, chips, button. Stages 2-5 hidden via CSS. No console errors.

- [ ] **Step 3: Commit** — `git add index.html && git commit -m "dashboard: index.html shell" && git push`

---

### Task 14: Write `dashboard/js/yaml-mini.js` (shared YAML parser)

**Files:** Create `dashboard/js/yaml-mini.js`

- [ ] **Step 1: Author the module**

Shared parser used by main.js and pitfalls.js. Handles our specific pitfalls schema (list of objects with string / block-scalar / null values):

```javascript
// ── yaml-mini.js ── minimal parser for pitfalls schema only ──
window.yamlMini = {
  parse(text) {
    const entries = [];
    let current = null;
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('- id:')) {
        if (current) entries.push(current);
        current = { id: line.split(':', 2)[1].trim() };
      } else if (current && line.match(/^\s+\w+:/)) {
        const m = line.match(/^\s+(\w+):\s*(.*)$/);
        if (m) {
          let val = m[2].trim();
          if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
          if (val === 'null') val = null;
          else if (val === '|') {
            val = '';
            while (i + 1 < lines.length && lines[i + 1].match(/^\s{4,}/)) {
              i++;
              val += lines[i].replace(/^\s{4}/, '') + '\n';
            }
            val = val.trim();
          }
          current[m[1]] = val;
        }
      }
    }
    if (current) entries.push(current);
    return entries;
  }
};
```

- [ ] **Step 2: Test in browser console** — load via `<script src>` on index.html, call `yamlMini.parse('- id: foo\n  title: "bar"\n  story: "baz"')`; expect `[{id:'foo', title:'bar', story:'baz'}]`.

- [ ] **Step 3: Commit** — `git add dashboard/js/yaml-mini.js && git commit -m "dashboard: yaml-mini shared parser" && git push`

---

### Task 15: Write `dashboard/js/main.js`

**Files:** Create `dashboard/js/main.js`

**Security constraint:** All dynamic content must be inserted via `textContent`, `createElement`, and `appendChild`. Never use `innerHTML` with template literals that contain `${...}` substitutions.

- [ ] **Step 1: Author the module**

```javascript
// ── dt-site-creator dashboard ── main.js ──────────────────────
// App shell, state, routing, stage 3+4 rendering.

(function() {
  'use strict';

  const STATE_KEY = 'dtsite:session:v1';
  const state = {
    projectDescription: '',
    scopingAnswers: {},
    archetypeScores: {},
    chosenArchetype: null,
    tickedMechanics: [],
    teachingMode: false,
    currentStage: 1
  };

  function loadState() {
    try { const raw = localStorage.getItem(STATE_KEY); if (raw) Object.assign(state, JSON.parse(raw)); } catch(e){}
  }
  function saveState() { localStorage.setItem(STATE_KEY, JSON.stringify(state)); }

  let archetypes = null, mechanics = null, examples = null;
  async function loadData() {
    const [a, m, e] = await Promise.all([
      fetch('dashboard/data/archetypes.json').then(r => r.json()),
      fetch('dashboard/data/mechanics.json').then(r => r.json()),
      fetch('dashboard/data/examples.json').then(r => r.json())
    ]);
    archetypes = a.archetypes; mechanics = m.mechanics; examples = e.examples;
  }

  function goToStage(n) {
    document.querySelectorAll('.stage').forEach(s => s.classList.remove('active'));
    document.getElementById('stage-' + n).classList.add('active');
    state.currentStage = n; saveState();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function wireStage1() {
    const ta = document.getElementById('project-description');
    ta.value = state.projectDescription;
    ta.addEventListener('input', e => { state.projectDescription = e.target.value; saveState(); });
    document.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        ta.value = chip.dataset.chip;
        state.projectDescription = chip.dataset.chip;
        saveState();
      });
    });
    document.getElementById('btn-find-archetype').addEventListener('click', () => {
      if (!state.projectDescription.trim()) { toast("Describe what you're building first."); return; }
      goToStage(2);
      window.scoping.renderQuestions(archetypes);
    });
  }

  // Build a card via DOM APIs (no innerHTML with dynamic data)
  function buildArchetypeCard(archetype, matchPct) {
    const card = document.createElement('div');
    card.className = 'archetype-card';
    card.dataset.archetype = archetype.id;

    const match = document.createElement('div'); match.className = 'archetype-match'; match.textContent = matchPct + '%'; card.appendChild(match);
    const h3 = document.createElement('h3'); h3.textContent = archetype.name; card.appendChild(h3);
    const desc = document.createElement('p'); desc.textContent = archetype.description; card.appendChild(desc);

    const examplesDiv = document.createElement('div'); examplesDiv.className = 'archetype-examples';
    archetype.past_examples.slice(0, 3).forEach(id => {
      const chip = document.createElement('span'); chip.className = 'example-chip'; chip.textContent = id; examplesDiv.appendChild(chip);
    });
    card.appendChild(examplesDiv);

    const btn = document.createElement('button'); btn.className = 'btn-primary archetype-pick-btn';
    btn.textContent = 'Open playbook →'; btn.dataset.archetypeId = archetype.id;
    btn.addEventListener('click', () => {
      state.chosenArchetype = archetype.id; saveState();
      renderArchetypeDetail(archetype.id);
      goToStage(4);
    });
    card.appendChild(btn);

    return card;
  }

  function renderRecommendations() {
    const sorted = [...archetypes].sort((a, b) => (state.archetypeScores[b.id] || 0) - (state.archetypeScores[a.id] || 0));
    const top = sorted.slice(0, 3);
    const maxScore = top[0] ? (state.archetypeScores[top[0].id] || 1) : 1;
    const container = document.getElementById('archetype-recommendations');
    container.replaceChildren();
    top.forEach(a => {
      const pct = Math.round((state.archetypeScores[a.id] || 0) / maxScore * 100);
      container.appendChild(buildArchetypeCard(a, pct));
    });
  }

  function buildExampleCard(e) {
    const card = document.createElement('div'); card.className = 'example-card';
    if (e.screenshot) {
      const img = document.createElement('img'); img.src = e.screenshot; img.alt = e.name; img.onerror = () => { img.style.display = 'none'; };
      card.appendChild(img);
    }
    const h4 = document.createElement('h4'); h4.textContent = e.name; card.appendChild(h4);
    const p = document.createElement('p'); p.textContent = e.why_it_matches; card.appendChild(p);
    if (e.live_url) {
      const a = document.createElement('a'); a.href = e.live_url; a.target = '_blank'; a.textContent = 'Live →'; card.appendChild(a);
    }
    return card;
  }

  function buildMechanicItem(m, archetypeId) {
    const fit = m.fits[archetypeId];
    const label = document.createElement('label'); label.className = 'mechanic-item mechanic-fit-' + fit;
    if (fit === 'rare') label.style.display = 'none';

    const cb = document.createElement('input'); cb.type = 'checkbox'; cb.dataset.mechanicId = m.id;
    const preChecked = fit === 'core' || state.tickedMechanics.includes(m.id);
    cb.checked = preChecked;
    if (preChecked && !state.tickedMechanics.includes(m.id)) state.tickedMechanics.push(m.id);
    cb.addEventListener('change', () => {
      if (cb.checked && !state.tickedMechanics.includes(m.id)) state.tickedMechanics.push(m.id);
      if (!cb.checked) state.tickedMechanics = state.tickedMechanics.filter(x => x !== m.id);
      saveState();
    });
    label.appendChild(cb);

    const icon = document.createElement('span'); icon.className = 'mechanic-icon'; icon.textContent = m.icon; label.appendChild(icon);
    const name = document.createElement('span'); name.className = 'mechanic-name'; name.textContent = m.name; label.appendChild(name);
    const summary = document.createElement('span'); summary.className = 'mechanic-summary'; summary.textContent = m.summary; label.appendChild(summary);
    const fitLabel = document.createElement('span'); fitLabel.className = 'mechanic-fit-label fit-' + fit; fitLabel.textContent = fit; label.appendChild(fitLabel);
    return label;
  }

  async function renderArchetypeDetail(archetypeId) {
    const archetype = archetypes.find(a => a.id === archetypeId);
    const archExamples = examples.filter(e => e.archetype === archetypeId);
    const root = document.getElementById('archetype-detail');
    root.replaceChildren();

    const backBtn = document.createElement('button'); backBtn.className = 'btn-back'; backBtn.textContent = '← back';
    backBtn.addEventListener('click', () => goToStage(3)); root.appendChild(backBtn);

    const h2 = document.createElement('h2'); h2.textContent = archetype.name; root.appendChild(h2);
    const lead = document.createElement('p'); lead.className = 'lead'; lead.textContent = archetype.description; root.appendChild(lead);

    const examplesHeader = document.createElement('h3'); examplesHeader.textContent = 'Past examples'; root.appendChild(examplesHeader);
    const examplesGrid = document.createElement('div'); examplesGrid.className = 'examples-grid';
    archExamples.forEach(e => examplesGrid.appendChild(buildExampleCard(e)));
    root.appendChild(examplesGrid);

    const mechHeader = document.createElement('h3'); mechHeader.textContent = 'Mechanics'; root.appendChild(mechHeader);
    const menu = document.createElement('div'); menu.className = 'mechanic-menu';
    mechanics.forEach(m => menu.appendChild(buildMechanicItem(m, archetypeId)));
    root.appendChild(menu);

    const showAllLabel = document.createElement('label'); showAllLabel.className = 'show-all-mechanics';
    const showAllCb = document.createElement('input'); showAllCb.type = 'checkbox'; showAllCb.id = 'show-all-mechanics';
    showAllCb.addEventListener('change', e => {
      document.querySelectorAll('.mechanic-fit-rare').forEach(el => { el.style.display = e.target.checked ? 'flex' : 'none'; });
    });
    showAllLabel.appendChild(showAllCb);
    showAllLabel.appendChild(document.createTextNode(' Show all mechanics (including rare)'));
    root.appendChild(showAllLabel);

    const pitfallsHeader = document.createElement('h3'); pitfallsHeader.textContent = '⚠ Pitfalls to avoid'; root.appendChild(pitfallsHeader);
    const strip = document.createElement('div'); strip.className = 'pitfalls-strip'; strip.id = 'pitfalls-strip-stage4'; root.appendChild(strip);

    const assembleBtn = document.createElement('button'); assembleBtn.className = 'btn-primary';
    assembleBtn.textContent = 'Assemble my prompt →';
    assembleBtn.addEventListener('click', () => { goToStage(5); window.assemble.render(archetype, state, mechanics); });
    root.appendChild(assembleBtn);

    saveState();
    loadPitfallsStrip(archetypeId);
  }

  async function loadPitfallsStrip(archetypeId) {
    try {
      const resp = await fetch('archetypes/' + archetypeId + '/pitfalls.md');
      const text = await resp.text();
      const yamlMatch = text.match(/```yaml\n([\s\S]*?)\n```/);
      if (!yamlMatch) return;
      const entries = window.yamlMini.parse(yamlMatch[1]);
      const top = entries.filter(p => p.severity === 'critical' || p.severity === 'high').slice(0, 4);
      const strip = document.getElementById('pitfalls-strip-stage4');
      top.forEach(p => {
        const card = document.createElement('div'); card.className = 'pitfall-card-mini severity-' + p.severity;
        const sev = document.createElement('span'); sev.className = 'severity-badge severity-' + p.severity; sev.textContent = p.severity; card.appendChild(sev);
        const h4 = document.createElement('h4'); h4.textContent = p.title; card.appendChild(h4);
        const pEl = document.createElement('p'); pEl.textContent = p.story; card.appendChild(pEl);
        strip.appendChild(card);
      });
    } catch(e) { console.error('pitfalls load failed', e); }
  }

  function wireTeachingMode() {
    const toggle = document.getElementById('teaching-toggle');
    toggle.checked = state.teachingMode;
    document.body.classList.toggle('teaching-mode', state.teachingMode);
    toggle.addEventListener('change', () => {
      state.teachingMode = toggle.checked;
      document.body.classList.toggle('teaching-mode', state.teachingMode);
      saveState();
    });
  }

  function wireHamburger() {
    document.getElementById('hamburger').addEventListener('click', () => {
      document.getElementById('hamburger').classList.toggle('open');
      document.getElementById('mobile-menu').classList.toggle('open');
    });
  }

  function toast(msg, duration = 2200) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), duration);
  }
  window.toast = toast;

  async function init() {
    loadState();
    await loadData();
    wireStage1();
    wireTeachingMode();
    wireHamburger();
    window.main = { state, saveState, goToStage, renderRecommendations, renderArchetypeDetail, archetypes, mechanics, examples };
    if (state.currentStage > 1) goToStage(state.currentStage);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
```

- [ ] **Step 2: Browser test**

Open `index.html`. Type in textarea. Click "Find my archetype →". Confirm Stage 2 appears. Refresh; state restored to Stage 2.

- [ ] **Step 3: Commit** — `git add dashboard/js/main.js && git commit -m "dashboard: main.js with safe DOM rendering" && git push`

---

### Task 16: Write `dashboard/js/scoping.js`

**Files:** Create `dashboard/js/scoping.js`

- [ ] **Step 1: Author the module**

```javascript
// ── scoping.js ── Stage 2 wizard + scoring ────────────────────
(function() {
  'use strict';

  const questions = [
    { id: 'q1', text: 'Who visits?', options: [
      { id: 'q1_public', label: 'The general public' },
      { id: 'q1_customers', label: 'Paying customers' },
      { id: 'q1_internal', label: 'Internal team' },
      { id: 'q1_learners', label: 'Learners / trainees' }
    ]},
    { id: 'q2', text: 'Do users give you money or data?', options: [
      { id: 'q2_no_money', label: 'No — content only' },
      { id: 'q2_one_time', label: 'One-time payment or upload' },
      { id: 'q2_recurring', label: 'Recurring (subscription, persistent accounts)' },
      { id: 'q2_escrow', label: 'Complex (escrow, marketplace, multi-party)' }
    ]},
    { id: 'q3', text: 'Core experience?', options: [
      { id: 'q3_content', label: 'Content (read / browse)' },
      { id: 'q3_interaction', label: 'Interaction (do / calculate)' },
      { id: 'q3_goal', label: 'Goal (win / level up)' }
    ]},
    { id: 'q4', text: 'Live data layer?', options: [
      { id: 'q4_no_data', label: 'No' },
      { id: 'q4_dashboard', label: 'Yes — dashboard / analytics' },
      { id: 'q4_api', label: 'Yes — external API integration' }
    ]}
  ];

  function buildQuestion(q) {
    const wrap = document.createElement('div'); wrap.className = 'scoping-q'; wrap.dataset.q = q.id;
    const h4 = document.createElement('h4'); h4.textContent = q.text; wrap.appendChild(h4);
    const optsDiv = document.createElement('div'); optsDiv.className = 'scoping-options';
    q.options.forEach(o => {
      const label = document.createElement('label'); label.className = 'scoping-option';
      const radio = document.createElement('input'); radio.type = 'radio'; radio.name = q.id; radio.value = o.id;
      if (window.main.state.scopingAnswers[q.id] === o.id) radio.checked = true;
      label.appendChild(radio);
      const span = document.createElement('span'); span.textContent = o.label; label.appendChild(span);
      optsDiv.appendChild(label);
    });
    wrap.appendChild(optsDiv);
    return wrap;
  }

  function renderQuestions(archetypes) {
    const container = document.getElementById('scoping-questions');
    container.replaceChildren();
    questions.forEach(q => container.appendChild(buildQuestion(q)));

    container.addEventListener('change', e => {
      if (e.target.matches('input[type="radio"]')) {
        window.main.state.scopingAnswers[e.target.name] = e.target.value;
        window.main.saveState();
        recomputeScores(archetypes);
        checkReady();
      }
    });

    recomputeScores(archetypes); checkReady();

    document.getElementById('btn-see-recommendations').addEventListener('click', () => {
      window.main.goToStage(3);
      window.main.renderRecommendations();
    });
  }

  function recomputeScores(archetypes) {
    const scores = {};
    archetypes.forEach(a => { scores[a.id] = 0; });
    Object.values(window.main.state.scopingAnswers).forEach(ans => {
      archetypes.forEach(a => { scores[a.id] += a.scoring_weights[ans] || 0; });
    });
    window.main.state.archetypeScores = scores; window.main.saveState();
    renderMatchMeter(archetypes, scores);
  }

  function renderMatchMeter(archetypes, scores) {
    const max = Math.max(...Object.values(scores), 1);
    const meter = document.getElementById('match-meter');
    meter.replaceChildren();
    archetypes.forEach(a => {
      const pct = Math.round((scores[a.id] / max) * 100);
      const bar = document.createElement('div'); bar.className = 'match-bar'; bar.dataset.archetype = a.id;
      const lbl = document.createElement('div'); lbl.className = 'match-bar-label'; lbl.textContent = a.name; bar.appendChild(lbl);
      const track = document.createElement('div'); track.className = 'match-bar-track';
      const fill = document.createElement('div'); fill.className = 'match-bar-fill';
      fill.style.width = pct + '%'; fill.style.background = a.color_hint;
      track.appendChild(fill); bar.appendChild(track);
      const score = document.createElement('div'); score.className = 'match-bar-score'; score.textContent = scores[a.id]; bar.appendChild(score);
      meter.appendChild(bar);
    });
  }

  function checkReady() {
    const answered = Object.keys(window.main.state.scopingAnswers).length;
    document.getElementById('btn-see-recommendations').disabled = answered < 4;
  }

  window.scoping = { renderQuestions };
})();
```

- [ ] **Step 2: Browser test** — click to Stage 2, answer 4 questions, watch meter update, click button to Stage 3.

- [ ] **Step 3: Commit** — `git add dashboard/js/scoping.js && git commit -m "dashboard: scoping.js" && git push`

---

### Task 17: Write `dashboard/js/assemble.js`

**Files:** Create `dashboard/js/assemble.js`

- [ ] **Step 1: Author the module**

```javascript
// ── assemble.js ── Stage 5: prompt + context pack + modal ──────
(function() {
  'use strict';

  async function render(archetype, state, mechanics) {
    const promptTemplate = await fetch('archetypes/' + archetype.id + '/prompt.md').then(r => r.text());
    const parts = promptTemplate.split(/^---\s*$/m);
    const promptBody = parts[parts.length - 1].trim();

    const tickedMechs = mechanics.filter(m => state.tickedMechanics.includes(m.id));
    const scopingText = formatScopingAnswers(state.scopingAnswers);
    const mechanicText = tickedMechs.length
      ? tickedMechs.map(m => '- ' + m.name + ' (see /mechanics/' + m.id + '/)').join('\n')
      : '- (none selected)';
    const pitfallsText = await fetchTopPitfalls(archetype.id);

    const assembled = promptBody
      .replace('{{project_description}}', state.projectDescription)
      .replace('{{scoping_answers}}', scopingText)
      .replace('{{ticked_mechanics}}', mechanicText)
      .replace('{{pitfalls_warnings}}', pitfallsText);

    document.getElementById('assembled-prompt').textContent = assembled;

    const projectName = deriveProjectName(state.projectDescription);
    const contextPack =
      '# CONTEXT.md — ' + projectName + '\n\n' +
      '**Archetype:** ' + archetype.name + ' (' + archetype.id + ')\n' +
      '**Source:** Built with dt-site-creator methodology archive.\n\n' +
      '**What we\'re building:**\n' + state.projectDescription + '\n\n' +
      '**Scoping:**\n' + scopingText + '\n\n' +
      '**Mechanics selected:**\n' + mechanicText + '\n\n' +
      '**Top pitfalls to watch:**\n' + pitfallsText + '\n\n' +
      '**Style authority:** https://github.com/derrick-pixel/dt-site-creator/blob/main/archetypes/' + archetype.id + '/CLAUDE.md\n';

    document.getElementById('context-pack').textContent = contextPack;

    wireCopyButtons(assembled, contextPack);
    wireGenerateFreshButton(archetype, state, tickedMechs);
  }

  function formatScopingAnswers(answers) {
    const labels = {
      q1_public: 'public visitors', q1_customers: 'paying customers', q1_internal: 'internal team', q1_learners: 'learners',
      q2_no_money: 'no payment/data', q2_one_time: 'one-time payment/upload', q2_recurring: 'recurring', q2_escrow: 'complex (escrow/marketplace)',
      q3_content: 'content-centric', q3_interaction: 'interaction-centric', q3_goal: 'goal-centric',
      q4_no_data: 'no live data layer', q4_dashboard: 'dashboard/analytics', q4_api: 'external API integration'
    };
    return Object.values(answers).map(v => '- ' + (labels[v] || v)).join('\n');
  }

  async function fetchTopPitfalls(archetypeId) {
    try {
      const resp = await fetch('archetypes/' + archetypeId + '/pitfalls.md');
      const text = await resp.text();
      const yamlMatch = text.match(/```yaml\n([\s\S]*?)\n```/);
      if (!yamlMatch) return '(none)';
      const entries = window.yamlMini.parse(yamlMatch[1]);
      const top = entries.filter(e => e.severity === 'critical' || e.severity === 'high').slice(0, 5);
      if (!top.length) return '(none)';
      return top.map(p => '⚠ ' + p.title + ' — ' + p.story).join('\n');
    } catch(e) { return '(none)'; }
  }

  function deriveProjectName(desc) {
    return desc.toLowerCase().split(/\s+/).slice(0, 4).join('-').replace(/[^a-z0-9-]/g, '');
  }

  function wireCopyButtons(prompt, contextPack) {
    document.getElementById('btn-copy-prompt').onclick = () => {
      navigator.clipboard.writeText(prompt).then(() => window.toast('Prompt copied ✓'));
    };
    document.getElementById('btn-copy-context').onclick = () => {
      navigator.clipboard.writeText(contextPack).then(() => window.toast('Context pack copied ✓'));
    };
  }

  function wireGenerateFreshButton(archetype, state, tickedMechs) {
    document.getElementById('btn-generate-fresh').onclick = () => {
      const slug = deriveProjectName(state.projectDescription);
      const freshPrompt =
        'Use the frontend-design skill to generate 4 mockup variants for:\n' +
        '- Archetype: ' + archetype.name + '\n' +
        '- Project: "' + state.projectDescription + '"\n' +
        '- Mechanics: ' + tickedMechs.map(m => m.name).join(', ') + '\n' +
        '- Constraint: match dt-site-creator archetype rules (see archetypes/' + archetype.id + '/CLAUDE.md)\n' +
        '- Output: 4 HTML files in dt-site-creator/dashboard/samples/custom/' + slug + '/\n' +
        '- Each variant explores a different palette direction (bold, muted, warm, cool)\n' +
        '- Append entry to dt-site-creator/dashboard/samples/custom/custom-index.json: { "id": "' + slug + '", "archetype": "' + archetype.id + '", "variants": ["variant-1.html","variant-2.html","variant-3.html","variant-4.html"] }';

      document.getElementById('generate-fresh-prompt').textContent = freshPrompt;
      document.getElementById('modal-generate-fresh').classList.add('open');
      document.getElementById('btn-copy-generate-prompt').onclick = () => {
        navigator.clipboard.writeText(freshPrompt).then(() => window.toast('Fresh-samples prompt copied ✓'));
      };
      document.getElementById('btn-close-modal').onclick = () => {
        document.getElementById('modal-generate-fresh').classList.remove('open');
      };
    };
  }

  window.assemble = { render };
})();
```

- [ ] **Step 2: Browser test** — click through all stages; at Stage 5 verify prompt + context pack populated; verify copy buttons work (paste into text editor to confirm). Verify Generate-Fresh modal opens with correct content.

- [ ] **Step 3: Commit** — `git add dashboard/js/assemble.js && git commit -m "dashboard: assemble.js" && git push`

---

### Task 18: Write `pitfalls.html` + `dashboard/js/pitfalls.js`

**Files:**
- Create: `pitfalls.html`
- Create: `dashboard/js/pitfalls.js`

- [ ] **Step 1: Write `pitfalls.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pitfalls Wall — DT Site Creator</title>
  <meta name="description" content="40+ scar-tissue lessons from 20+ past projects." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://derrick-pixel.github.io/dt-site-creator/pitfalls.html" />
  <meta property="og:title" content="Pitfalls Wall — DT Site Creator" />
  <meta property="og:description" content="40+ scar-tissue lessons from 20+ past projects." />
  <meta property="og:image" content="https://derrick-pixel.github.io/dt-site-creator/og-image.jpg" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="dashboard/css/style.css" />
</head>
<body>
  <nav id="site-nav">
    <a href="/" class="nav-logo">DT<span>.</span>site</a>
    <ul class="nav-links">
      <li><a href="index.html">Dashboard</a></li>
      <li><a href="pitfalls.html" class="active">Pitfalls</a></li>
      <li><a href="index.html#gallery">Gallery</a></li>
      <li><a href="index.html#about">About</a></li>
    </ul>
  </nav>

  <main>
    <section class="container">
      <h1>⚠ Pitfalls Wall</h1>
      <p class="lead">Scar-tissue lessons from 20+ past projects. Filter by archetype, severity, or phase.</p>

      <div class="pitfalls-filters">
        <div class="filter-group"><label>Archetype</label>
          <select id="filter-archetype">
            <option value="">All</option>
            <option value="static-informational">Static Informational</option>
            <option value="transactional">Transactional</option>
            <option value="simulator-educational">Simulator/Educational</option>
            <option value="game">Game</option>
            <option value="dashboard-analytics">Dashboard/Analytics</option>
          </select>
        </div>
        <div class="filter-group"><label>Severity</label>
          <select id="filter-severity">
            <option value="">All</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div class="filter-group"><label>Phase</label>
          <select id="filter-phase">
            <option value="">All</option>
            <option value="planning">Planning</option>
            <option value="building">Building</option>
            <option value="shipping">Shipping</option>
            <option value="live">Live</option>
          </select>
        </div>
      </div>

      <div id="pitfalls-grid" class="pitfalls-grid"></div>
    </section>
  </main>

  <div class="toast" id="toast"></div>

  <script src="dashboard/js/yaml-mini.js"></script>
  <script src="dashboard/js/pitfalls.js"></script>
</body>
</html>
```

- [ ] **Step 2: Write `dashboard/js/pitfalls.js`**

```javascript
// ── pitfalls.js ── Pitfalls wall ───────────────────────────────
(function() {
  'use strict';

  const archetypeIds = ['static-informational', 'transactional', 'simulator-educational', 'game', 'dashboard-analytics'];
  let allPitfalls = [];

  async function loadAllPitfalls() {
    const results = await Promise.all(archetypeIds.map(async id => {
      const resp = await fetch('archetypes/' + id + '/pitfalls.md');
      const text = await resp.text();
      const yamlMatch = text.match(/```yaml\n([\s\S]*?)\n```/);
      if (!yamlMatch) return [];
      return window.yamlMini.parse(yamlMatch[1]).map(e => ({ ...e, archetype: id }));
    }));
    // Dedupe universal pitfalls (they appear in all 5)
    const seen = new Map();
    results.flat().forEach(p => { if (!seen.has(p.id)) seen.set(p.id, p); });
    allPitfalls = Array.from(seen.values());
    render();
  }

  function buildPitfallCard(p) {
    const card = document.createElement('div'); card.className = 'pitfall-card severity-' + p.severity; card.dataset.id = p.id;

    const front = document.createElement('div'); front.className = 'pitfall-front';
    const header = document.createElement('div'); header.className = 'pitfall-header';
    const sev = document.createElement('span'); sev.className = 'severity-badge severity-' + p.severity;
    sev.textContent = '⚠ ' + p.severity.toUpperCase(); header.appendChild(sev);
    const tag = document.createElement('span'); tag.className = 'archetype-tag'; tag.textContent = p.archetype || 'universal'; header.appendChild(tag);
    front.appendChild(header);

    const h3 = document.createElement('h3'); h3.textContent = p.title; front.appendChild(h3);
    const story = document.createElement('p'); story.className = 'pitfall-story'; story.textContent = p.story; front.appendChild(story);
    const source = document.createElement('p'); source.className = 'pitfall-source'; source.textContent = '— ' + p.source; front.appendChild(source);

    if (p.fix) {
      const details = document.createElement('details'); details.className = 'pitfall-fix';
      const summary = document.createElement('summary'); summary.textContent = 'Show the fix ▾'; details.appendChild(summary);
      const pre = document.createElement('pre'); pre.textContent = p.fix; details.appendChild(pre);
      front.appendChild(details);
    }

    if (p.mechanic) {
      const link = document.createElement('a'); link.className = 'linked-mechanic';
      link.href = 'mechanics/' + p.mechanic + '/'; link.textContent = 'Linked: ' + p.mechanic;
      front.appendChild(link);
    }

    card.appendChild(front);

    const back = document.createElement('div'); back.className = 'pitfall-back';
    const h4 = document.createElement('h4'); h4.textContent = 'LESSON'; back.appendChild(h4);
    const lessonP = document.createElement('p'); lessonP.textContent = p.lesson || ''; back.appendChild(lessonP);
    card.appendChild(back);

    return card;
  }

  function render() {
    const archetypeFilter = document.getElementById('filter-archetype').value;
    const severityFilter = document.getElementById('filter-severity').value;
    const phaseFilter = document.getElementById('filter-phase').value;

    const filtered = allPitfalls.filter(p =>
      (!archetypeFilter || p.archetype === archetypeFilter || p.id.startsWith('universal-')) &&
      (!severityFilter || p.severity === severityFilter) &&
      (!phaseFilter || p.phase === phaseFilter)
    );

    const grid = document.getElementById('pitfalls-grid');
    grid.replaceChildren();
    if (!filtered.length) {
      const empty = document.createElement('p'); empty.textContent = 'No pitfalls match these filters.'; grid.appendChild(empty);
      return;
    }
    filtered.forEach(p => grid.appendChild(buildPitfallCard(p)));
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadAllPitfalls();
    ['filter-archetype', 'filter-severity', 'filter-phase'].forEach(id => {
      document.getElementById(id).addEventListener('change', render);
    });
  });
})();
```

- [ ] **Step 3: Browser test** — open `pitfalls.html`, expect ~35+ cards, filters work, fix expands, linked mechanic navigates.

- [ ] **Step 4: Commit** — `git add pitfalls.html dashboard/js/pitfalls.js && git commit -m "dashboard: pitfalls.html wall" && git push`

---

## Phase 3 — Visual content + deploy

### Task 19: Generate 14 sample mockups via frontend-design

**Files:** `dashboard/samples/<archetype>/<name>.jpg` — one per past-project example listed in examples.json.

- [ ] **Step 1: Option A — Screenshot live sites (preferred when available)**

For each past project with a live URL in `dashboard/data/examples.json`, use headless browser (gstack or puppeteer) to screenshot the landing page at 1200×800, save to matching path.

Screenshots needed:
- `static-informational/casket.jpg` ← https://derrick-pixel.github.io/casket/
- `static-informational/lumana.jpg` ← https://derrick-pixel.github.io/Lumana/
- `static-informational/vectorsky.jpg` ← https://derrick-pixel.github.io/vectorsky/
- `static-informational/xinceai.jpg` ← https://derrick-pixel.github.io/XinceAI/
- `transactional/altru.jpg` ← https://derrick-pixel.github.io/Derrickclaude/
- `transactional/discounter.jpg` ← https://derrick-pixel.github.io/discounter/
- `transactional/the-commons.jpg` ← https://derrick-pixel.github.io/the-commons/
- `simulator-educational/market-tracker.jpg` ← https://markettracker.streamlit.app/
- `simulator-educational/dtws.jpg` ← https://derrick-pixel.github.io/dtws_works/
- `simulator-educational/elix-resume.jpg` ← https://derrick-pixel.github.io/ELIX-resume/
- `game/elixcraft.jpg` ← https://derrick-pixel.github.io/elixcraft/

- [ ] **Step 2: Option B — Generate mockups via frontend-design for private / no-live-URL projects**

For these 3 (no live URL in examples.json): quotation-preparer, eco-dashboard, elitez-csuite — invoke `frontend-design` skill with:

```
Generate a 1200×800 landing-page mockup for <project>:
- Palette: <hint from archetype>
- Main sections: hero, one content band, footer
- Style: dt-site-creator rules (see archetypes/<archetype>/CLAUDE.md)
- Output: dashboard/samples/<archetype>/<project-slug>.jpg
```

- [ ] **Step 3: Verify**

```bash
ls dashboard/samples/static-informational/ | wc -l   # expect 4
ls dashboard/samples/transactional/ | wc -l          # expect 4
ls dashboard/samples/simulator-educational/ | wc -l  # expect 3
ls dashboard/samples/game/ | wc -l                   # expect 1
ls dashboard/samples/dashboard-analytics/ | wc -l    # expect 2
# Total: 14 screenshots
```

- [ ] **Step 4: Replace mechanic `preview.jpg` placeholders with real thumbnails**

For each of the 9 mechanics, capture a 400×300 thumbnail of the snippet rendered in a browser. Save at `mechanics/<id>/preview.jpg`.

- [ ] **Step 5: Commit** — `git add dashboard/samples/ mechanics/*/preview.jpg && git commit -m "visuals: 14 sample mockups + 9 mechanic previews" && git push`

---

### Task 20: Generate `og-image.jpg`

**Files:** Create `og-image.jpg` at repo root (1200×630)

- [ ] **Step 1: Render OG image**

Either via frontend-design skill, or build a temp `og.html` with:
- Background: `linear-gradient(135deg, #0d1117, #1c2128)`
- Title: "DT Site Creator" (80px, white, Inter 800)
- Subtitle: "Methodology Archive — 5 archetypes · 9 mechanics · 40+ pitfalls" (32px, amber #ffa657, Manrope 500)
- Footer text: "by Derrick Teo · derrick-pixel.github.io/dt-site-creator" (24px, muted #8b949e)
- Canvas: 1200×630

Screenshot the rendered HTML. Save as `og-image.jpg`.

- [ ] **Step 2: Verify** — `file og-image.jpg` → expect `JPEG image data, ... 1200x630`.

- [ ] **Step 3: Commit** — `git add og-image.jpg && git commit -m "visuals: add 1200x630 OG image" && git push`

---

### Task 21: Update root `README.md` + shim root `CLAUDE.md`

**Files:**
- Modify: `README.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Replace `README.md`**

```markdown
# dt-site-creator

A methodology archive + interactive dashboard for Derrick Teo's website-building practice.

**Live:** https://derrick-pixel.github.io/dt-site-creator/

## What this is

Five archetype playbooks, nine reusable mechanics, forty-plus pitfalls — compiled from 20+ past projects.

## Two ways to use

**Visual (humans):** open [index.html](./index.html) or the live URL. Answer 4 questions, get archetype recommendations, pick mechanics, copy a ready-made Claude prompt.

**Textual (agents):** tell Claude *"Use dt-site-creator for [project]"* — it reads `archetypes/README.md`, picks the archetype, follows the playbook.

## Structure

- `archetypes/` — 5 playbook folders
- `mechanics/` — 9 reusable bricks
- `dashboard/` — dashboard CSS/JS/data + sample gallery
- `pitfalls.html` — standalone pitfalls wall
- `reference/` — starter templates

## Teach it

Toggle **Teaching mode** in the dashboard nav to see the "why" behind each step.

## Roadmap

- v1 (shipped) — breadth: all 5 archetypes + 9 mechanics + 40+ pitfalls + dashboard
- v1.5 — depth on static-informational + transactional, card-flip animations
- v2 — depth on remaining 3, trainee account save

## Contribute

Fork on GitHub. Add a pitfall / mechanic / archetype. Open a PR.
```

- [ ] **Step 2: Replace `CLAUDE.md` with shim**

```markdown
# DT Site Creator — Router

This file used to contain the full static-site playbook. It has been refactored into 5 archetype-specific playbooks in `archetypes/`.

## If you are Claude starting a new project

1. Read [`archetypes/README.md`](./archetypes/README.md) for the decision matrix.
2. Pick the archetype matching the user's project.
3. Read that folder's 5 files: `CLAUDE.md`, `prompt.md`, `examples.md`, `mechanic-fit.md`, `pitfalls.md`.
4. Build per those rules.

## If you are a human

Open [index.html](./index.html) or https://derrick-pixel.github.io/dt-site-creator/

## Backward compatibility

Previous "use dt-site-creator for static site" prompts still work — they route to [`archetypes/static-informational/CLAUDE.md`](./archetypes/static-informational/CLAUDE.md), which contains the full original content.
```

- [ ] **Step 3: Commit** — `git add README.md CLAUDE.md && git commit -m "docs: update README + shim root CLAUDE.md" && git push`

---

### Task 22: Enable GitHub Pages + verify live

**Files:** none (GitHub setting)

- [ ] **Step 1: Enable Pages**

```bash
gh api -X POST "/repos/derrick-pixel/dt-site-creator/pages" -f source.branch=main -f source.path=/ 2>&1 | head -5 || \
  gh api -X PATCH "/repos/derrick-pixel/dt-site-creator/pages" -f source.branch=main -f source.path=/
```

- [ ] **Step 2: Wait for deploy** — monitor via `gh api "/repos/derrick-pixel/dt-site-creator/pages/builds" --jq '.[0].status'` until `built`.

- [ ] **Step 3: Verify**

```bash
curl -sI https://derrick-pixel.github.io/dt-site-creator/ | head -1
# Expected: HTTP/2 200
```

Open in browser. Confirm dashboard loads, all stages reachable, pitfalls.html loads.

- [ ] **Step 4: OG preview check**

Paste live URL into https://cards-dev.twitter.com/validator and https://developers.facebook.com/tools/debug/ — confirm 1200×630 image renders.

---

### Task 23: End-to-end QA (5 archetype paths)

**Files:** none (QA; may require scoring-weight tweaks)

- [ ] **Step 1: Run all 5 scenarios**

| # | Input | Expected top |
|---|---|---|
| 1 | "A marketing site for a new SaaS for dentists" | static-informational |
| 2 | "A donation site with PayNow pass-through to charity" | transactional |
| 3 | "A quiz platform to train warehouse staff on safety" | simulator-educational |
| 4 | "A gamified onboarding experience for new hires" | game |
| 5 | "An internal dashboard showing live plant KPIs" | dashboard-analytics |

For each: click through Stages 1→5, confirm top match = expected.

- [ ] **Step 2: If mismatches found**

Adjust `dashboard/data/archetypes.json` `scoring_weights`. Re-test. Commit fix.

- [ ] **Step 3: Mobile test**

Open live URL on phone (or responsive devtools ≤768px). Confirm:
- Hamburger opens mobile menu
- All 5 stages readable
- Pitfalls wall cards stack
- Copy buttons work (especially iOS Safari)

- [ ] **Step 4: Commit any fixes**

```bash
git add -A && git commit -m "qa: scoring/mobile adjustments from e2e test" && git push
```

---

### Task 24: Update auto-memory

**Files:**
- Modify: `/Users/derrickteo/.claude/projects/-Users-derrickteo-codings/memory/project_dt_site_creator.md`
- Modify: `/Users/derrickteo/.claude/projects/-Users-derrickteo-codings/memory/MEMORY.md`

- [ ] **Step 1: Rewrite `project_dt_site_creator.md`**

```markdown
---
name: DT Site Creator Methodology Archive
description: Interactive dashboard + 5 archetype playbooks + 9 mechanics + 40+ pitfalls at dt-site-creator/. Live at derrick-pixel.github.io/dt-site-creator/
type: project
---

dt-site-creator/ is a methodology archive + browsable dashboard. Replaces the previous single-playbook style agent.

**Why:** Derrick builds across 5 archetypes but the agent only knew one. Compresses project kick-off from ~30 minutes to ~90 seconds (target 5x productivity).

**How to apply:**
- Human path: open dt-site-creator/index.html or derrick-pixel.github.io/dt-site-creator/. 4-question scoping → archetype match → mechanic picks → assembled prompt.
- Claude path: when user says "use dt-site-creator for X", read `archetypes/README.md`, pick the matching archetype, follow its 5-file contract (CLAUDE.md, prompt.md, examples.md, mechanic-fit.md, pitfalls.md).
- 9 mechanics at `mechanics/`: paynow-qr, localstorage-state, admin-auth-gate, canvas-hero, chartjs-dashboard, pdf-pipeline, wizard-form, multi-page-scaffold, og-social-meta.
- Pitfalls at `archetypes/<slug>/pitfalls.md` — YAML entries. Top-severity ones auto-inject into assembled prompts.

**Roadmap:**
- v1 (shipped 2026-04-18): breadth — all archetypes + mechanics + pitfalls wall
- v1.5: depth on static-informational + transactional
- v2: depth on remaining 3 archetypes + trainee save/restore
```

- [ ] **Step 2: Update `MEMORY.md` index line**

Find the existing DT Site Creator line and replace with:

```markdown
- [DT Site Creator Archive](project_dt_site_creator.md) — Methodology archive: 5 archetype playbooks + 9 mechanics + 40+ pitfalls + interactive dashboard at derrick-pixel.github.io/dt-site-creator/
```

- [ ] **Step 3: No repo commit needed** — memory is outside the repo.

---

## Self-Review

**Spec coverage:**
- §3.1 folder structure → Task 1 + all author tasks
- §4 UX flow (6 stages) → Tasks 13-17
- §5 archetype 5-file contract → Tasks 3-7
- §6 mechanic 5-file contract → Tasks 9-10
- §7 prompt assembly → Task 17
- §8 pitfalls as visitor feature → Task 18
- §9 v1 breadth scope → Tasks 3-7 cover all 5 archetypes
- §10 deployment → Tasks 22-23
- §11 testing → Task 23 + verification in each task
- §13 success criteria → post-ship metric, not plan scope

**Placeholder scan:** one area of compression — Task 10 describes 8 mechanics with their spec + fit matrix + key skeleton rather than duplicating full 5-file content for each. The engineer has: explicit fit values, past_uses, linked_pitfalls, and the Task 9 reference implementation as a pattern. For snippet.html content, each mechanic has ~2-3 sentences of specific behavior described (e.g., "versioned localStorage wrapper with get/set/migrate"). This is a judgment call on plan length vs. completeness; flagging so the implementer knows to use Task 9 as the template.

**Type consistency:**
- `state` properties match across main.js / scoping.js / assemble.js (projectDescription, scopingAnswers, archetypeScores, chosenArchetype, tickedMechanics, teachingMode, currentStage).
- `window.yamlMini.parse(text)` used by both main.js loadPitfallsStrip and pitfalls.js and assemble.js fetchTopPitfalls — all reference the same shared module.
- `fits` values use canonical set: `core | optional | rare`. Never deviates.
- Severity values: `critical | high | medium | low`. Phase values: `planning | building | shipping | live`.

**Ambiguities resolved:**
- `custom-index.json` convention — Claude appends entries when generating custom samples (explicit in Task 17 generate-fresh prompt text).
- Teaching Mode at v1 — text-only callouts (no card flip); flip deferred to v1.5 (documented in spec §4 cross-cutting).
- Mechanic fit source of truth — `meta.json` wins over `mechanic-fit.md` (spec §5.4).

**Security:**
- "No innerHTML with dynamic content" rule stated in plan header, enforced in Tasks 15-18 via explicit createElement / textContent patterns.

---

## Execution Handoff

**Plan complete and saved to `docs/plans/2026-04-18-v1-methodology-archive.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**

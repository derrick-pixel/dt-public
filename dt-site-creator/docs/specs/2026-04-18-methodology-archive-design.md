# dt-site-creator — Methodology Archive & Suggestions Dashboard

**Status:** Spec (draft for approval)
**Author:** Derrick Teo + Claude (brainstorming session)
**Date:** 2026-04-18
**Supersedes:** Current single-playbook `CLAUDE.md` (migrated, not deleted)

---

## 1. Problem Statement

`dt-site-creator/` today is a *single-playbook style agent* — one CLAUDE.md that teaches Claude how to build a static vanilla-HTML marketing site. In the last month Derrick has shipped ~20 projects spanning **five distinct archetypes** (static-informational, transactional, simulator/educational, game, dashboard/analytics), yet the agent only knows one of them. Every new project begins with a cold boot: re-explaining the archetype, re-deciding tech stack, re-selecting mechanics, re-running competitor research.

**Goal:** turn `dt-site-creator/` into a **methodology archive** — a browsable, interactive HTML dashboard that proposes the right archetype + stack + mechanics + pitfalls at project start. The dashboard is authored to serve three audiences at once:

1. **Derrick himself** — compresses project kick-off from ~30 minutes of prompting to ~90 seconds of clicking. Target: 5× productivity.
2. **Friends new to vibe-coding** — a demo-able artifact showing that AI-assisted development is structured, not mystical.
3. **Future trainees** — a public teaching channel / service layer for a paid class, with a Teaching Mode that reveals the *why* behind every choice.

## 2. Non-Goals (v1)

- Not a code generator. The dashboard *assembles prompts* for Claude; it does not run Claude.
- Not a CMS. Archetype and mechanic content is file-based (markdown + YAML + JSON), not database-backed.
- Not account-based. No login, no server. Sessions persist in `localStorage` only.
- Not a replacement for the existing repos. Past projects stay where they are; the archive *references* them.
- Not production-secure. The dashboard is static, client-side, and renders only its own known content.

## 3. Architecture Overview

Two-layer artifact in one repo: a public HTML **dashboard** (human-facing) and a file-based **playbook library** (Claude-facing). Both read from the same JSON/markdown source of truth.

### 3.1 Folder Structure

```
dt-site-creator/
├── index.html                 # THE DASHBOARD (GitHub Pages entry)
├── pitfalls.html              # Dedicated pitfalls wall
├── about.html                 # Creator/teaching-channel page (v2)
├── dashboard/
│   ├── css/style.css          # Dashboard styling
│   ├── js/
│   │   ├── main.js            # App shell, router, state
│   │   ├── scoping.js         # Stage-2 wizard + weighted scoring
│   │   ├── assemble.js        # Stage-5 prompt templating
│   │   └── pitfalls.js        # Pitfalls-wall filtering + card flip
│   ├── data/
│   │   ├── archetypes.json    # Index of 5 archetypes + scoring weights
│   │   ├── mechanics.json     # Index of 9 mechanics (loaded on demand)
│   │   └── examples.json      # Past-project catalog (20+ entries)
│   └── samples/
│       ├── static-informational/    # 4 pre-rendered mockups per archetype
│       ├── transactional/
│       ├── simulator-educational/
│       ├── game/
│       ├── dashboard-analytics/
│       └── custom/                  # User-generated via Generate-Fresh button
│
├── archetypes/                # THE PLAYBOOKS (Claude reads these)
│   ├── README.md              # Decision matrix + pointers
│   ├── static-informational/
│   │   ├── CLAUDE.md          # Tech stack + component rules
│   │   ├── prompt.md          # Copy-paste starter with {{placeholders}}
│   │   ├── examples.md        # Past projects that fit
│   │   ├── mechanic-fit.md    # Which mechanics apply (core/optional/rare)
│   │   └── pitfalls.md        # YAML-front-matter pitfall entries
│   ├── transactional/         # Same 5-file contract
│   ├── simulator-educational/
│   ├── game/
│   └── dashboard-analytics/
│
├── mechanics/                 # THE LEGO BRICKS
│   ├── README.md              # Mechanic index
│   ├── paynow-qr/
│   │   ├── README.md          # What / when / trade-offs / how to use
│   │   ├── snippet.html       # Self-contained paste-in HTML+CSS+JS
│   │   ├── example-use.md     # Past project implementation excerpt
│   │   ├── preview.jpg        # 400×300 dashboard card thumbnail
│   │   └── meta.json          # Dashboard-readable metadata
│   ├── localstorage-state/
│   ├── admin-auth-gate/
│   ├── canvas-hero/
│   ├── chartjs-dashboard/
│   ├── pdf-pipeline/
│   ├── wizard-form/
│   ├── multi-page-scaffold/
│   └── og-social-meta/
│
├── reference/                 # Existing starter templates (kept)
│   ├── dark-template.html
│   └── light-template.html
│
├── CLAUDE.md                  # Shim → points to archetypes/*/CLAUDE.md
├── README.md                  # Repo intro
└── docs/
    ├── specs/
    │   └── 2026-04-18-methodology-archive-design.md   # This doc
    └── plans/                 # Implementation plans (future)
```

### 3.2 Data Flow

**Human path (dashboard user):**

```
index.html
  → loads dashboard/data/archetypes.json, mechanics.json, examples.json
  → user clicks through 6 stages (see §4)
  → Stage 5 assembles prompt string client-side
  → user copies to clipboard, pastes into Claude elsewhere
```

**Claude path (agent reading the archive):**

```
User prompt: "Use dt-site-creator for [X]"
  → Claude reads archetypes/README.md (decision matrix)
  → Claude picks archetype, reads that folder's 5 files
  → Claude reads mechanics/<slug>/ for any listed as `core` in mechanic-fit.md
  → Claude executes per the playbook
```

**Round-trip (Generate-Fresh button):**

```
User clicks ⚡ Generate fresh samples
  → Dashboard opens modal with pre-filled frontend-design prompt
  → User copies → pastes into Claude → Claude writes HTML files to dashboard/samples/custom/<slug>/
  → User git-pulls → dashboard auto-detects on next load via directory listing convention
```

## 4. Dashboard UX Flow (6 stages)

### Stage 1 — Hero & intent capture
- Fixed glass nav: `DT SITE CREATOR · ARCHETYPES · MECHANICS · PITFALLS · GALLERY · ABOUT`
- Hero prompt: *"What are you building?"* — free-text textarea + 3 quick-start chips (*"Marketing site" / "App that takes payments" / "Internal tool"*)
- CTA: `Find my archetype →` advances to Stage 2

### Stage 2 — Scoping wizard (4 multiple-choice questions)
1. *Who visits?* — public / customers / internal team / learners
2. *Do users give you money or data?* — no / yes-one-time / yes-recurring / yes-complex-escrow
3. *Is the core experience content, interaction, or a goal-to-win?* — content / interaction / goal
4. *Does it need a live data layer?* — no / yes-dashboard / yes-API

Each answer adds weighted points to each archetype (weights defined in `archetypes.json`). A live **match meter** updates per answer (inspired by `casket`'s price-comparison bar).

### Stage 3 — Archetype recommendations
- Top 1-3 archetypes rendered as cards, sorted by match %
- Each card shows: name, match %, 1-paragraph description, 2-3 thumbnail chips of past projects, CTA `Open playbook →`

### Stage 4 — Archetype detail page
Anchored sections on a single scrollable page:
- **What it is** (1 paragraph from `archetypes/<slug>/CLAUDE.md`'s header)
- **Past examples** — 4-6 cards linking to live sites + repo, pulled from `examples.json`
- **Default stack & rules** — rendered excerpt from `CLAUDE.md`
- **Mockup gallery** — 4-6 static mockups from `/dashboard/samples/<slug>/` + optional `/custom/` band; click → lightbox
- **Mechanic menu** — checklist of 9+ mechanics, rendered from `mechanics.json`. Each shows: icon, name, 1-line summary, fit label (`core`/`optional`/`rare`) pulled from the archetype's `mechanic-fit.md`. `core` pre-checked. `rare` hidden behind a "Show all 9" toggle.
- **⚠ Pitfalls to avoid** — horizontal scrolling strip of 3-4 top-severity pitfalls for this archetype, pulled from `pitfalls.md`

### Stage 5 — Assembled prompt output
- Large `<pre>` block with the assembled prompt (see §6 for templating)
- Secondary `<pre>` with the `context-pack.md` output (optional commit to project repo)
- Buttons: `[📋 Copy prompt]` (primary), `[📋 Copy context pack]`, `[⚡ Generate fresh samples]` (secondary)

### Stage 6 — Generate-fresh samples (optional)
- Modal pops up with pre-filled `frontend-design` prompt (content in §7.3)
- User copies, pastes to Claude externally
- Claude writes 4 HTML files to `/dashboard/samples/custom/<slug>/` AND appends an entry to `/dashboard/samples/custom/custom-index.json` (Claude is explicitly instructed to do both; this removes the need for server-side directory listing)
- On next page load, the dashboard fetches `custom-index.json` and renders a **"Your custom samples"** band in Stage 4's gallery

### Cross-cutting: Teaching Mode
- Toggle in top-right nav: `Teaching mode [off/on]`, persisted in `localStorage`
- When **on**, every stage renders an additional "Why this matters" callout explaining the vibe-coding lesson embedded in that stage (text-only at v1)
- **v1:** lesson text appears as an inline callout below each stage's main content
- **v1.5:** pitfall cards gain a 3D flip animation revealing the `lesson:` field on flip (upgrade path, not a v1 feature)
- No functional change when off — teaching content does not interfere with Derrick's fast path

### Session persistence
All selections (scoping answers, archetype choice, ticked mechanics, custom samples seen) saved to `localStorage` under key `dtsite:session:v1`. A `[↻ Start over]` button clears it.

## 5. Archetype Playbook Contract

Every `archetypes/<slug>/` folder contains **exactly 5 files**:

### 5.1 `CLAUDE.md` — the playbook
The full rules Claude should follow when building a site of this archetype. Includes:
- Tech stack (stricter per archetype — e.g., `transactional` mandates Supabase, `dashboard-analytics` allows Next.js + base-ui)
- Component library overrides
- Workflow rules (competitor research, admin panel, OG regeneration, immediate GitHub push)
- Links to applicable mechanics

v1 ships **thin** versions (headline rules + pointer to "deepening coming in v1.5"). `static-informational/CLAUDE.md` migrates the full current `dt-site-creator/CLAUDE.md` content.

### 5.2 `prompt.md` — the starter prompt
A ~30-50 line structured prompt with four placeholders the dashboard replaces:
- `{{project_description}}` — Stage 1 free-text
- `{{scoping_answers}}` — Stage 2 wizard summary
- `{{ticked_mechanics}}` — concatenated mechanic snippet-references
- `{{pitfalls_warnings}}` — bullet list of this archetype's top pitfalls

Ends with: *"Follow `archetypes/<slug>/CLAUDE.md` for all style decisions."*

### 5.3 `examples.md` — past-project matches
2-4 past projects with: name, live URL, repo URL, 1-paragraph why-it-matches, screenshot (filename in `/dashboard/samples/`), 2-3 mechanics used.

### 5.4 `mechanic-fit.md` — plug-in match table (human-readable summary)
Markdown table: `| Mechanic | Fit (core/optional/rare) | Notes |` covering all 9 v1 mechanics.

**Single source of truth:** the dashboard reads fit labels from each mechanic's `meta.json.fits[<archetype>]` — *not* from this file. `mechanic-fit.md` exists for humans skimming the archetype folder; it is generated from / kept in sync with the mechanics' `meta.json` files. If the two disagree, `meta.json` wins.

### 5.5 `pitfalls.md` — scar tissue
YAML-front-matter entries (parsed by the dashboard for the pitfalls wall). Schema:

```yaml
- id: paynow-wrong-amount
  title: "The $20 QR that says $200"
  severity: high               # low | medium | high | critical
  phase: building              # planning | building | shipping | live
  story: "1-3 sentence narrative, past-tense, concrete."
  source: "discounter, Apr 2026"
  fix: |
    Multi-line remediation steps.
  lesson: "Teaching-mode copy: the *why* behind the fix."
  mechanic: paynow-qr          # optional link to /mechanics/<slug>/
```

**Part 1 of every `pitfalls.md` file** repeats the same 4 universal pitfalls (not git-pushing, dark-mode defaulting, stale OG, skipping competitor research).
**Part 2** is archetype-specific: 5-7 entries per archetype at v1 seeding.

## 6. Mechanic Library Contract

Every `mechanics/<slug>/` folder contains **exactly 5 files**:

### 6.1 `meta.json` — dashboard-readable metadata

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
  "dependencies": ["qrcode-js-cdn"],
  "complexity": "medium",
  "past_uses": ["altru", "discounter"],
  "linked_pitfalls": ["paynow-wrong-amount"]
}
```

### 6.2 `snippet.html` — self-contained paste-in block
HTML + scoped CSS (`.mechanic-<slug>__<element>` BEM-ish classes) + JS IIFE. Includes CDN `<script>`/`<link>` tags for any dependencies. Designed to drop into any archetype page without conflict.

### 6.3 `README.md` — human explainer
Sections: *What it does*, *When to plug it in*, *Trade-offs*, *How to use (3 steps)*.

### 6.4 `example-use.md` — real past implementation
Screenshot + past-project link + actual diff/excerpt.

### 6.5 `preview.jpg` — dashboard card thumbnail
400×300. Screenshot for visual mechanics; stylized icon card for invisible ones (e.g., `og-social-meta`).

### v1 Mechanic Slate

| # | ID | Past Uses | Core for |
|---|---|---|---|
| 1 | `paynow-qr` | altru, discounter | Transactional |
| 2 | `localstorage-state` | elixcraft, ELIX-resume, dtws_works | Game, Simulator, Dashboard |
| 3 | `admin-auth-gate` | dtws_works, the-commons | All archetypes (optional) |
| 4 | `canvas-hero` | elixcraft, vectorsky, elitezaviation | Static, Game |
| 5 | `chartjs-dashboard` | eco-dashboard, elitez-csuite, market_tracker | Dashboard, Simulator |
| 6 | `pdf-pipeline` | market_tracker, studioelitez, quotation_preparer | Simulator, Transactional |
| 7 | `wizard-form` | wsg_jrplus, ELIX-resume, quotation_preparer | All |
| 8 | `multi-page-scaffold` | casket, altru, elitez-security | Static |
| 9 | `og-social-meta` | ~all sites | All (mandatory) |

**Deferred to v2:** `supabase-schema-boilerplate`, `gemini-extraction-pipeline`, `streamlit-scaffold`, `radar-chart-wizard`, `escrow-payment-flow`.

## 7. Prompt Assembly & Generate-Fresh Logic

### 7.1 Stage-5 assembly (pure client-side)

```javascript
// dashboard/js/assemble.js (pseudocode)
function assemblePrompt(archetype, scopingAnswers, tickedMechanics, userText) {
  let template = archetype.promptMd;   // loaded from archetypes/<slug>/prompt.md
  return template
    .replace("{{project_description}}", userText)
    .replace("{{scoping_answers}}", formatAnswers(scopingAnswers))
    .replace("{{ticked_mechanics}}",
      tickedMechanics.map(m => `### Mechanic: ${m.name}\nSee /mechanics/${m.id}/snippet.html`).join("\n\n"))
    .replace("{{pitfalls_warnings}}",
      archetype.pitfalls.filter(p => p.severity === "high" || p.severity === "critical")
        .map(p => `⚠ ${p.title} — ${p.story}`).join("\n"));
}
```

Output rendered into a `<pre>` with a copy-to-clipboard button. No server call.

### 7.2 Context-pack secondary output
A second `<pre>` renders a condensed 2-3 paragraph `CONTEXT.md` the user commits into the new project's repo root. Content: project description, archetype, chosen mechanics, palette direction, top 3 pitfalls to watch. This is the real 5× lever — every future Claude session on that project starts pre-contextualized.

### 7.3 Generate-Fresh modal content

```
Use the frontend-design skill to generate 4 mockup variants for:
- Archetype: {{archetype_name}}
- Project: "{{project_description}}"
- Mechanics: {{ticked_mechanics}}
- Constraint: match dt-site-creator's archetype rules (see archetypes/{{slug}}/CLAUDE.md)
- Output: 4 HTML files in dt-site-creator/dashboard/samples/custom/{{project_slug}}/
- Each variant explores a different palette direction (bold, muted, warm, cool)
- Update dt-site-creator/dashboard/samples/custom/custom-index.json to list them
```

User copies → pastes into a Claude Code session in `dt-site-creator/` → Claude generates → user commits → dashboard picks up on next load.

## 8. Pitfalls as a Visitor-Facing Feature

### 8.1 Top-level nav: `PITFALLS`
Dedicated page `/pitfalls.html` aggregating *all* archetype pitfalls into a filterable wall:
- Archetype chip filter
- Severity filter (Low / Medium / High / Critical)
- Phase filter (Planning / Building / Shipping / Live)

### 8.2 Pitfall card visual
Each pitfall is a visual card (amber `⚠` icon + severity label + archetype tag + title + italic story + source attribution + `Show the fix ▾` expandable + linked mechanic chip if applicable).

### 8.3 Teaching Mode: card flip
With Teaching Mode on, cards flip via CSS 3D transform (back side shows the `lesson:` copy — the *why*, not the *what*). This is the embedded class material.

### 8.4 Prompt injection
Stage-5 assembled prompt includes a `⚠️ AVOID these pitfalls` section so Claude actively steers around known failure modes.

### 8.5 v1 seeding
30-35 total pitfall entries across all 5 archetypes at v1 (5-7 archetype-specific + 4 universal, per archetype). Sourced from: Derrick's memory notes, survey agent findings, and this document's Section 3b drafts.

## 9. Staged Roadmap

### v1 — Breadth (ship target: this week)
- Dashboard shell wired through all 6 stages
- All 5 archetype folders with 5-file contract; `CLAUDE.md` thin except `static-informational` (migrates current content verbatim)
- 9 mechanics fully authored
- 30+ pitfalls seeded in YAML
- 4 static mockups per archetype (20 total, generated via frontend-design during implementation)
- GitHub Pages live, OG image, copy-buttons working
- Teaching Mode toggle stubbed (copy shows; card flip deferred)

### v1.5 — Top-2 archetype depth (next session)
- Full `CLAUDE.md` depth for Static-Informational and Transactional
- Card-flip animations live
- 6 mockups each for those two archetypes
- 5 new pitfalls each

### v2 — Remaining depth + polish (later session)
- Full `CLAUDE.md` depth for Simulator-Educational, Game, Dashboard-Analytics
- 4-6 mockups each
- Deferred mechanics added (supabase, gemini, streamlit, radar, escrow)
- Trainee session save/restore
- OPTIONAL: service-channel landing page for paid teaching

Each stage is independently shippable and dogfoodable.

## 10. Deployment & Ops

- **Repo:** `derrick-pixel/dt-site-creator` (exists; restructured)
- **Branch:** `main` → GitHub Pages root
- **URL:** `https://derrick-pixel.github.io/dt-site-creator/`
- **OG image:** regenerated once per stage (not per commit), 1200×630
- **State:** all client-side `localStorage` under `dtsite:session:v1`
- **Backward compat:** root `CLAUDE.md` stays as a shim with one line: *"See archetypes/static-informational/CLAUDE.md for static sites; see archetypes/README.md for other archetypes."*
- **Memory update:** after v1 ships, update `project_dt_site_creator.md` to reflect new structure (5 archetypes, 9 mechanics, pitfalls wall, dashboard URL)
- **Auto-commit per change** (per Derrick's standing feedback memory)

## 11. Testing & Verification

- Manual click-through of all 6 stages with 5 different Stage-1 inputs (one per archetype)
- Scoping wizard math: construct 5 answer sets, verify each lands on the expected archetype as top match
- Prompt assembly: paste the generated prompt into Claude, confirm it begins building correctly
- Generate-Fresh round-trip: run once end-to-end, confirm `/custom/` samples appear
- Mobile: hamburger nav works at 768px, cards stack at 640px
- Teaching Mode toggle: confirm all callouts appear/disappear cleanly
- OG image renders correctly on WhatsApp / iMessage / Twitter preview

## 12. Open Questions Resolved in Brainstorming

- **Archetype vs mechanic emphasis?** → Archetypes drive; mechanics plug in. (Q1)
- **Dashboard format?** → Literal interactive HTML page, GitHub Pages hosted. (Q2)
- **Sample gallery?** → Static pre-rendered + Generate-Fresh button for live variants. (Q3)
- **Scope?** → Staged rollout: v1 breadth, v1.5 top-2 depth, v2 remaining depth. (Q4)
- **Pitfalls visibility?** → Top-level nav page + per-archetype strip + prompt injection + Teaching Mode flip.

## 13. Success Criteria

**v1 is successful if:**
1. Derrick can start a new project in under 90 seconds of dashboard clicking.
2. The assembled prompt correctly boots Claude into archetype-appropriate work on the first paste.
3. A non-coder friend can open the dashboard and understand what vibe-coding *is* within 2 minutes.
4. At least 3 of Derrick's next 5 new projects actually start from this dashboard (dogfood metric).

**v1.5 is successful if:**
1. Teaching Mode is demo-ready enough that Derrick can walk a trainee through the Static-Informational archetype end-to-end in a 30-minute session.
2. The top-2 archetypes' `CLAUDE.md` depth enables Claude to produce work indistinguishable from the existing hand-crafted sites.

**v2 is successful if:**
1. All 5 archetypes are at full depth.
2. The dashboard is being used as a service channel (whether for paid training, friend onboarding, or Elitez internal kick-offs).

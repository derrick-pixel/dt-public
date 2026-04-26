# Elitez Pulse — Marketing Services Site Design

**Date:** 2026-04-22
**Owner:** Derrick Teo
**Source brief:** `Marketing as Revenue Generator .pdf` (Elitez marketing team deck)
**Repo target:** `github.com/derrick-pixel/elitez-pulse`
**Working dir:** `/Users/derrickteo/codings/Elitez-marketing-services/`

---

## 1. Context & Purpose

Elitez Group is converting its internal Marketing department from a **cost centre into a revenue business unit**. A $6,000 SGD/month internal retainer from Elitez HQ covers the baseline ($8,450/mo cost floor); external clients become pure upside. Target: $100K SGD GP by Dec 2027.

This project builds the public-facing product that sells that service — positioned as a **Micro-Agency** ($1.5K–$3.5K/mo retainers) above freelancer-risk and below premium-agency inaccessibility. Operating model: **geographic arbitrage** (SG sales presence + AI-augmented execution + MY operations).

**Target persona:** SME owners with 10–100 employees in B2B services, education, professional services, logistics, HR/consulting. They don't buy "marketing" — they buy ROI. Core question they ask: *"If I give you $X, can I make $10K+ back?"*

**Unit of sale:** Bundled Lead-Generation Systems, priced by outcome, not by line item. This escapes direct comparison with $500 freelancers.

---

## 2. Brand

- **Sub-brand name:** Elitez Pulse (chosen over Signal / Studio / Forge)
- **Metaphor:** Heartbeat of growth — cadence, rhythm, data-driven pulse
- **Parent tie-in:** "Part of Elitez Group" footer/pill; public does not hide the parent, but Pulse has its own voice
- **Logo:** Remix the existing Elitez mark (`ELI[✚person]EZ` orange + navy). The person-figure in the centre becomes a **coral pulse heartbeat** icon (ECG wave). Wordmark in Inter Black. Stored as `assets/logo-pulse.svg`, also generate mono and reverse-colour variants.

---

## 3. Scope (v1)

In scope for v1:
1. **Public marketing site** (6 pages)
2. **Marketing ROI Diagnostic** — interactive lead magnet with scored report
3. **Admin portal** (7 tabs, open access)
4. **Proposal PDF generator**
5. **All 4 template variants preserved** in admin Templates tab for future swap

Not in v1 (punted):
- Real backend, multi-user admin, email sending, real case studies (stub), custom domain setup (GitHub Pages default URL for launch), CardUp/payment integration.

---

## 4. Visual system — V1 Sticker Zine

**Palette:**
| Token | Hex | Use |
|---|---|---|
| `--ink` | `#1A1A1A` | Primary text, logo base |
| `--cream` | `#FEF3E7` | Page background |
| `--coral` | `#FF5B39` | Primary accent, CTAs, stickers |
| `--violet` | `#A78BFA` | Secondary accent, sticker variety |
| `--mustard` | `#FFD700` | Highlighter marks, emphasis |
| `--ink-soft` | `#2F2F2F` | Body text alt |

**Typography:** Inter — Black 900 (display), SemiBold 600 (subheads), Regular 400 (body). Self-hosted WOFF2 in `assets/fonts/`. Mono (JetBrains Mono or ui-mono fallback) for nav + caption micro-copy.

**Signature elements:**
- Rotated pill logo (-4° skew) at top-left of every page
- Highlighter-mark `.hl` (mustard block, 1° skew) for pricing anchors
- Scribble-underline `.scribble` (coral under-swipe, rotation) for verbs/emphasis
- Sticker badges — rotated rectangles with offset shadow, used for "NO CHURN", "★ SG+MY", "NEW ✦", "MOST POPULAR"
- Gradient blob in hero top-right (coral→violet radial, heavy blur, 55% opacity)

**Motion:** subtle sticker wobble on hover (±1° rotation, 200ms). No parallax. No video in hero v1.

**Theme system:** All tokens as CSS custom properties in `assets/theme.css`. The 4 template variants each have a theme file (`theme-sticker.css`, `theme-riso.css`, `theme-bubble.css`, `theme-neon.css`). Admin Templates tab swaps the active theme by re-linking the `<link rel="stylesheet">`.

---

## 5. Public site — 6 pages

### `/` (Homepage)
- Sticker-zine hero: "Lead gen but *actually fun*. From `$2K`/mo." with rotated pill logo, blob gradient, CTA stickers (`NO CHURN ✦`, `★ SG + MY`)
- Strip 1 — **The Micro-Agency Tier** — 3-col positioning grid: freelancer / us / premium agency
- Strip 2 — **5 Capabilities** — sticker cards for Social & Web Mgmt, Video, B2B Google Leads & SEO, Digital Content, Creative Outsourcing
- Strip 3 — **The Critical Insight** — "$10K+ ROI question" callout pulled verbatim from deck
- Strip 4 — **ROI Diagnostic CTA** — "Will this pay off for you? 2 minutes. →"
- Strip 5 — **Client logos** — placeholder strip seeded with internal Elitez brands
- Footer — Elitez Group tie-in, SG+MY addresses, social links

### `/services.html`
Each of the 5 capabilities gets its own section: description, what it drives, sample deliverables, mustard-highlighted KPI anchors ("+342% leads/mo", "$47 cost/lead", "6 wk payback").

### `/pricing.html`
Three tier cards side-by-side. Entry / **Core (coral "MOST POPULAR" sticker)** / Premium. Each shows price band, bullet list from deck, "Book a call" CTA. Add-ons strip below: extra videos $150–300, website build $2K–5K, ads mgmt $500–1.5K.

### `/work.html`
Empty-state: placeholder "CASE STUDIES DROPPING Q3 2026 ✦" rotating sticker + "While we build our external track record — here's what we've done internally" with 2-3 Elitez Group case stubs. CTA: book a call.

### `/about.html`
**Geographic Arbitrage Engine** narrative: SG sales node + AI efficiency layer + MY operations node (3-node diagram restyled sticker-flat from deck). Team intro (Derrick as principal sponsor + Elitez marketing leads). Elitez Group pedigree.

### `/contact.html`
Simple form: name, company, email, message. Writes to `localStorage.leads` with `source: "contact"`. Admin picks up on refresh.

---

## 6. ROI Diagnostic funnel — `/diagnostic.html`

**Single-page, 10-step client-side flow:**

1. Landing — "Will marketing pay off for you? 2 min · you'll get a scored report"
2. **Q1** — Industry (chips, single): B2B Services / Education / Professional Services / Logistics / HR-Consulting / Other
3. **Q2** — Headcount (chips, single): <10 / 10–30 / 30–60 / 60–100 / >100
4. **Q3** — Current marketing spend/mo (slider): $0 / $500 / $1.5K / $3K / $5K+
5. **Q4** — Biggest pain (chips, multi): No consistent leads / Content feels generic / Website dead / No team capacity / No clue what's working
6. **Q5** — Primary goal next 6mo (chips, single): More qualified leads / Better brand+website / Launch campaigns faster / Cut costs
7. **Q6** — Deal size ACV (chips, single): <$1K / $1K–5K / $5K–25K / $25K+
8. **Q7** — Urgency (chips, single): Yesterday / This month / This quarter / Just exploring
9. **Gate** — "Drop your email to unlock your report": name + email + company (all required)
10. **Report** (see below)

**Scoring:** each answer carries configurable weights (editable via admin Insights tab) that feed two outputs:
- `score` (0–100) — overall fit
- `packageReco` — Entry / Core / Premium, auto-picked from Q2 × Q3 × Q6

**Fit-honesty rule:** if headcount <10 AND spend <$500 AND deal size <$1K → downshift score and display *"We're honest: you're probably better served by a $500 freelancer right now."* This matches the deck's "positioning above risk" principle — protects the brand from wasted leads.

**Report output:**
- Coloured **ROI Score ring** (sticker-zine style): coral=low / mustard=medium / violet=high fit
- **Break-even line** — computed from Q3 (current spend) + Q6 (deal size): "You need ~X new deals/mo to cover us. Based on your industry: [realistic / stretch / unrealistic]."
- **Recommended package** card with "Most SMEs like you pick **Core** ✦" sticker + price range + top 3 deliverables
- **Top 3 capabilities for you** — ordered from the 5, weighted by Q4+Q5
- **3 benchmark stats** — editable from admin Insights tab (e.g. median leads/mo, cost/lead, payback weeks)
- **Big CTA** — `Book the 20-min deep-dive →` linking to Contact or Cal.com
- **"Email me this report"** button — client-side `jsPDF` generates a branded PDF download (no server email)

**Data persistence:** submission lands in `localStorage.leads` as `{ id, ts, answers, score, package, contact, source: "diagnostic" }`.

---

## 7. Admin portal — `/admin/*` (open access for v1)

**Auth:** none for v1. The admin URL is not linked from public pages (security through obscurity). All sensitive data lives in browser localStorage — no server-side exposure exists. A password gate can be bolted on later via a Settings toggle.

**Layout:** fixed left-rail (sticker-zine calmed — fewer blobs, less saturated bg) with 7 tabs. Main area renders active tab content.

### Tab 1 — Leads & Pipeline
- Table from `localStorage.leads`: Date · Name · Company · Email · Score · Rec'd Package · Stage · Source · Notes
- Stage enum: `New → Qualified → Proposed → Won → Lost`
- Row click → drawer: full diagnostic answers, stage history (append-only), notes textarea, `Generate proposal →` button → `/admin/proposal.html?leadId=…`
- Top strip: count per stage + estimated potential GP

### Tab 2 — Commission Calculator
- Inputs: rep name, monthly revenue closed (auto-summed from Won leads this month, editable)
- Live tiered calc per deck table (20%/22%/25% × brackets), upsell +3%, monthly bonus ($300 at ≥$8K, $800 at ≥$13K)
- Per-rep history — Chart.js bar chart of last 6 months

### Tab 3 — Pricing Packages
- 3 editable cards (Entry/Core/Premium): price range, included bullets, delivery cadence
- Add-ons list editable
- Persists to `localStorage.pkgOverride`; `Download JSON` exports to replace `data/packages.json` when you want it permanent
- `Preview on /pricing.html →` link

### Tab 4 — Competitor Intel
- Editable grid, seeded with 12 real SG/MY competitors (research at build time). Columns: Competitor · Tier · SG/MY · Typical price · Our advantage · Our gap · Pricing grade A–F
- Battle-card drawer per competitor: positioning, likely objections, our reply

### Tab 5 — Insights
- Accordion reference library: deck's mental models ($10K ROI question, positioning above risk, unit of sale, messy middle) + any talk-track additions
- **Diagnostic weights editor** — sliders that directly affect `/diagnostic.html` scoring (persisted to localStorage, downloadable as JSON)
- **Benchmark stats editor** — the three numbers shown in Diagnostic report

### Tab 6 — Templates
- 4-variant gallery: Sticker Zine / Risograph / Bubblegum / Neon. Each is an iframe mini-preview at 50% scale
- Metadata per card (palette, fonts, vibe tags)
- `[Preview full]` opens a dedicated `/admin/template-preview.html?v=X`
- `[Set as active]` swaps the active theme CSS — refresh public pages to see change
- **Palette editor** for the active theme: hex inputs live-reflect in a mini-mock. Exports as JSON.

### Tab 7 — Settings
- Company info (SG + MY addresses, contact emails, social links)
- Export all data as JSON backup
- Export Diagnostic responses as CSV
- Future: password gate toggle

---

## 8. Proposal PDF generator — `/admin/proposal.html`

- Prefilled from `?leadId=…`: name, company, recommended package, diagnostic answers
- Form fields: client name + company, proposal date, project summary (auto-drafted from diagnostic pains+goals, editable), package selector (Entry/Core/Premium + add-ons checklist), monthly fee, one-off setup fee, term (3/6/12 months), rep name
- **Live sticker-zine preview** on the right as you type (same pattern as `studioelitez_quotation_preparer`)
- `Generate PDF →` renders the preview via `html2canvas` + `jsPDF`. 5–6 pages:
  1. Cover — sticker-zine brand, client name, date
  2. The problem & the goal (from diagnostic)
  3. Proposed solution — 5 capabilities tailored
  4. Deliverables & timeline
  5. Pricing breakdown (monthly + setup + add-ons)
  6. Sign-off + next steps
- Form state saved to `localStorage.proposals[leadId]` for re-open/edit

---

## 9. Tech stack

- **No framework** — vanilla JS (ES2022 modules), per-page entry points
- **CSS** — custom properties theme system; per-template theme file; BEM-ish naming (`.hero__title`, `.sticker--coral`)
- **Libraries** (CDN with SRI, or vendored):
  - Chart.js (commission bars, pipeline summary)
  - html2canvas + jsPDF (Diagnostic report + Proposal PDF)
- **Fonts** — Inter self-hosted WOFF2 + fallback stack; mono fallback `ui-monospace, "JetBrains Mono", Menlo`
- **Favicon + OG** — Python PIL script (mirrors dt-site-creator pattern): coral pulse heartbeat on cream, 9 favicon files + `og-1200x630.png`
- **Cache-bust** — JS includes use `?v=N` query strings (lesson from jrplus)
- **Linkcheck** — port `scripts/linkcheck.py` from dt-site-creator; runs on push via GitHub Actions
- **JS hygiene** — `node --check` every JS file pre-commit (jrplus lesson)

---

## 10. Data model

### Seed files (committed, read-only at runtime, admin produces overrides)
```
data/packages.json       — 3 tiers with price ranges + bullets
data/capabilities.json   — 5 capabilities with copy + icons
data/competitors.json    — 12 SG/MY competitors (researched)
data/insights.json       — mental models + diagnostic weights + benchmark stats
data/templates.json      — 4 variants metadata
data/company.json        — SG + MY addresses, contact
```

### localStorage keys (runtime, per-browser)
```
ep_leads              — array of lead objects
ep_proposals          — { leadId: proposalFormState }
ep_pkgOverride        — override of packages.json
ep_competitorsOverride
ep_insightsOverride
ep_activeTheme        — "sticker" | "riso" | "bubble" | "neon"
ep_settings           — company info override
```

Admin "Download JSON" exports overrides so they can be committed manually into repo seeds when permanent.

---

## 11. Repository & hosting

- **Repo:** `github.com/derrick-pixel/elitez-pulse` (public, no explicit license for v1 — all-rights-reserved by default)
- **GitHub Pages:** serves from `main` root
- **Launch URL:** `https://derrick-pixel.github.io/elitez-pulse/`
- **Custom domain (future):** `pulse.elitez.asia` — CNAME record + `CNAME` file in repo (not blocking v1)
- **Branch model:** work on `main` directly (solo dev, matches existing pattern)
- **Commits:** per feedback rule, commit + push after every change once GitHub remote is live

### `.gitignore`
```
.DS_Store
.superpowers/
*.log
.env
.env.local
node_modules/
__pycache__/
*.pyc
```

---

## 12. File/folder layout

```
/
├── index.html
├── services.html
├── pricing.html
├── work.html
├── about.html
├── contact.html
├── diagnostic.html
├── CNAME                  (added when custom domain goes live)
├── README.md
│
├── admin/
│   ├── index.html         (tab router)
│   ├── proposal.html
│   ├── template-preview.html
│   └── js/                (per-tab modules)
│
├── assets/
│   ├── theme.css          (active theme CSS custom properties)
│   ├── theme-sticker.css
│   ├── theme-riso.css
│   ├── theme-bubble.css
│   ├── theme-neon.css
│   ├── base.css           (layout primitives, Inter font-face)
│   ├── components.css     (stickers, highlighters, blobs, cards)
│   ├── fonts/             (Inter WOFF2)
│   ├── logo-pulse.svg
│   ├── logo-pulse-mono.svg
│   ├── favicon/           (9 files)
│   └── og-1200x630.png
│
├── js/
│   ├── common.js          (nav, theme loader, util)
│   ├── diagnostic.js
│   ├── contact.js
│   └── admin/             (tab modules)
│
├── data/
│   └── *.json             (seeds above)
│
├── scripts/
│   ├── generate-favicon.py
│   ├── generate-og.py
│   └── linkcheck.py
│
├── docs/
│   └── superpowers/
│       └── specs/
│           └── 2026-04-22-elitez-pulse-design.md
│
└── .github/workflows/linkcheck.yml
```

---

## 13. What's explicitly out of scope (v1)

- Real backend / database (all localStorage + JSON seeds)
- Multi-user admin with roles
- Server-side email (lead notifications → admin sees on next open)
- Real case studies (stubs only)
- CardUp/payment integration
- Password-gated admin (open for v1)
- Custom domain DNS (launch on GitHub Pages URL)
- CRM sync (Leads stay in localStorage; manual export to CSV)

---

## 14. Success criteria

- Pulse public pages pass HTML/CSS/JS lint + linkcheck CI
- Diagnostic produces coherent, sensible recommendations on all 7-question permutation classes
- Admin Leads tab ingests Diagnostic + Contact submissions without data loss across page reloads
- Proposal PDF renders cleanly at A4 and prints on actual paper (no overflow, all stickers render)
- All 4 template variants swap correctly from Templates tab without requiring a rebuild
- Site looks visually distinct from any prior Derrick site (sticker-zine vs. existing dark/cyan palette) — memory feedback rule

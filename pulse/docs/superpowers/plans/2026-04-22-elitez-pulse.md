# Elitez Pulse Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a public marketing site + interactive ROI Diagnostic + admin portal + proposal PDF generator for Elitez Pulse, styled as V1 Sticker Zine, to `github.com/derrick-pixel/elitez-pulse` on GitHub Pages.

**Architecture:** Vanilla HTML/CSS/JS static site. No framework. Shared nav/footer injected via `common.js`. CSS custom-property theme system lets admin swap between 4 visual variants. All dynamic state lives in `localStorage`; JSON seeds in `data/` ship read-only. Chart.js + html2canvas + jsPDF for charts and PDF export.

**Tech Stack:**
- HTML5, CSS3 (custom properties), ES2022 JavaScript modules
- Node.js built-in test runner for pure logic (`node --test`)
- Chart.js 4, html2canvas 1.4, jsPDF 2.5 (CDN with SRI)
- Inter (self-hosted WOFF2), monospace fallback
- Python 3 + Pillow for favicon/OG generation
- GitHub Pages hosting, GitHub Actions for linkcheck CI

**Reference spec:** `docs/superpowers/specs/2026-04-22-elitez-pulse-design.md`

**XSS hygiene note:** The admin portal renders lead-submitted strings (name, company, message, diagnostic answers). **All user-controlled strings MUST pass through an HTML-escaping helper before injection into markup.** Define `esc(s)` in a shared util (see Task 12) and use it consistently. Treat seeds in `data/*.json` as trusted. Treat anything from `localStorage.ep_leads` or form submissions as untrusted.

---

## File Structure

```
elitez-pulse/
├── index.html                         (homepage)
├── services.html                      (5 capabilities)
├── pricing.html                       (3 tiers + add-ons)
├── work.html                          (case study stubs)
├── about.html                         (geographic arbitrage story)
├── contact.html                       (lead form)
├── diagnostic.html                    (ROI quiz)
├── README.md
│
├── admin/
│   ├── index.html                     (tab router shell)
│   ├── proposal.html                  (PDF generator)
│   └── template-preview.html          (full-screen variant preview)
│
├── assets/
│   ├── base.css                       (reset + @font-face + layout primitives)
│   ├── theme.css                      (imports theme-sticker.css)
│   ├── theme-sticker.css              (V1 active)
│   ├── theme-riso.css                 (V2)
│   ├── theme-bubble.css               (V3)
│   ├── theme-neon.css                 (V4)
│   ├── components.css                 (stickers, highlighters, nav, cards, footer)
│   ├── admin.css                      (rail, tables, drawers)
│   ├── fonts/                         (Inter-Regular, Inter-SemiBold, Inter-Black WOFF2)
│   ├── logo-pulse.svg                 (primary)
│   ├── logo-pulse-mono.svg            (single colour)
│   ├── favicon/                       (10 generated files)
│   └── og-1200x630.png
│
├── js/
│   ├── common.js                      (nav+footer inject, theme loader, esc helper)
│   ├── diagnostic.js                  (quiz state machine, report render, PDF)
│   ├── diagnostic-scoring.js          (pure scoring fn — unit tested)
│   ├── contact.js                     (form → localStorage)
│   └── admin/
│       ├── shell.js                   (tab router)
│       ├── leads.js
│       ├── commission.js              (computeCommission + tab render)
│       ├── packages.js
│       ├── competitors.js
│       ├── insights.js
│       ├── templates.js
│       ├── settings.js
│       └── proposal.js
│
├── data/
│   ├── packages.json
│   ├── capabilities.json
│   ├── competitors.json
│   ├── insights.json
│   ├── templates.json
│   └── company.json
│
├── scripts/
│   ├── generate-favicon.py
│   ├── generate-og.py
│   └── linkcheck.py
│
├── tests/
│   ├── diagnostic-scoring.test.mjs
│   └── commission.test.mjs
│
├── .github/workflows/linkcheck.yml
├── .gitignore                         (already exists)
└── docs/                              (already exists — spec + this plan)
```

---

## Phase 0 — Repo bootstrap & GitHub Pages

### Task 1: Create GitHub remote + enable Pages

**Files:** none

- [ ] **Step 1: Confirm local git state**

```bash
cd /Users/derrickteo/codings/Elitez-marketing-services && git log --oneline
```

Expected: single commit `75a3654 Add Elitez Pulse design spec`.

- [ ] **Step 2: Ask user to authorise `gh repo create`**

Running `gh repo create` publishes a repo under `derrick-pixel/`. **Confirm with user before executing.** Then run:

```bash
gh repo create derrick-pixel/elitez-pulse --public --source=. --description "Elitez Pulse — marketing services by Elitez Group" --remote=origin
```

- [ ] **Step 3: Push main**

```bash
git push -u origin main
```

- [ ] **Step 4: Enable Pages from main root**

```bash
gh api -X POST repos/derrick-pixel/elitez-pulse/pages -f "source[branch]=main" -f "source[path]=/"
```

- [ ] **Step 5: Verify Pages URL resolves (DNS only; site still empty)**

```bash
sleep 60 && curl -sI https://derrick-pixel.github.io/elitez-pulse/ | head -3
```

Expected: `HTTP/2` response (may 404 with empty body).

---

## Phase 1 — Foundation assets

### Task 2: Theme tokens + base CSS

**Files:**
- Create: `assets/base.css`
- Create: `assets/theme.css`
- Create: `assets/theme-sticker.css`

- [ ] **Step 1: Write `assets/theme-sticker.css` with CSS custom properties**

Token set: `--ink: #1A1A1A`, `--ink-soft: #2F2F2F`, `--cream: #FEF3E7`, `--coral: #FF5B39`, `--violet: #A78BFA`, `--mustard: #FFD700`, `--white: #FFFFFF`. Font tokens: `--font-display`, `--font-body` both Inter, `--font-mono` ui-monospace / JetBrains Mono / Menlo. Radii: `--radius-sm: 8px`, `--radius-md: 12px`, `--radius-lg: 18px`, `--radius-pill: 999px`. Shadows: `--shadow-sticker: 4px 4px 0 rgba(0,0,0,0.15)`, `--shadow-card: 0 4px 12px rgba(26,26,26,0.08)`. Layout: `--nav-h: 72px`, `--max-w: 1200px`, `--gutter: 24px`. All under `:root { ... }`.

- [ ] **Step 2: Write `assets/theme.css` — thin re-export**

One line: `@import url("theme-sticker.css");`. Admin Templates tab swaps this import by re-linking the stylesheet at runtime.

- [ ] **Step 3: Write `assets/base.css`**

Contains: three `@font-face` declarations for Inter (Regular 400, SemiBold 600, Black 900) sourced from `fonts/*.woff2` with `font-display: swap`. Global reset (`*, *::before, *::after { box-sizing: border-box; }`, zero margins/padding on html+body). Body uses `var(--font-body)`, `var(--cream)` bg, `var(--ink)` text, antialiased. Heading scale: `h1` clamp(44px, 6vw, 72px) / `h2` clamp(32px, 4vw, 48px) / `h3` 24px / `h4` 18px, all weight 900 except h4 600, letter-spacing `-0.035em`. Utilities: `.container` (max-width + padding), `.section` (80px vertical), `.subtle` (opacity 0.7), `.mono` (mono font, 0.85em).

- [ ] **Step 4: Commit**

```bash
git add assets/base.css assets/theme.css assets/theme-sticker.css
git commit -m "Add base CSS and V1 Sticker Zine theme tokens"
git push
```

---

### Task 3: Components CSS — nav, hero, stickers, cards, footer

**Files:**
- Create: `assets/components.css`

- [ ] **Step 1: Define component classes using only the tokens from Task 2**

Components to include:

**Nav** (`.nav`, `.nav__logo`, `.nav__links`, `.nav__cta`): fixed height `var(--nav-h)`, logo is a rotated coral pill (`-4deg`) with `PULSE ★` text, links in SemiBold 14px, CTA is a black pill with white text.

**Hero** (`.hero`, `.hero__blob`, `.hero__inner`, `.hero__title`, `.hero__sub`, `.hero__ctas`): 60px top padding, 100px bottom. Blob is a 480px radial-gradient circle (violet→coral) with 80px blur at 55% opacity, positioned top-right, behind content. Title clamps 52–84px, weight 900, tracking -0.04em. CTAs flex-wrap with 16px gap.

**Stickers** (`.sticker`, `.sticker--coral`, `.sticker--ink`, `.sticker--violet`, `.sticker--mustard`): pill 10×14px with box-shadow-sticker, weight 800, 12px, uppercase, letter-spacing 0.04em. Each colour variant has a distinct rotation (−5° / +7° / −3° / +4°). Hover straightens to 0° and scales 1.04. Include `.hl` (mustard highlighter block, −1° skew) and `.scribble` (inline container with a `::after` coral swipe).

**Buttons** (`.btn`, `.btn--primary`, `.btn--coral`, `.btn--outline`): pill, 14×24px, weight 700, 15px. Primary is ink+white; coral is coral+white; outline is 2px ink border. Primary hover translates `-2px`.

**Cards** (`.card`, `.card--coral`, `.card--violet`, `.card--mustard`): 2px ink border, radius `var(--radius-lg)`, 28px padding, `var(--shadow-sticker)`. Hover translates `(-2px, -2px)` with a darker offset shadow. Coloured variants swap bg.

**Grid** (`.grid`, `.grid--3`, `.grid--5`): gap 24px / 16px; collapses to single column below 900px.

**Footer** (`.footer`, `.footer__grid`, `.footer__bottom`, `.footer__parent`): ink bg, cream text, 60px top / 28px bottom. 2fr-1fr-1fr-1fr grid collapsing to 2-col below 900px. Bottom strip separated by 1px white/10% border. Parent pill has soft white/8% bg with rounded pill shape.

- [ ] **Step 2: Commit**

```bash
git add assets/components.css
git commit -m "Add shared UI components CSS"
git push
```

---

### Task 4: Download + commit Inter WOFF2

**Files:**
- Create: `assets/fonts/Inter-Regular.woff2`
- Create: `assets/fonts/Inter-SemiBold.woff2`
- Create: `assets/fonts/Inter-Black.woff2`

- [ ] **Step 1: Download Inter release + extract the three weights**

```bash
cd /tmp && curl -sL -o inter.zip https://rsms.me/inter/download/?family=Inter && unzip -oq inter.zip -d inter-extract
find /tmp/inter-extract -name "Inter-Regular.woff2" -o -name "Inter-SemiBold.woff2" -o -name "Inter-Black.woff2"
```

- [ ] **Step 2: Copy into repo**

```bash
cd /Users/derrickteo/codings/Elitez-marketing-services
find /tmp/inter-extract -name "Inter-Regular.woff2" -exec cp {} assets/fonts/ \;
find /tmp/inter-extract -name "Inter-SemiBold.woff2" -exec cp {} assets/fonts/ \;
find /tmp/inter-extract -name "Inter-Black.woff2" -exec cp {} assets/fonts/ \;
ls -la assets/fonts/
```

Expected: 3 woff2 files present.

- [ ] **Step 3: If rsms.me download returns 0 bytes, fall back to Google Fonts CDN**

Replace the three `@font-face` rules in `assets/base.css` with:

```css
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600;900&display=swap");
```

- [ ] **Step 4: Commit**

```bash
git add assets/fonts/ assets/base.css
git commit -m "Add Inter font WOFF2 self-hosted"
git push
```

---

### Task 5: Pulse logo SVGs

**Files:**
- Create: `assets/logo-pulse.svg`
- Create: `assets/logo-pulse-mono.svg`

- [ ] **Step 1: Write `assets/logo-pulse.svg`**

240×60 viewBox. Render "ELI" text left + "EZ" text right (Inter Black, 44px, navy `#0F3C5F`, letter-spacing -2). Between them, draw a coral (`#FF5B39`) ECG polyline with round caps + joins, 3px stroke: points roughly `(88,32)(100,32)(106,18)(112,46)(118,10)(126,48)(132,32)(152,32)`. Below the wordmark, subline text "PULSE · BY ELITEZ GROUP" in Inter SemiBold 10px letter-spacing 3px.

- [ ] **Step 2: Write `assets/logo-pulse-mono.svg`**

Same shapes; replace both fills/strokes with `currentColor` so it inherits from context. Omit the subline.

- [ ] **Step 3: Commit**

```bash
git add assets/logo-pulse.svg assets/logo-pulse-mono.svg
git commit -m "Add Elitez Pulse logo SVGs (color + mono)"
git push
```

---

### Task 6: Favicon + OG generators

**Files:**
- Create: `scripts/generate-favicon.py`
- Create: `scripts/generate-og.py`
- Create: `assets/favicon/*` (10 files after running)
- Create: `assets/og-1200x630.png`

- [ ] **Step 1: Write `scripts/generate-favicon.py`**

Uses PIL. Defines `draw_mark(size)` returning an RGBA Image with: cream fill, rounded-rect ink tile (size/10 padding, size/6 radius), then a coral ECG polyline across the centre with points scaled by the size. Outputs PNGs at 16/32/48/64/128/180/192/256/512 + combined `favicon.ico` (16/32/48).

- [ ] **Step 2: Write `scripts/generate-og.py`**

1200×630 cream canvas. Render a translucent coral ellipse (top-right, soft). Draw a rotated coral pill with "PULSE ★" at (80, 70). Headline "Lead gen but" in Inter-Black 108px ink. Beneath it, a mustard highlighter rectangle and "actually fun." text overlaid (also Inter-Black 108px). Sub-lines: "Bundled marketing retainers for SMEs." (SemiBold 34px), "From SGD 2,000 / month · Singapore + Malaysia" (Regular 24px), "elitez-pulse · part of Elitez Group" (Regular 24px). Load Inter from `assets/fonts/` with a default-font fallback inside try/except.

- [ ] **Step 3: Run both**

```bash
cd /Users/derrickteo/codings/Elitez-marketing-services
python3 -m pip install --quiet Pillow 2>&1 | tail -2
python3 scripts/generate-favicon.py
python3 scripts/generate-og.py
ls assets/favicon/ && ls -la assets/og-1200x630.png
```

Expected: 10 favicon files, OG ~40–80KB.

- [ ] **Step 4: Commit**

```bash
git add scripts/ assets/favicon/ assets/og-1200x630.png
git commit -m "Add favicon + OG generators and outputs"
git push
```

---

## Phase 2 — JSON data seeds

### Task 7: `data/company.json`

**Files:** Create `data/company.json`

- [ ] **Step 1: Write JSON**

Fields: `name: "Elitez Pulse"`, `parent: "Elitez Group"`, `tagline: "Lead gen but actually fun."`, `contactEmail: "pulse@elitez.asia"`, `phone: "+65 6931 9031"` (confirm with user), `offices: [{city: "Singapore", address: "Elitez HQ, Singapore (address TBC)", type: "HQ"}, {city: "Kuala Lumpur", address: "Elitez MY Ops (address TBC)", type: "Operations"}]`, `social: {linkedin: "https://www.linkedin.com/company/elitez-group/", instagram: "", tiktok: ""}`.

- [ ] **Step 2: Validate + commit**

```bash
python3 -m json.tool data/company.json > /dev/null && echo OK
git add data/company.json && git commit -m "Seed company.json" && git push
```

---

### Task 8: `data/packages.json`

**Files:** Create `data/packages.json`

- [ ] **Step 1: Write JSON** — 3 tiers from deck, structure below

Top level: `{ tiers: [...], addOns: [...] }`. Each tier has: `id`, `name`, `tagline`, `priceFrom`, `priceTo`, `currency: "SGD"`, `cadence: "per month"`, `popular` (true only for core), `features` (array of strings from deck), `cta` (string). Values:
- **Entry** (id `entry`, 1000–1500, popular false, tagline "Basic needs of a marketing function"): "8–12 social posts" / "1 short-form video" / "Basic graphics" / "Captions + scheduling" / "Website updates & management" / "10 hours Graphic Design retainer / month". CTA "Start with Entry".
- **Core** (id `core`, 2000–3000, popular **true**, tagline "Growth Engine — the anchor package"): "12–20 social posts" / "4 short-form videos" / "Basic engagement & DMs" / "Design retainer (20 hrs/mo)" / "Website updates & management" / "On-page SEO (+ $500 if SEM mgmt)". CTA "Pick Core".
- **Premium** (id `premium`, 3500–4500, tagline "Content + Leads — full funnel"): "12–20 social posts" / "8 short-form videos" / "Lead funnel setup" / "Google SEM Ads management + on-page SEO" / "Website updates & management" / "Design retainer (100 hrs/mo)". CTA "Go Premium".

`addOns`: three entries — `{name: "Extra videos", priceFrom: 150, priceTo: 300, unit: "per video"}`, `{name: "Website build", priceFrom: 2000, priceTo: 5000, unit: "one-off"}`, `{name: "Ads management", priceFrom: 500, priceTo: 1500, unit: "per month"}`.

- [ ] **Step 2: Validate + commit**

```bash
python3 -m json.tool data/packages.json > /dev/null && echo OK
git add data/packages.json && git commit -m "Seed packages.json" && git push
```

---

### Task 9: `data/capabilities.json`

**Files:** Create `data/capabilities.json`

- [ ] **Step 1: Write JSON** — 5 capabilities under a `capabilities: [...]` key

Each entry: `id`, `name`, `tagline`, `sticker` (maps to CSS variant: mustard/coral/violet/ink), `description`, `deliverables` (array of 3), `kpi` (string).

1. `social-web` · Social & Web Management · "We run your feeds so they don't run you." · sticker mustard · "Posting, scheduling, DM automation, basic engagement. The always-on machinery that keeps the brand alive while you sleep." · ["Weekly post calendar", "DM auto-replies", "Community mod"] · "Posts shipped: 12–20/mo"
2. `video` · Video Content Creation · "Batch-shot, TikTok-ready." · sticker coral · "Monthly batch shoots; short-form editing for TikTok, Reels, and Shorts. One shoot day, a month of content." · ["1 batch shoot day", "4–8 vertical cuts", "Captions + hooks"] · "Videos: 4–8 / mo"
3. `leads` · B2B Google Leads & SEO · "Show up where SMEs search." · sticker violet · "Funnel setup, keyword study, landing pages, SEM ads. Pipeline, not impressions." · ["Keyword audit", "Landing page build", "Meta + Google ads"] · "Qualified leads / month"
4. `digital` · Digital Content · "Graphics that convert, copy that sells." · sticker ink · "High-conversion copywriting, graphics, brand consistency — across your site, decks, and social." · ["Post graphics", "Landing copy", "Brand consistency audit"] · "Conversion rate lift"
5. `creative` · Creative Outsourcing · "Execution at scale." · sticker coral · "Presentations, ad creatives, brochures — your on-tap creative bench when internal capacity is gone." · ["Pitch decks", "Ad creatives", "Brochures / one-pagers"] · "Assets delivered / mo"

- [ ] **Step 2: Validate + commit**

```bash
python3 -m json.tool data/capabilities.json > /dev/null && echo OK
git add data/capabilities.json && git commit -m "Seed 5 capabilities" && git push
```

---

### Task 10: `data/competitors.json` (research 12 real SG/MY competitors)

**Files:** Create `data/competitors.json`

- [ ] **Step 1: Research candidates with WebSearch**

For each of the 12 names below, verify via WebSearch that the homepage resolves. Drop any dead entry and substitute another (additional candidates: iPrice Marketing, The Marketing Store MY, SEEK Asia Marketing, MediaOne Asia). Required fields per competitor: `name`, `site`, `country` (SG / MY / SG+MY / Global), `tier` (freelancer / micro / smb / mid / premium), `typicalPrice`, `grade` (A–F), `ourAdvantage`, `ourGap`, `positioning`, `battlecard`.

**Seed candidates:**
1. Mutant Communications · sg · premium · grade A
2. Construct Digital · sg · smb · grade B
3. Verz Design · sg · smb · grade B
4. 2Stallions · sg+my · mid · grade A (closest head-to-head)
5. iFoundries · sg · smb · grade B
6. Locomote Digital · my · mid · grade B
7. MediaOne Marketing · sg · mid · grade C (SEO-heavy)
8. Fiverr Pro / Upwork · global · freelancer · grade D
9. Freelance Singapore · sg · freelancer · grade D
10. Naga DDB Tribal · my · premium · grade A (enterprise-only; reference)
11. GoDigital Academy · sg · micro · grade C
12. Click Academy · sg · micro · grade B

Battle-card flavour for each: how to reframe the prospect's comparison in our favour. Keep copy tight (≤ 2 sentences per field).

- [ ] **Step 2: Write `data/competitors.json` with `{ competitors: [...] }` shape**

- [ ] **Step 3: Validate + commit**

```bash
python3 -m json.tool data/competitors.json > /dev/null && echo OK
git add data/competitors.json && git commit -m "Seed 12 SG/MY competitor battle-cards" && git push
```

---

### Task 11: `data/insights.json` + `data/templates.json`

**Files:**
- Create: `data/insights.json`
- Create: `data/templates.json`

- [ ] **Step 1: `data/insights.json`** keys:
- `mentalModels: [5 entries]` — each `{title, body}`. Titles: "The $10K ROI Question", "Position Above Risk", "Unit of Sale = Outcome, Not Line Item", "The Messy Middle", "Geographic Arbitrage Engine". Body 2–3 sentences each, paraphrased from deck.
- `benchmarkStats: [3 entries]` — `{label, value}`. Seed: "Median leads/month (Core)": "47", "Cost per lead": "SGD 42", "Payback period": "6–9 weeks". Admin makes these editable.
- `scoringWeights`: object keyed by question id (`industry`, `headcount`, `spend`, `dealSize`, `urgency`), each mapping answer values → integer weights that **MUST sum to 100 at maximum** when perfect-fit answers selected. Suggested values:
  - industry: B2B Services 25, Education 20, Professional Services 22, Logistics 18, HR-Consulting 20, Other 10
  - headcount: <10 5, 10-30 18, 30-60 25, 60-100 22, >100 12
  - spend: "0" 4, "500" 10, "1500" 20, "3000" 24, "5000+" 20
  - dealSize: <1K 5, 1K-5K 15, 5K-25K 25, 25K+ 20
  - urgency: Yesterday 10, "This month" 8, "This quarter" 5, "Just exploring" 2
- `packageThresholds`: `{premium: {minSpend: 3000, minDealSize: 5000}, core: {minSpend: 1000, minDealSize: 1000}, entry: {}}`

- [ ] **Step 2: `data/templates.json`** keys:
- `active: "sticker"`
- `variants: [4 entries]` each `{id, name, file, palette, font, vibe, description}`. Ids `sticker`, `riso`, `bubble`, `neon`. Files: `theme-sticker.css` / `theme-riso.css` / `theme-bubble.css` / `theme-neon.css`. Palette dict captures bg + ink + accents (array of hex). Copy from the brainstorm variant cards.

- [ ] **Step 3: Validate + commit**

```bash
python3 -m json.tool data/insights.json > /dev/null && python3 -m json.tool data/templates.json > /dev/null && echo OK
git add data/insights.json data/templates.json && git commit -m "Seed insights + templates metadata" && git push
```

---

## Phase 3 — Common chrome

### Task 12: `js/common.js` (theme loader + nav/footer injection + `esc` helper)

**Files:** Create `js/common.js`

Module responsibilities:
1. On `DOMContentLoaded`: load active theme (from `localStorage.ep_activeTheme` or `data/templates.json#active`, default `"sticker"`), then rewrite `<link id="theme-css">` href to `{base}/assets/theme-{id}.css?v=1`. `base` comes from `document.body.dataset.base || "."` so admin pages with `data-base=".."` work.
2. Inject nav markup into `[data-nav]` — see Task 3 for class names. Links: Services / Pricing / Work / About / Diagnostic. CTA "Talk to us →" → `contact.html`.
3. Inject footer markup into `[data-footer]` — fetch `data/company.json`, fallback to a hardcoded object on network error. Render a 4-column grid: logo + parent badge + tagline, Services links, Company links, Contact info. Bottom bar: `© {year} {company.name}. All rights reserved.` + mono version chip.
4. Export `esc(s)` — the canonical HTML escaper used everywhere else in the app. Implementation: replace `&`, `<`, `>`, `"`, `'` with entities. Returns empty string for null/undefined.

- [ ] **Step 1: Write `js/common.js`** — implement the 4 responsibilities above. Use template strings for markup; all *dynamic* strings (from `data/company.json`) pass through `esc`. Seeds are treated as trusted for convenience here, but the habit matters.

- [ ] **Step 2: Parse-check**

```bash
node --check js/common.js
```

- [ ] **Step 3: Commit**

```bash
git add js/common.js && git commit -m "Add common.js: theme loader, nav+footer injection, esc helper" && git push
```

---

## Phase 4 — Public pages

Each public HTML page below shares the same head boilerplate:
- charset, viewport, title, description, OG title/desc/image/type, twitter:card, favicon links, apple-touch-icon
- `<link id="theme-css" rel="stylesheet" href="assets/theme.css">` followed by `base.css` and `components.css`
- `<script type="module" src="js/common.js?v=1"></script>` before `</body>`
- Body has `data-base="."` and contains `<div data-nav></div>` at the top and `<div data-footer></div>` at the bottom

Admin pages use `data-base=".."` and include `admin.css` too.

### Task 13: `index.html` (homepage)

**Files:** Create `index.html`

- [ ] **Step 1: Build homepage sections**

1. Nav slot
2. **Hero** — `.hero` with `.hero__blob` inside. Title markup: `Lead gen but<br><span class="scribble">actually fun</span>.<br>From <span class="hl">$2K</span>/mo.` Sub copy: "We build structured, ROI-focused marketing retainers for SMEs that sell to other businesses. No vanity metrics. No $500-freelancer risk. SG sales, MY ops, AI-augmented." CTAs: primary button "Get your 2-min ROI report →" → `diagnostic.html`; outline "See pricing" → `pricing.html`; two stickers `NO CHURN ✦` (coral) and `★ SG + MY` (violet).
3. **Positioning strip** — `.section` with h2 "You're not buying marketing. You're buying ROI." (use `.hl` and `.scribble`). 3-column `.grid--3` of cards: Freelancers / Us — Pulse (coral card) / Premium agencies, each with price mono chip.
4. **5 Capabilities strip** — `.section` white bg; h2 "Five things we do. Bundled into one retainer." (with `.hl`). Grid populated at runtime by inline `<script>` that fetches `data/capabilities.json` and renders 5 `.card` elements, each showing a sticker with the first-word-of-name, h4 name, subtle tagline, mono kpi. **Escape all three strings via `esc()` even though seed is trusted — keeps the habit uniform.**
5. **Critical insight strip** — centred block, max-width 720px. h2 quotes "SMEs don't care about marketing. They care about ROI." with `.scribble` on ROI. Subtle attribution "— every single prospect we've ever talked to". CTA primary "Will this pay off for you? →" → `diagnostic.html`.
6. Footer slot.

- [ ] **Step 2: Smoke test locally**

```bash
cd /Users/derrickteo/codings/Elitez-marketing-services
python3 -m http.server 8765 >/dev/null 2>&1 &
SERVER=$!
sleep 1
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8765/index.html
curl -s http://localhost:8765/index.html | grep -q "Lead gen but" && echo homepage-OK
kill $SERVER
```

Expected: `200` + `homepage-OK`.

- [ ] **Step 3: Commit**

```bash
git add index.html && git commit -m "Add homepage" && git push
```

---

### Task 14: `services.html`

**Files:** Create `services.html`

- [ ] **Step 1: Build page**

Head: title "Services — Elitez Pulse". Hero with title "Five capabilities. One bundled retainer." (use `.hl` on "bundled retainer"), sub "Everything below is already inside Core ($2-3K/mo). Nothing sold as a $50 line item. All of it reported as ROI."

Main section fetches `data/capabilities.json` and renders **one `.card` per capability** (not a 5-up grid — full-width cards, 40px padding, 24px margin-bottom). Each card: header row with `.sticker` coloured per `capability.sticker` showing `#{i+1} ✦ ${name-first-word}` + mono kpi on the right. Then h2 name, 18px description, h4 "What you get:", `<ul>` of deliverables. **All dynamic text escaped via `esc()`.**

- [ ] **Step 2: Commit**

```bash
git add services.html && git commit -m "Add services.html rendering 5 capabilities" && git push
```

---

### Task 15: `pricing.html`

**Files:** Create `pricing.html`

- [ ] **Step 1: Build page**

Hero: "Open pricing. Pick a tier, pay monthly." (use `.hl`). Sub: "No 'call for quote.' No retainer-lock shenanigans. Cancel with 30 days' notice."

Tiers section fetches `data/packages.json` then renders a 3-col grid of tier cards. Each card: h3 name, subtle tagline, big price `From SGD {priceFrom}` + mono `/ mo`, `<ul>` of features, primary-button CTA "`{cta} →`" → `contact.html?pkg={id}`. **Core tier** has a floating `.sticker--ink` badge absolutely positioned top-right reading "MOST POPULAR ★" and the `.card--coral` variant.

Add-ons section (white bg): h2 "Add-ons", 3-col grid of small cards, each with h4 name and mono "`${priceFrom}–${priceTo} SGD ${unit}`".

- [ ] **Step 2: Commit**

```bash
git add pricing.html && git commit -m "Add pricing.html with tiers and add-ons" && git push
```

---

### Task 16: `work.html`, `about.html`, `contact.html` + `js/contact.js`

**Files:**
- Create: `work.html`
- Create: `about.html`
- Create: `contact.html`
- Create: `js/contact.js`

- [ ] **Step 1: `work.html`** — empty-state centred block (max 720px).

Elements top-to-bottom:
- `.sticker--coral` reading "CASE STUDIES DROPPING Q3 2026 ✦"
- h1 "We're building our track record. In public." (use `.scribble` on "In public")
- paragraph about Elitez internal brands (copy: "While we rack up external case studies, here are internal Elitez Group brands we actively market:")
- 3-col grid of `.card`, each h4 + subtle paragraph:
  - Elitez Core · HR + staffing (our parent). Lead gen for SG HR procurement.
  - Elitez Aviation · Aviation recruitment micro-site, organic funnel set up end-to-end.
  - ELIX EOR · Micro-business EOR brand launch: website, positioning, pricing test.
- primary CTA "Want to be case study #1? Let's talk →" → `contact.html`

- [ ] **Step 2: `about.html`** — geographic arbitrage story.

Hero title "SG sales. MY ops. AI in between." with `.hl` on "AI in between". Sub: "We compete on structure that freelancers can't afford, at a price premium agencies can't hit — because we run on three nodes."

White-bg section with 3-col grid of coloured cards (violet / mustard / coral) representing Nodes 1/2/3 — copy straight from deck's "Geographic Arbitrage Engine" diagram:
- Node 1 — Singapore (violet): "SG Entity + sales team. Face-to-face trust, closing, premium pricing."
- Node 2 — AI Layer (mustard): "Workflow automation. Reduces friction, automates baseline tasks, expands margin."
- Node 3 — Malaysia (coral): "MY operations. High-quality execution, project mgmt, cost-efficiency."

Pull quote below in italics: *"A Malaysian company selling to Singapore faces price compression. A Singapore company executing in Malaysia captures maximum margin while maintaining professional prestige."*

Final section: h2 "Part of Elitez Group" (use `.hl`), paragraph about Elitez's 15+ year HR/staffing pedigree + how the Marketing dept retainer funds Pulse's own brand. Primary CTA "Book a 20-min chat →".

- [ ] **Step 3: `contact.html`** — form (no backend)

Form fields (all in a max-width 540px column):
- Name (required text)
- Company (required text)
- Work email (required email)
- Package select (empty option "Not sure yet", then entry/core/premium with price ranges in labels)
- Message textarea ("What's the situation?")
- Submit button primary "Send it →"

On submit: `preventDefault`, build a lead object `{id, ts, source: "contact", name, company, email, package, message, stage: "New", stageHistory: [{stage: "New", ts}]}`, push to `localStorage.ep_leads` array, hide form, show `.success` (mustard bg block) reading "✦ Got it. We'll email you within one working day from pulse@elitez.asia."

Prefill `pkg` from URL params (`?pkg=core` etc.). No markup is rendered with user-controlled strings after submit — just swap display states.

CSS additions (inline `<style>` block or append to components.css): `.form label { block, margin 16px 0 6px, weight 700, 14px }`, `.form input/select/textarea { full width, 14px padding, 2px ink border, radius md, inherit font, 15px, white bg }`, `.form textarea { min-height 120px, resize vertical }`, `.success { 24px padding, mustard bg, radius md, weight 700 }`.

`js/contact.js` implements the submit handler described above; no innerHTML with untrusted data.

- [ ] **Step 4: Parse-check + commit**

```bash
node --check js/contact.js
git add work.html about.html contact.html js/contact.js
git commit -m "Add work, about, contact pages; contact writes to localStorage"
git push
```

---

## Phase 5 — ROI Diagnostic

### Task 17: Pure scoring module + unit tests

**Files:**
- Create: `js/diagnostic-scoring.js`
- Create: `tests/diagnostic-scoring.test.mjs`

- [ ] **Step 1: Write the failing test first**

```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreAnswers } from "../js/diagnostic-scoring.js";

const WEIGHTS = {
  industry: {"B2B Services": 25, "Education": 20, "Professional Services": 22, "Logistics": 18, "HR-Consulting": 20, "Other": 10},
  headcount: {"<10": 5, "10-30": 18, "30-60": 25, "60-100": 22, ">100": 12},
  spend: {"0": 4, "500": 10, "1500": 20, "3000": 24, "5000+": 20},
  dealSize: {"<1K": 5, "1K-5K": 15, "5K-25K": 25, "25K+": 20},
  urgency: {"Yesterday": 10, "This month": 8, "This quarter": 5, "Just exploring": 2}
};
const THRESH = {
  premium: {minSpend: 3000, minDealSize: 5000},
  core: {minSpend: 1000, minDealSize: 1000},
  entry: {}
};

test("perfect fit scores high and recommends premium", () => {
  const r = scoreAnswers({
    industry: "B2B Services", headcount: "30-60", spend: 5000, pains: ["No consistent leads"],
    goal: "More qualified leads", dealSize: "5K-25K", urgency: "This month"
  }, WEIGHTS, THRESH);
  assert.ok(r.score >= 85, `expected >=85, got ${r.score}`);
  assert.equal(r.package, "premium");
  assert.equal(r.fitFlag, "good");
});

test("too small downshifts and flags freelancer-better", () => {
  const r = scoreAnswers({
    industry: "Other", headcount: "<10", spend: 0, pains: ["No consistent leads"],
    goal: "Cut costs", dealSize: "<1K", urgency: "Just exploring"
  }, WEIGHTS, THRESH);
  assert.ok(r.score <= 30, `expected <=30, got ${r.score}`);
  assert.equal(r.fitFlag, "freelancer-better");
});

test("mid-tier fit recommends core", () => {
  const r = scoreAnswers({
    industry: "Professional Services", headcount: "10-30", spend: 1500, pains: [],
    goal: "More qualified leads", dealSize: "1K-5K", urgency: "This quarter"
  }, WEIGHTS, THRESH);
  assert.equal(r.package, "core");
  assert.ok(r.score >= 50 && r.score < 90, `expected 50..90, got ${r.score}`);
});

test("break-even computes realistic deals per month", () => {
  const r = scoreAnswers({
    industry: "B2B Services", headcount: "30-60", spend: 3000, pains: [],
    goal: "More qualified leads", dealSize: "5K-25K", urgency: "This month"
  }, WEIGHTS, THRESH);
  assert.ok(r.breakEvenDeals >= 1 && r.breakEvenDeals <= 2);
  assert.equal(r.realistic, true);
});

test("missing answers degrade gracefully", () => {
  const r = scoreAnswers({}, WEIGHTS, THRESH);
  assert.equal(typeof r.score, "number");
  assert.ok(!Number.isNaN(r.score));
});
```

- [ ] **Step 2: Run to confirm FAIL**

```bash
node --test tests/diagnostic-scoring.test.mjs
```

Expected: FAIL (module not found).

- [ ] **Step 3: Implement `js/diagnostic-scoring.js`**

```javascript
const PACKAGE_MIDPOINT = { entry: 1250, core: 2500, premium: 4000 };
const DEAL_MIDPOINT = { "<1K": 500, "1K-5K": 3000, "5K-25K": 15000, "25K+": 40000 };

export function scoreAnswers(answers, weights, thresholds) {
  const w = weights || {};
  const a = answers || {};
  let score = 0;
  score += (w.industry && w.industry[a.industry]) || 0;
  score += (w.headcount && w.headcount[a.headcount]) || 0;
  const spendBucket = bucketSpend(a.spend);
  score += (w.spend && w.spend[spendBucket]) || 0;
  score += (w.dealSize && w.dealSize[a.dealSize]) || 0;
  score += (w.urgency && w.urgency[a.urgency]) || 0;

  let pkg = "entry";
  const spendNum = Number(a.spend) || 0;
  const dealMid = DEAL_MIDPOINT[a.dealSize] || 0;
  const t = thresholds || {};
  if (t.premium && spendNum >= (t.premium.minSpend || Infinity) && dealMid >= (t.premium.minDealSize || Infinity)) pkg = "premium";
  else if (t.core && spendNum >= (t.core.minSpend || Infinity) && dealMid >= (t.core.minDealSize || Infinity)) pkg = "core";

  let fitFlag = "good";
  if (a.headcount === "<10" && spendNum < 500 && a.dealSize === "<1K") {
    fitFlag = "freelancer-better";
    score = Math.min(score, 30);
  } else if (score < 40) {
    fitFlag = "stretch";
  }

  const retainer = PACKAGE_MIDPOINT[pkg];
  const breakEvenDeals = dealMid > 0 ? Math.ceil(retainer / dealMid) : null;
  const realistic = breakEvenDeals !== null && breakEvenDeals <= 4;
  const priority = rankCapabilities(a.pains || [], a.goal || "");

  return { score: clamp(score, 0, 100), package: pkg, fitFlag, breakEvenDeals, realistic, priority };
}

function bucketSpend(v) {
  const n = Number(v) || 0;
  if (n >= 5000) return "5000+";
  if (n >= 3000) return "3000";
  if (n >= 1000) return "1500";
  if (n >= 250) return "500";
  return "0";
}

function rankCapabilities(pains, goal) {
  const s = { "social-web": 1, video: 1, leads: 1, digital: 1, creative: 1 };
  if (pains.includes("No consistent leads")) s.leads += 3;
  if (pains.includes("Content feels generic")) { s.video += 2; s.digital += 2; }
  if (pains.includes("Website dead")) { s.digital += 2; s.leads += 1; }
  if (pains.includes("No team capacity")) { s["social-web"] += 2; s.creative += 2; }
  if (pains.includes("No clue what's working")) s.leads += 2;
  if (goal === "More qualified leads") s.leads += 2;
  if (goal === "Better brand/website" || goal === "Better brand+website") s.digital += 2;
  if (goal === "Launch campaigns faster") s.creative += 2;
  return Object.entries(s).sort((a, b) => b[1] - a[1]).map(([id]) => id);
}

function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
```

- [ ] **Step 4: Run tests — expect 5 pass**

```bash
node --test tests/diagnostic-scoring.test.mjs
```

- [ ] **Step 5: Commit**

```bash
git add js/diagnostic-scoring.js tests/diagnostic-scoring.test.mjs
git commit -m "Diagnostic scoring: pure fn + 5 unit tests"
git push
```

---

### Task 18: Diagnostic UI (`diagnostic.html`) + state machine (`js/diagnostic.js`)

**Files:**
- Create: `diagnostic.html`
- Create: `js/diagnostic.js`

- [ ] **Step 1: `diagnostic.html`** — full-page quiz shell

- Head: standard + load jsPDF CDN with SRI.
- Inline `<style>` block: `.quiz` (max 680px), `.step` (display:none; `.active` shows), `.progress` + `.progress__bar`, `.chips` flex-wrap gap 10px, `.chip` (pill 12×18px, 2px ink border, weight 700, white bg; `.selected` reverses to ink bg + white), `.slider-wrap` + `.slider-val` (32px bold), `.nav-btns` flex spread, `.report` + `.score-ring` (180px round, 8px border, variant classes `.med` / `.high` switch border colour) + `.report-card` (white bg, 2px border, radius lg, padding 24px, margin-bottom 20px).
- 10 `.step` divs with `data-step="0..9"`:
  - **0 — landing:** sticker `2 MIN ✦ FREE REPORT`, h1 with `.scribble` on "pay off", sub copy, primary CTA `Start →` → `diagnostic.next()`
  - **1 — industry (single-select chips):** "B2B Services", "Education", "Professional Services", "Logistics", "HR-Consulting", "Other"
  - **2 — headcount (single):** "<10", "10-30", "30-60", "60-100", ">100"
  - **3 — spend (range slider, 0–5000, step 500, default 1500):** label updates live; value "5000" displays as "SGD 5,000+"
  - **4 — pains (multi-select chips):** "No consistent leads", "Content feels generic", "Website dead", "No team capacity", "No clue what's working" — container has `data-multi="1"`
  - **5 — goal (single):** "More qualified leads", "Better brand/website", "Launch campaigns faster", "Cut costs"
  - **6 — dealSize (single):** "<1K", "1K-5K", "5K-25K", "25K+"
  - **7 — urgency (single):** "Yesterday", "This month", "This quarter", "Just exploring"
  - **8 — gate form:** name + company + email (all required), "See my report →" submit
  - **9 — report container** (rendered at runtime into `#report`)
- Each chip button has `data-v="<value>"`; each chips container has `data-q="<questionKey>"`. Next buttons have `data-req="<questionKey>"` so the state machine can block advance when unanswered (except pains/spend).

- [ ] **Step 2: `js/diagnostic.js`** — state machine + report render + PDF

Responsibilities:

1. Maintain `state = { step: 0, answers: {...empty shape...}, contact: null }`.
2. Wire chip handlers: single-select clears sibling `.selected` then adds `.selected` to click target; multi-select toggles. Write values to `state.answers[q]`.
3. Wire slider: update `state.answers.spend = Number(value)` and live-render the "SGD N,NNN" label (append "+" if value == 5000).
4. `next()` / `prev()` advance the `state.step` with a required-field guard from `data-req`. Update the progress bar width to `step/(total-1)*100%`. Smooth-scroll to top on step change.
5. On gate form submit: capture `contact`, call `finishAndShowReport()`.
6. `finishAndShowReport()`: fetch `data/insights.json` + `data/packages.json` + `data/capabilities.json`, call `scoreAnswers(state.answers, insights.scoringWeights, insights.packageThresholds)`, pick the recommended package and top 3 capabilities by `result.priority`.
7. Render the report using DOM methods (not `innerHTML` with string concatenation of untrusted data). Strategy: build a `DocumentFragment` with `document.createElement` + `textContent` for all user-provided strings (name, company). Only seed-derived strings go into innerHTML via template literals that pass through `esc()`. The report contains:
   - Sticker "YOUR REPORT ✦"
   - h1 `Hey {name} — here's the maths.` (name via textContent)
   - Score ring with class `.high` (≥75), `.med` (≥50), or none (<50)
   - Fit-flag copy block: if `freelancer-better` show the honest "come back when your ACV or team size grows" message; if `stretch`, "Borderline fit. We can work together but ROI will take longer."; else "Strong fit. Here's how the maths works out."
   - Recommended package card: h3 name, mono price range, `<ul>` first-4 features, `"Most SMEs like you pick {Name} ✦"` sticker
   - Break-even card: "You'd need ~N new deals per month to cover our retainer. *{Realistic given your industry / Stretch — we'd want to look at your ACV}*"
   - Top-3 capabilities card: ordered list of name + tagline
   - Benchmark stats card: 3-col grid from `insights.benchmarkStats`
   - Action row: primary "Book the 20-min deep-dive →" → `contact.html?pkg={id}`, outline "Email me this report (PDF)" triggers `generatePdf(...)`
8. Persist the lead to `localStorage.ep_leads` with full diagnostic answers, score, package, fitFlag, breakEvenDeals, stage: "New", stageHistory populated.
9. Set `state.step = 9` and re-render steps.
10. `generatePdf(lead, pkg, caps, result, insights)`: use UMD jsPDF. A4 portrait. Helvetica (jsPDF builtin — no Inter needed). Headings 22/16/14 bold. Body 11/12 normal. Render: "Elitez Pulse — ROI Report" header, `For: {name} ({company})`, date, score/fitFlag, recommended package block with bullet features, break-even stats, top-3 capabilities, benchmarks. Save as `Elitez-Pulse-Report-{company-slug}.pdf`.

- [ ] **Step 3: Parse-check + smoke test**

```bash
node --check js/diagnostic.js
python3 -m http.server 8765 >/dev/null 2>&1 & SERVER=$!
sleep 1
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8765/diagnostic.html
kill $SERVER
```

- [ ] **Step 4: Manual verify**

Open `http://localhost:8765/diagnostic.html` in browser, click through all 7 questions, gate, confirm report renders and PDF downloads.

- [ ] **Step 5: Commit**

```bash
git add diagnostic.html js/diagnostic.js
git commit -m "Add ROI Diagnostic: 10-step flow, scored report, PDF export"
git push
```

---

## Phase 6 — Admin portal

### Task 19: Admin shell + tab router + admin CSS

**Files:**
- Create: `admin/index.html`
- Create: `assets/admin.css`
- Create: `js/admin/shell.js`

- [ ] **Step 1: `assets/admin.css`**

Classes:
- `.admin-layout` — grid `240px 1fr`, min-height 100vh
- `.admin-rail` — ink bg, cream text, sticky top, 100vh height scroll, 24×16 padding
- `.admin-rail__logo` — coral rotated pill, 28px margin-bottom
- `.admin-rail__tab` — 12×14px, radius md, 4px margin-bottom, `.active` uses coral bg + white
- `.admin-main` — 32×40px padding, `overflow-x: auto`
- `.tbl` — full width, white bg, 2px ink border, radius md (overflow hidden). th uses ink bg, cream text, 12px uppercase. td 12×14 padding, border-bottom 1px/8%. Rows hover → cream bg + cursor pointer
- `.drawer` — fixed right, min(560px, 100vw), translate-X 100% collapsed, `.open` slides in. `.drawer__close` top-right ×
- `.pill` variants: `.pill--new` mustard, `.pill--qual` violet, `.pill--prop` coral, `.pill--won` green, `.pill--lost` grey
- `.empty` — dashed 2px ink border, cream bg, 40px centre, opacity 0.7

- [ ] **Step 2: `admin/index.html`**

`<body data-base="..">`. Head includes `theme.css`/`base.css`/`components.css`/`admin.css` + Chart.js CDN with SRI + favicon.

Body: `.admin-layout` grid containing `<aside class="admin-rail">` (logo pill, then 7 `<a class="admin-rail__tab" data-tab="...">` links for leads/commission/packages/competitors/insights/templates/settings, last two lines: version chip `v0.1 · localStorage-only`) and `<main class="admin-main" id="main">`.

Global `.drawer` at end of body (initially closed).

Scripts: `common.js` (for theme) + `js/admin/shell.js`.

- [ ] **Step 3: `js/admin/shell.js`**

```javascript
const TABS = ["leads", "commission", "packages", "competitors", "insights", "templates", "settings"];

async function loadTab(id) {
  document.querySelectorAll(".admin-rail__tab").forEach(t => t.classList.toggle("active", t.dataset.tab === id));
  const main = document.getElementById("main");
  main.textContent = "Loading...";
  try {
    const mod = await import(`./${id}.js?v=1`);
    await mod.render(main);
    history.replaceState(null, "", `#${id}`);
  } catch (e) {
    main.textContent = `Error: ${e.message}`;
  }
}

document.querySelectorAll(".admin-rail__tab").forEach(tab => {
  tab.addEventListener("click", () => loadTab(tab.dataset.tab));
});

const initial = location.hash.slice(1) || "leads";
loadTab(TABS.includes(initial) ? initial : "leads");
```

- [ ] **Step 4: Parse-check + commit**

```bash
node --check js/admin/shell.js
git add assets/admin.css admin/index.html js/admin/shell.js
git commit -m "Admin shell + tab router + rail CSS"
git push
```

---

### Task 20: Leads tab

**Files:** Create `js/admin/leads.js`

- [ ] **Step 1: Module exports `async function render(root)`**

Behaviour:
1. Read leads from `localStorage.ep_leads`, sort by `ts` desc.
2. Count by stage (`New`, `Qualified`, `Proposed`, `Won`, `Lost`). Compute `potentialGp` = sum of (midpoint retainer × 0.7 × 3) for leads in `Qualified` or `Proposed`.
3. Render header (h1), a row of coloured `.pill` counters for each stage, plus a potential-GP pill and an `Export CSV` button.
4. If leads empty: show `.empty` message.
5. Else render `.tbl` with columns: Date · Name · Company · Source · Score · Rec'd · Stage. **Every user-controlled cell goes through `textContent` or an `esc()` helper.** The recommended approach: use `document.createElement("tr")` + `.textContent` assignments per cell rather than building an HTML string. Add `data-id` on each row.
6. Row click → `openDrawer(id)`:
   - Populate `#drawer-body` with: h2 name + company, mono email + timestamp, stage `<select>` (pre-selected current stage), diagnostic answers `<ul>` if present (one `<li>` per `{k, v}` — pains joined by ", "), message paragraph if present, notes `<textarea>` (pre-filled).
   - All user-controlled strings use textContent; diagnostic answer values (which may include pains from the controlled chip list — still untrusted) pass through `esc`.
   - "Save" button updates the lead in-place: on stage change, append to `stageHistory`; always overwrite `notes`. Persist `ep_leads`, close drawer, re-render.
   - "Generate proposal →" anchor links to `proposal.html?leadId={id}`.
7. Export CSV: serialise `[id, ts, source, name, company, email, stage, score, package, fitFlag, breakEvenDeals]` with `JSON.stringify` per cell to escape commas/quotes; blob-download as `leads-{ts}.csv`.

- [ ] **Step 2: Parse-check + commit**

```bash
node --check js/admin/leads.js
git add js/admin/leads.js
git commit -m "Admin Leads tab: table, drawer, stage updates, CSV export"
git push
```

---

### Task 21: Commission tab + pure math test

**Files:**
- Create: `js/admin/commission.js`
- Create: `tests/commission.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import { computeCommission } from "../js/admin/commission.js";

test("base tier: $1,500 revenue -> 20% of $1,100 GP = $220", () => {
  const r = computeCommission({ revenue: 1500 });
  assert.equal(r.commission, 220);
  assert.equal(r.tier, 1);
});

test("top tier: $10,000 revenue -> 25% of $8,000 GP = $2,000", () => {
  const r = computeCommission({ revenue: 10000 });
  assert.equal(r.commission, 2000);
  assert.equal(r.tier, 4);
});

test("upsell bonus adds +3% of incremental revenue", () => {
  const r = computeCommission({ revenue: 5000, upsellValue: 1000 });
  assert.equal(r.commission, 814);
  assert.equal(r.upsellBonus, 30);
});

test("monthly bonus: $8K revenue -> $300", () => {
  assert.equal(computeCommission({ revenue: 8000 }).monthlyBonus, 300);
});

test("monthly bonus: $13K revenue -> $800", () => {
  assert.equal(computeCommission({ revenue: 13000 }).monthlyBonus, 800);
});
```

Note: tier indexing starts at 0 for the `<$1,500` implied floor, so `$1,500` triggers tier **1**, `$10,000` triggers tier **4** (the `$7,500+` row). Confirm with deck before cutting the test.

- [ ] **Step 2: Run — expect FAIL**

```bash
node --test tests/commission.test.mjs
```

- [ ] **Step 3: Implement `js/admin/commission.js`**

Export both `computeCommission` and `render`. Tiers from deck:

```javascript
const TIERS = [
  { minRevenue: 0,    hours: 20,  cost: 400,  pct: 0.20 },
  { minRevenue: 1500, hours: 40,  cost: 800,  pct: 0.22 },
  { minRevenue: 3000, hours: 65,  cost: 1300, pct: 0.22 },
  { minRevenue: 5000, hours: 90,  cost: 1800, pct: 0.25 },
  { minRevenue: 7500, hours: 100, cost: 2000, pct: 0.25 }
];

export function computeCommission({ revenue = 0, upsellValue = 0 }) {
  let tier = 0;
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (revenue >= TIERS[i].minRevenue) { tier = i; break; }
  }
  const t = TIERS[tier];
  const gp = Math.max(0, revenue - t.cost);
  const commission = Math.round(gp * t.pct);
  const upsellBonus = Math.round(upsellValue * 0.03);
  const monthlyBonus = revenue >= 13000 ? 800 : revenue >= 8000 ? 300 : 0;
  return { tier, gp, commission, upsellBonus, monthlyBonus, total: commission + upsellBonus + monthlyBonus };
}
```

`render(root)` scaffold:
- h1 "Commission Calculator"
- 3-col grid of labelled inputs: Rep name, Monthly revenue closed (number), Upsell value (number)
- Result card (white bg, 2px ink border) containing a 3-col grid of {tier, GP, base commission} and another row of {upsell bonus, monthly bonus, total payout} — update on every `input` event
- Below, a reference `<table class="tbl">` with the five tier rows (built via DOM methods, not a HTML string — all numbers come from a trusted constant)

- [ ] **Step 4: Run both test files — expect 10 pass**

```bash
node --test tests/commission.test.mjs tests/diagnostic-scoring.test.mjs
```

- [ ] **Step 5: Commit**

```bash
git add js/admin/commission.js tests/commission.test.mjs
git commit -m "Admin Commission tab + computeCommission tested vs deck tiers"
git push
```

---

### Task 22: Packages tab

**Files:** Create `js/admin/packages.js`

- [ ] **Step 1: Module behaviour**

`render(root)`:
1. Read override from `localStorage.ep_pkgOverride`; fallback to fetch `../data/packages.json`.
2. h1 "Pricing Packages" + subtle blurb explaining overrides are browser-local until exported.
3. Render 3 tier cards side-by-side, each with **inline form inputs** pre-filled from the package object:
   - `<input>` for name, tagline
   - number inputs for `priceFrom`, `priceTo`
   - checkbox for `popular`
   - `<textarea>` with features as newline-joined text
4. Render add-ons as a `.tbl` with editable cells (name / priceFrom / priceTo / unit inputs in each row).
5. Button row: Save (persists `ep_pkgOverride` from the current form values), Download JSON (exports the same collected object as a blob download, filename `packages.json`), Reset (removes override + re-renders), Preview → (opens `../pricing.html` in new tab).

**Never set innerHTML with runtime-editable seed text directly — but packages data comes from the seed file or admin user themselves (who is the site operator). For v1 the admin is trusted. Still prefer `.value = seed.name` over `innerHTML` so mental habits stay right.**

6. `collect()` builds the updated object by reading input values into plain objects and returns `{ tiers, addOns }`.

- [ ] **Step 2: Parse-check + commit**

```bash
node --check js/admin/packages.js
git add js/admin/packages.js && git commit -m "Admin Packages tab with inline editor + JSON export" && git push
```

---

### Task 23: Competitors, Insights, Settings tabs

**Files:**
- Create: `js/admin/competitors.js`
- Create: `js/admin/insights.js`
- Create: `js/admin/settings.js`

- [ ] **Step 1: `competitors.js`**

`render(root)`: fetch `data/competitors.json` (or `localStorage.ep_competitorsOverride`). Header + subtle sub. `.tbl` columns: Competitor (name + mono site on new line), Country, Tier, Price, Grade (pill mustard). Rows have `data-i`. Row click → open drawer with full battle-card (h2 name, mono link, fields: Typical price, Grade, Their positioning, Our advantage, Our gap, Battle-card note — all rendered via DOM methods with `textContent`). Button "Download JSON".

- [ ] **Step 2: `insights.js`**

`render(root)`: fetch `data/insights.json`. Sections:
- Mental models: render each as a `.card` with h4 title + paragraph body (textContent).
- Benchmark stats: 3 editable rows, each a 2-col grid of `<input>` for label + value. Store in memory until Download JSON.
- Diagnostic scoring weights: render a `<pre><code>` showing the existing JSON (read-only for v1 to avoid accidentally breaking scoring — user can edit the file directly).
- Download JSON button gathers the updated benchmark stats, replaces in-memory data, downloads new `insights.json`, and caches to `localStorage.ep_insightsOverride`.

- [ ] **Step 3: `settings.js`**

`render(root)`:
- Load merged company settings (`localStorage.ep_settings` || fetch `data/company.json`).
- Three inputs: Company name, Contact email, Phone. Save button writes to `localStorage.ep_settings`.
- Backup/export section: button "Download all data as JSON" snapshots every `localStorage` key starting with `ep_`, serialises, downloads as `elitez-pulse-backup-{ts}.json`.
- Button "Clear all leads" with confirm dialog: `localStorage.removeItem("ep_leads")`.

- [ ] **Step 4: Parse-check + commit**

```bash
node --check js/admin/competitors.js js/admin/insights.js js/admin/settings.js
git add js/admin/competitors.js js/admin/insights.js js/admin/settings.js
git commit -m "Admin Competitors, Insights, Settings tabs"
git push
```

---

### Task 24: Templates tab + 3 theme variants + preview page

**Files:**
- Create: `assets/theme-riso.css`
- Create: `assets/theme-bubble.css`
- Create: `assets/theme-neon.css`
- Create: `admin/template-preview.html`
- Create: `js/admin/templates.js`

- [ ] **Step 1: `theme-riso.css`** — override tokens for Risograph Press

`--cream: #F5EFE3`, `--coral: #FF4981` (Riso hot pink), `--violet: #3D5AFE` (Riso blue), `--mustard: #3D5AFE` (reuse blue), `--shadow-sticker: 3px 3px 0 #FF4981`, `--shadow-card: 0 2px 0 #3D5AFE`, smaller radii (2/4/8). Keep fonts identical.

- [ ] **Step 2: `theme-bubble.css`** — Bubblegum Bauhaus

`--cream: #FFE5EC`, `--coral: #FF4B7D`, `--violet: #CBB5FF`, `--mustard: #FFF59E`, `--font-display: "Fraunces", Georgia, serif`, larger radii (12/20/28), soft card shadow.

- [ ] **Step 3: `theme-neon.css`** — Neon Hypebeast (dark)

`--cream: #0D0D0D` (dark bg), `--ink: #F5F5F5` (light text), `--coral: #D9FF3B`, `--violet: #FF2E88`, `--white: #1A1A1A` (darker surface), glow shadows. Add a body override ensuring bg/text swap: `body { background: var(--cream); color: var(--ink); }`.

- [ ] **Step 4: `admin/template-preview.html`** — full-screen preview

Standalone page. Head loads theme variant based on `?v=<id>` param (JS rewrites `#theme-css` href before the CSS decides layout). Body: hero with blob, 3-card grid demonstrating `.card`, `.card--coral`, `.card--mustard`. Update `<title>` and a h1 span to the variant's display name.

- [ ] **Step 5: `js/admin/templates.js`**

`render(root)`:
- Fetch `data/templates.json`. Active = `localStorage.ep_activeTheme` || seed active.
- h1 + sub explaining current active + how to switch.
- 4-card grid (one per variant). Each card:
  - h3 variant name, subtle description (textContent)
  - mono row of swatch chips (small inline-blocks coloured from palette array)
  - mono font line
  - Two buttons: Preview → (opens `template-preview.html?v={id}` in new tab), Set active (primary). If already active, show "★ Active" disabled.
- Clicking Set active writes to `localStorage.ep_activeTheme` and re-renders the tab. Alert instructs user to refresh public pages.

- [ ] **Step 6: Parse-check + commit**

```bash
node --check js/admin/templates.js
git add assets/theme-riso.css assets/theme-bubble.css assets/theme-neon.css admin/template-preview.html js/admin/templates.js
git commit -m "Admin Templates tab + 3 theme variants + preview page"
git push
```

---

## Phase 7 — Proposal PDF generator

### Task 25: `admin/proposal.html` + `js/admin/proposal.js`

**Files:**
- Create: `admin/proposal.html`
- Create: `js/admin/proposal.js`

- [ ] **Step 1: `admin/proposal.html`**

Head loads theme+base+components+admin CSS plus html2canvas + jsPDF CDNs. Style block adds:
- `.proposal-grid { grid: 380px 1fr, gap: 24px }` — collapses to single column below 900px
- `.form input/textarea/select` — 10px padding, 2px ink border, radius 8px, white bg
- `.preview-page { cream bg, 2px ink border, 40px padding, radius 8px, margin-bottom 16px, min-height 500px }`

Body layout:
- Header: "← Back to admin" link + h1 "Proposal generator"
- Left column: `<form id="pf">` with labelled inputs:
  - name (text), company (text), date (date — default today), pkg (select entry/core/premium), fee (number, default 2500), setup (number, default 0), term (select 3/6/12 — default 6), rep (text, default "Pulse Team"), problem (textarea 4 rows), solution (textarea 4 rows)
- "Generate PDF →" button
- Right column: `<section id="preview">` — 5 `.preview-page` divs re-rendered on every form input

- [ ] **Step 2: `js/admin/proposal.js`** behaviour

1. On `DOMContentLoaded`: fetch `data/packages.json` and `data/capabilities.json`. Parse `?leadId`.
2. If leadId maps to an existing lead: prefill `name`, `company`, `pkg`, and derive `problem` text from `answers.pains.join(", ")` + `answers.goal` + `answers.industry`. Seed `solution` with a default line.
3. Default proposal date = today's ISO (YYYY-MM-DD).
4. `render()` rebuilds the 5 preview pages on every form input. **Because the operator is the same person building the proposal, strings here can be typed freely — but still pass through `esc()` before innerHTML to keep consistency.** Five pages:
   1. Cover — sticker + hello headline + "Prepared by {rep} · {date}" + intro paragraph
   2. Problem & goal — h2 + the `problem` textarea content + h3 "How we'll measure success" + static bullet list (ROI report, qualified leads, cost per customer)
   3. Proposed solution — h2 with `.hl` on package name + mono price range + solution paragraph + h3 "Included capabilities" + 3-col mini-card grid from capabilities
   4. Pricing — h2 + `.tbl` with rows: Monthly fee, Setup, Term, Total first year (est = fee\*12 + setup). Highlight total row with mustard bg.
   5. Next steps — h2 + ordered list (countersign → onboarding week → month 1 → monthly ROI) + rep sign-off
5. Auto-save draft to `localStorage.ep_proposals[leadId]` on every re-render (if leadId present).
6. `generatePdf()`: loop the 5 `.preview-page` divs; for each run `html2canvas(el, { scale: 2, backgroundColor: "#FEF3E7" })`, convert to PNG data URL, add to a new jsPDF A4 page (first uses the implicit first page). Scale image to fit page. Save as `Elitez-Pulse-Proposal-{company-slug}.pdf`.

- [ ] **Step 3: Parse-check + commit**

```bash
node --check js/admin/proposal.js
git add admin/proposal.html js/admin/proposal.js
git commit -m "Proposal PDF generator: 5-page preview + html2canvas export"
git push
```

---

## Phase 8 — CI, README, deploy

### Task 26: Linkcheck script + CI workflow

**Files:**
- Create: `scripts/linkcheck.py`
- Create: `.github/workflows/linkcheck.yml`

- [ ] **Step 1: `scripts/linkcheck.py`**

Python3, no external deps. Walk `*.html` at repo root + `admin/*.html`. Use a simple regex `href=["']([^"']+)["']` to extract link targets. Skip external (scheme or netloc present), `#`-only, and `mailto:`. Resolve relative paths against the HTML file's parent. If resolved path is a directory, append `index.html`. If the resolved file doesn't exist, record an error. Exit 1 on any error; exit 0 with `OK — N files checked, no broken internal links`.

- [ ] **Step 2: Run locally**

```bash
cd /Users/derrickteo/codings/Elitez-marketing-services
python3 scripts/linkcheck.py
```

Fix any reported breakages.

- [ ] **Step 3: `.github/workflows/linkcheck.yml`**

```yaml
name: linkcheck
on:
  push:
    paths: ["**/*.html", "scripts/linkcheck.py"]
  pull_request:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.11" }
      - run: python3 scripts/linkcheck.py
```

- [ ] **Step 4: Commit + verify CI**

```bash
git add scripts/linkcheck.py .github/
git commit -m "Add linkcheck script + CI workflow"
git push
sleep 30 && gh run list --limit 1
```

Expected: latest run status `completed success`.

---

### Task 27: README

**Files:** Create `README.md`

- [ ] **Step 1: Write README**

Sections: one-line summary, live URL, stack blurb, local dev (python3 -m http.server 8765), admin note (no password, URL not linked from public), test command (`node --test tests/*.test.mjs`), content editing guide (edit HTML directly, seeds via admin Download JSON, theme swap via admin Templates tab), regenerate favicon/OG command, license (all rights reserved).

- [ ] **Step 2: Commit**

```bash
git add README.md && git commit -m "Add README" && git push
```

---

### Task 28: End-to-end deploy QA

**Files:** none

- [ ] **Step 1: Verify Pages is serving current content**

```bash
sleep 60
curl -sL https://derrick-pixel.github.io/elitez-pulse/ | grep -c "Lead gen but"
curl -sL -w "%{http_code}\n" -o /dev/null https://derrick-pixel.github.io/elitez-pulse/diagnostic.html
curl -sL -w "%{http_code}\n" -o /dev/null https://derrick-pixel.github.io/elitez-pulse/admin/
```

Expected: count > 0, both 200.

- [ ] **Step 2: Manual QA checklist (open in a real browser)**

- [ ] Homepage: sticker zine renders, blob visible, Inter loaded, logo pill rotated
- [ ] Services / Pricing / Work / About render with live data
- [ ] Contact form submit → success state visible; refresh admin → lead appears
- [ ] Diagnostic: full 7-Q flow + gate + report + PDF download (no console errors)
- [ ] Admin: all 7 tabs load; Leads drawer stage change persists across reload
- [ ] Commission: $10K → $2,000
- [ ] Templates: set active Neon → refresh home → dark theme applied
- [ ] Proposal: `/admin/proposal.html?leadId={real-id}` prefills from lead; PDF downloads and is legible
- [ ] Lighthouse on homepage: perf ≥ 90, a11y ≥ 95, best-practices ≥ 90

- [ ] **Step 3: Tag v0.1.0**

```bash
git tag v0.1.0 -m "Elitez Pulse v0.1"
git push --tags
echo "Deployed to https://derrick-pixel.github.io/elitez-pulse/"
```

---

## Self-Review

**Spec coverage:** every section in `2026-04-22-elitez-pulse-design.md` maps to at least one task:
- §1 Context → README + homepage copy (Tasks 13, 27)
- §2 Brand → Tasks 5 (logo), 3 (components), 2 (tokens)
- §3 Scope v1 → Tasks 13–16 (public), 17–18 (diagnostic), 19–24 (admin), 25 (proposal)
- §4 Visual system → Tasks 2, 3, 24
- §5 Public pages → Tasks 13, 14, 15, 16
- §6 Diagnostic → Tasks 17, 18
- §7 Admin → Tasks 19, 20, 21, 22, 23, 24
- §8 Proposal → Task 25
- §9 Tech stack → Tasks 2, 12, 17, 25
- §10 Data model → Tasks 7–11
- §11 Repo + hosting → Tasks 1, 26, 28
- §12 File layout → reflected in each Files block
- §13 Out of scope → explicitly not planned
- §14 Success criteria → Task 28 QA

**Placeholder scan:** no "TBD", "TODO", "fill in later" placeholders. Any `TBC` (e.g. office addresses in `company.json`) is content-pending-from-user, not engineering incompleteness.

**Type consistency:**
- `scoreAnswers(answers, weights, thresholds)` — signature consistent across tests (Task 17 step 1) and impl (step 3) and caller (Task 18).
- `computeCommission({revenue, upsellValue})` — same in tests (Task 21 step 1) and impl (step 3) and tab render (step 3). Tier index 0..4.
- Lead shape: `{id, ts, source, name, company, email, stage, stageHistory, ...}` — consistent across `contact.js` (Task 16), `diagnostic.js` (Task 18), `leads.js` (Task 20), `proposal.js` (Task 25).

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-22-elitez-pulse.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration. Best for a 28-task plan like this where each task is self-contained.

**2. Inline Execution** — Execute tasks sequentially in this session with periodic checkpoints for your review. Slower but you see every step live.

Which approach?

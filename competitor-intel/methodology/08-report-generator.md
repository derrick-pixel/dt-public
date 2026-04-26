# 08 — Report Generator

## Role one-liner

Compiles agents 1–6 into a single downloadable PDF with full-bleed design, auto-generated TOC, and coherent section-to-section narrative.

## When to dispatch

Dispatch only after agents 1–6 have finished and committed their outputs. The report is a compile step, not an analysis step — if any upstream file is missing or stale, the PDF will render stale content. Concretely: `competitors.json` populated and Top-5 locked (Agent 1), `market-intelligence.json` written (Agent 2), `pricing-strategy.json` with tiers and personas (Agent 3), `whitespace-framework.json` with **every heatmap cell carrying a `specialisation_for_cell` populated** (Agent 4 — this is the hard precondition for the Cell Detail Appendix on page 7c), website audit scores attached to competitor records (Agent 5), and chart configs / rendered visual assets available (Agent 6).

Re-dispatch the generator whenever any upstream file changes materially. The PDF is cheap to regenerate — cheaper than shipping a stale one.

## Inputs the agent needs

- **`/data/competitors.json`** — records, Top-5, rationales. Read every field; `strengths`, `weaknesses`, `sg_monthly_sgd`, and `website_design_*` all surface in the PDF.
- **`/data/market-intelligence.json`** — TAM/SAM/SOM, policy summary, country-readiness table.
- **`/data/pricing-strategy.json`** — recommended tier table, personas, elasticity notes, competitor price band (min/max/median).
- **`/data/whitespace-framework.json`** — strategy canvas, heatmap axes, every cell object with `row`, `col`, `score` (0–5), `band` (green/amber/red), `competitors[]`, and `specialisation_for_cell` populated for **every cell**.
- **`/data/website-audit.json`** *(or inlined on competitor records)* — 5-dimension scores and auditor notes for the top-10.
- **`/data/visuals/*`** — Agent 6 chart configs (JSON) plus any pre-rendered PNG/SVG assets.
- **`project.json`** (root) — `name`, `slug`, `date`, `prepared_by`, `brand_tokens`.
- **Vendored libs** in `/template/assets/vendor/`: `html2canvas.min.js`, `jspdf.umd.min.js`. Pinned versions. Do not re-fetch from CDN at runtime; offline-capable is a template requirement.

## Stack

**html2canvas + jsPDF, pinned and vendored.** Same stack Derrick's JR+ proposal deck (`proposal.html`) uses to produce an 11-page PDF. Client-side only — the template runs from a static folder, no build step, no server. The PDF is generated in the browser the moment the user clicks "Generate PDF" in `admin/report.html`.

Why not `pdfmake` or a headless-Chrome server pipeline? Because the template's operating constraint is "a single person with a static host can ship this." html2canvas rasterises the same DOM the user previews, which means WYSIWYG parity is mechanical, not aspirational; jsPDF stitches the rasters into a paginated PDF. Trade-off: PDFs are image-based (not text-selectable). For a competitive-intelligence deliverable this is acceptable — readers scan it, they don't grep it.

**Version pinning is non-negotiable.** `html2canvas@1.4.1` and `jspdf@2.5.1` are the pinned versions; newer majors of jsPDF have changed the UMD export shape in ways that break the JR+ deck recipe. If the template ever needs to upgrade, the upgrade is a methodology-curator (Agent 7) task — it touches every page renderer because canvas dimensions and PDF units can shift. Never auto-bump.

**Where the libs live.** `/template/assets/vendor/html2canvas.min.js` and `/template/assets/vendor/jspdf.umd.min.js`. Loaded via `<script src="...">` at the top of `admin/report.html`, synchronous. No bundler, no import map — the template's whole premise is zero build step. If you find yourself adding webpack, you've misunderstood the template.

## Report structure (fixed 9-part)

The order is fixed. Do not reshuffle; downstream readers (and the TOC renderer) assume this sequence.

1. **Cover.** Full-bleed brand-primary background. Project name centred, date and "prepared by" in small type beneath. Optional logo top-left. No page number, no footer.
2. **Table of Contents.** Auto-generated from the section registry. Section title left, page number right, dot-leader between. Always lands on page 2.
3. **Executive Summary.** Four blocks on one page: top-3 threats (from `competitors.top_five[0..2]`), top-3 attack plans (from `whitespace.attack_plans[0..2]`), market size line (TAM/SAM/SOM one-liner), headline pricing line (competitor band + our recommended tier).
4. **Competitor Landscape.** Top-5 card row with logos and rationales, then the Top-10-by-threat table (rank, name, threat, beatability, score, SG monthly, one-line rationale).
5. **Market Intelligence.** TAM/SAM/SOM chart, policy summary bullets, country-readiness table (SGP, MYS, IDN, THA, VNM, PHL with per-country readiness score + note).
6. **Pricing Strategy.** Recommended tier table (tier name, price SGD/mo, target persona, key inclusions), persona cards with WTP, elasticity callouts.
7. **Whitespace Atlas — 3 sub-pages:**
   - **7a.** Full-bleed orange background. Headline thesis (≤ 20 words) in large type, then 2–3 attack plans as short paragraphs. High-contrast, brand voice.
   - **7b.** Heatmap grid, colour-banded (green/amber/red). Static — cells do not expand in a PDF. Include the axis labels and the colour legend.
   - **7c.** Cell Detail Appendix. **Every green 0–1 cell** listed with its row/col pair, score, and `specialisation_for_cell`. **Every red 4+ cell** listed the same way with the competitors occupying it (so the reader knows who to displace). Amber (2–3) summarised in a compact table — there are too many to list individually and they're not the decision-grade cells. This page exists because the interactive site lets users click cells to reveal specialisations; the PDF can't, so we inline the decision-grade ones explicitly.
8. **Website Design Audit.** Top-10 competitors by `website_design_rating`, one row per competitor with screenshot thumbnail, 5-dimension score breakdown, and auditor notes. If fewer than 10 were audited, show what's available and note the gap.
9. **Appendix: full competitor table.** 20 records per page — id, name, hq, category, threat, beatability, SG monthly, pricing flag. Continue across multiple pages as needed.

## Full-bleed implementation

Each page is a `210mm × 297mm` div (A4 portrait). The **outermost element of each page carries the background colour** — not an inner wrapper, not a body style. This is the single most common full-bleed bug.

```js
const canvas = await html2canvas(pageEl, {
  scale: 2,          // 2× for print-quality raster
  useCORS: true,     // allow cross-origin images (logos, screenshots)
  backgroundColor: null,  // preserve the element's own background
});
pdf.addImage(canvas, 'PNG', 0, 0, 210, 297);  // edge-to-edge, zero offset
```

Zero offset matters. If you `addImage(canvas, 'PNG', 10, 10, 190, 277)` to "leave a margin," the brand-primary cover renders with a white frame around it and looks broken. Margins are a content concern, handled inside the page div with padding, not a PDF placement concern.

Set `scale: 2` universally. `scale: 3` produces ~2× file size with no perceptible sharpness gain at A4 print. `scale: 1` looks soft on retina screens.

**Why `backgroundColor: null`.** The default is white. If you leave it, a full-bleed orange page rasterises with a white layer behind the orange — invisible on screen, because the orange covers it, but present in the canvas. That white layer bleeds through at the 1px edge anti-alias and produces a hairline white border on the full-bleed page. `null` tells html2canvas to preserve the element's own computed background, which is the orange itself.

**Images and `useCORS: true`.** Logos, screenshots, and Agent 6's pre-rendered charts may be loaded from `/template/assets/` (same origin, fine) or from a cloud bucket (cross-origin). Without `useCORS: true`, cross-origin images render as broken placeholders in the canvas. With it, the browser enforces that the image response carries `Access-Control-Allow-Origin`. If an asset refuses CORS, fall back to copying the file into `/template/assets/` at project kick-off — same-origin is always safe.

## TOC (two-pass)

The page-count problem: section 9 (appendix) can span 2–5 pages depending on competitor count; section 7c can span 1–3 pages depending on how many green/red cells there are. Static page numbers in the TOC would be wrong. Solution: two-pass.

**Registry** — an ordered array lives in `report/page-templates.js`:

```js
export const sections = [
  { id: 'cover',        title: null,                      render: renderCover,       countPages: () => 1 },
  { id: 'toc',          title: 'Table of Contents',       render: renderToc,         countPages: () => 1 },
  { id: 'exec',         title: 'Executive Summary',       render: renderExec,        countPages: () => 1 },
  { id: 'landscape',    title: 'Competitor Landscape',    render: renderLandscape,   countPages: () => 1 },
  { id: 'market',       title: 'Market Intelligence',     render: renderMarket,      countPages: () => 1 },
  { id: 'pricing',      title: 'Pricing Strategy',        render: renderPricing,     countPages: () => 1 },
  { id: 'ws-thesis',    title: 'Whitespace — Thesis',     render: renderWsThesis,    countPages: () => 1 },
  { id: 'ws-heatmap',   title: 'Whitespace — Heatmap',    render: renderWsHeatmap,   countPages: () => 1 },
  { id: 'ws-cells',     title: 'Whitespace — Cells',      render: renderWsCells,     countPages: (d) => Math.ceil(d.decisionCells.length / 12) },
  { id: 'website',      title: 'Website Design Audit',    render: renderWebsite,     countPages: () => 1 },
  { id: 'appendix',     title: 'Appendix',                render: renderAppendix,    countPages: (d) => Math.ceil(d.competitors.length / 20) },
];
```

**Pass 1** — `computePageIndex(sections, data)` in `report/toc.js` walks the registry, calls each `countPages(data)`, and returns `{ sectionId: startPage, _total: N }`. Cheap — no rendering, just arithmetic.

**Pass 2** — render each section's pages in order, painting the resolved page number into the footer at render time and into the TOC rows at their position. The TOC section itself is rendered with the fully-resolved map passed in.

Do not attempt to render, measure, and adjust in a single pass. That path leads to off-by-one bugs that show up only on the appendix because competitor counts are variable.

**Worked example — a 32-competitor project:**

`countPages` for the appendix returns `Math.ceil(32 / 20) = 2`. The Cell Detail Appendix has 18 decision-grade cells (green 0–1 plus red 4+) at 12 per page → 2 pages. The registry then resolves to:

| Section | countPages | Page range |
|---|---|---|
| cover | 1 | 1 |
| toc | 1 | 2 |
| exec | 1 | 3 |
| landscape | 1 | 4 |
| market | 1 | 5 |
| pricing | 1 | 6 |
| ws-thesis | 1 | 7 |
| ws-heatmap | 1 | 8 |
| ws-cells | 2 | 9–10 |
| website | 1 | 11 |
| appendix | 2 | 12–13 |
| **Total** | | **13** |

The TOC on page 2 then shows section titles against the start-page column, not the full range. A reader who wants to know where the appendix ends looks at the footer; the TOC is navigation, not a map.

**What can break the page-count pass:**

- A `countPages` function that reads from a field not yet populated (e.g. `data.decisionCells` undefined if Agent 4 hasn't run). Symptom: `NaN` pages, infinite loop in render. Fix: guard every reader with a sensible default and surface the missing-input error in the side panel.
- A countPages function that uses `>` instead of `Math.ceil` arithmetic and misses the last partial page. Symptom: last 2 competitors in the appendix are cropped. Fix: always `Math.ceil(n / perPage)`, never hand-rolled.

## Design-token skinning

`report.css` must use the **same CSS custom properties** as `site.css`: `--brand-primary`, `--brand-accent`, `--ink`, `--paper`, `--font-sans`, `--font-mono`, and the type-scale variables. A fresh project reskins via `project.json` → tokens → both site and PDF; the PDF is not a separate theme.

Never hard-code a hex value or a font name in `report.css`. If you find yourself reaching for `#F26522`, you are breaking the skin boundary — use `var(--brand-primary)` and let the token layer decide. Same for fonts: `font-family: var(--font-sans)`, never the literal family name.

Full-bleed colour pages pull their background from `var(--brand-primary)` (cover) and `var(--brand-accent)` (whitespace thesis 7a). If the project swaps tokens to a teal palette, both pages re-skin with zero code change. That is the test.

## Narrative glue

Each content section (3–8) opens with a **1-paragraph `opening` composed from upstream JSON at render time**. The opening is not hard-coded; it's a template literal that interpolates numbers and names from the JSON, so the narrative reflects the actual data in the actual project. Example for Pricing:

> "Against competitor price bands of S$${min}–S$${max}/mo, our personas top out at S$${maxWTP}/mo — pricing becomes a perception question, not a dollar comparison."

Written as:

```js
const opening = `Against competitor price bands of S$${pricing.band.min}–S$${pricing.band.max}/mo, ` +
                `our personas top out at S$${pricing.maxWTP}/mo — pricing becomes a perception ` +
                `question, not a dollar comparison.`;
```

Each section has its own opening-composer in `report/openings.js`. The composer takes the slice of JSON it needs and returns a string. Keep each under ~280 chars; the opening is a hook, not a chapter. If the data doesn't support the claim (e.g. no personas yet), fall back to a neutral line that doesn't fabricate numbers.

The executive summary does not need a templated opening — it *is* the opening for the whole report.

**Opening templates for each content section:**

- **Competitor Landscape (§4):**
  > "Across ${N} tracked competitors (${seaPct}% SEA-weighted), ${topName} anchors the threat list at rank 1 with ${topShare}% of the on-tool subset; the next four scored within ${spread} points of each other — the field is crowded but winnable."

- **Market Intelligence (§5):**
  > "SG TAM of S$${tam}M narrows to an SOM of S$${som}M over ${horizon} months, gated less by buyer intent than by ${primaryPolicy} — policy is the bottleneck, not demand."

- **Pricing Strategy (§6):** (as specified in the brief)
  > "Against competitor price bands of S$${min}–S$${max}/mo, our personas top out at S$${maxWTP}/mo — pricing becomes a perception question, not a dollar comparison."

- **Whitespace Thesis (§7a):**
  > "${greenCount} green cells on the heatmap, ${redCount} red — the uncontested corner is ${topGreenCell}, and our first move lives there."

- **Website Design Audit (§8):**
  > "Of the ${auditedN} audited sites, median score is ${median}/5 on clarity and ${medianCta}/5 on CTA — the category's design floor is low enough that above-average is a wedge."

Each opening is a one-liner whose only job is to frame the section so the reader knows what they're about to look at. Do not try to summarise the whole section in the opening; that's what the body is for.

## Footer

Every page **except the cover** carries a footer. Monospace, small (8–9pt), positioned `bottom: 8mm`, centred or right-aligned (pick one and hold across all sections):

```
<project> · page N of M · <date>
```

Example: `Lumana · page 7 of 14 · 2026-04-23`. The date is `project.json.date`, not `new Date()` — the report's date-of-record is set at generation, not at printing. `M` is the `_total` from Pass 1; `N` is resolved at render time for each page.

Cover has no footer because it carries the date in the masthead. TOC onward, every page.

## Download UX

`admin/report.html` is where the user triggers generation. Layout:

- **Scrollable preview column (~70% width)** — the same DOM html2canvas will capture. Styled at A4 proportions with page breaks visible. The user scrolls through and verifies visually before hitting Generate.
- **Side panel (~30% width)** — project name, date, "Generate PDF" button, and a `<progress>` element that ticks forward as each page rasterises (`current / total`). Disable the button while generating.
- **Filename** — `<project-slug>-competitive-intelligence-<date>.pdf`. Example: `lumana-competitive-intelligence-2026-04-23.pdf`. The slug comes from `project.json.slug` (already kebab-case by convention); the date is ISO `YYYY-MM-DD`.

No email gate, no auth, no server round-trip. The file is saved via `pdf.save(filename)` — the browser's download dialog is the UX.

**Progress reporting.** Update the `<progress>` element after each page rasterises, not after each section. A user watching a 14-page generation wants a bar that advances 14 times, not 4 times with long pauses. Pair the bar with a small label: `Rendering page 7 of 14 — Whitespace Thesis`. If the bar freezes for >3 seconds on the same page, something is wrong (usually fonts or a CORS-blocked image) — consider logging which page to the console on each tick so a developer can diagnose without instrumenting further.

**Button states.**

- **Before fetch completes** — Generate is disabled, label reads "Loading project data…"
- **Ready** — Generate enabled, label "Generate PDF"
- **Generating** — Generate disabled, label "Generating… (page N of M)"
- **Done** — Generate re-enabled, label reverts to "Generate PDF". Optionally show a small "Last generated HH:MM" timestamp next to the button.
- **Error** — Generate re-enabled, side-panel surfaces the error with the failing section id. Do not silently re-enable as if nothing happened.

## Pitfalls

Three named failure modes. Each has a one-line fix; do not reinvent.

### 1. `position: fixed` breaks html2canvas

**Symptom:** a fixed element (say, a floating "page N" badge) renders at `(0, 0)` of the canvas — top-left corner — instead of its visible screen position. On the PDF, every page has the same badge stacked in the corner of page 1 and nowhere on the others.

**Cause:** html2canvas doesn't implement the full CSS fixed-positioning model against its synthetic viewport. Fixed elements are treated as positioned relative to the canvas origin.

**Fix:** **use `position: relative`** for the page div and `position: absolute` for anything inside it. No fixed headers, no fixed footers — the footer lives inside the page div, positioned `absolute; bottom: 8mm`. If you need something "fixed-looking," fake it with absolute positioning inside each page.

### 2. Fallback fonts render instead of brand fonts

**Symptom:** the cover says `LUMANA` in Arial on the PDF despite the site rendering it in the brand sans on screen. Kerning looks wrong; the masthead feels generic.

**Cause:** html2canvas rasterises whatever the browser paints at capture time. If the brand font is still fetching when capture runs, the browser has painted the fallback (Arial, Helvetica) and that's what gets captured. The font then arrives 200ms later, but the canvas is already baked.

**Fix:** **preload via `<link rel="preload" as="font" type="font/woff2" crossorigin>`** in `report.html` head for every brand font weight used in the report, and `await document.fonts.ready` before calling html2canvas on the first page. Double-check by temporarily setting a `font-family: "Brand Sans", "SYSTEM_FALLBACK_THAT_DOES_NOT_EXIST"` — if the preload is working, the font renders; if not, the browser renders nothing (helpful signal).

### 3. Chart.js canvases capture blank

**Symptom:** the market intelligence page renders with an empty rectangle where the TAM/SAM/SOM chart should be. Axes render, data doesn't — or nothing renders at all.

**Cause:** Chart.js schedules a paint on the next animation frame. html2canvas uses `<canvas>.toDataURL()` — if the canvas hasn't painted yet, the data URL is blank.

**Fix:** **wait for `Chart.afterRender` OR `await new Promise(r => setTimeout(r, 0))` after chart init** — one event-loop tick is enough to let Chart.js paint. Belt-and-braces: wire both, in that order. A `requestAnimationFrame` wait is also valid and sometimes more reliable on slow CPUs.

## Worked end-to-end example: one generation pass

A fully-worked example of what a single "Generate PDF" click does, from button-press to saved file. Assume a 30-competitor Lumana project, date `2026-04-23`.

**Step 1 — preflight (0–50ms).** On DOMContentLoaded, `admin/report.html` fetches all JSON inputs in parallel: `competitors.json`, `market-intelligence.json`, `pricing-strategy.json`, `whitespace-framework.json`, `project.json`. If any 404s, the Generate button stays disabled and the side panel surfaces which file is missing — "Agent 3 output not found" is a more useful error than "undefined is not a function."

**Step 2 — page-count pass (50–80ms).** `computePageIndex(sections, data)` walks the registry. Cover (1) + TOC (1) + exec (1) + landscape (1) + market (1) + pricing (1) + ws-thesis (1) + ws-heatmap (1) + ws-cells (say 2 — 18 decision-grade cells at 12-per-page) + website (1) + appendix (`Math.ceil(30/20) = 2`). Total = **14 pages**. The map is `{ cover: 1, toc: 2, exec: 3, landscape: 4, market: 5, pricing: 6, 'ws-thesis': 7, 'ws-heatmap': 8, 'ws-cells': 9, website: 11, appendix: 12, _total: 14 }`.

**Step 3 — font readiness (80–400ms).** `await document.fonts.ready`. If the brand font is 280KB and this is a cold load, this can stretch to ~400ms. That's fine; the progress bar is `0 / 14` during this time.

**Step 4 — render all pages to DOM (400–900ms).** Each section's `render(data, pageMap)` returns a detached `<div class="report-page">` sized at 210×297mm. These are appended to the preview column in order. No html2canvas yet — this step is pure DOM construction via `h()`.

**Step 5 — wait for chart paint (900–950ms).** Market intelligence and pricing pages include Chart.js canvases. Tick the event loop once (`await new Promise(r => setTimeout(r, 0))`) after Chart init, and register `Chart.afterRender` listeners that resolve a promise per chart. `await Promise.all(chartReady)` before rasterising.

**Step 6 — rasterise, page by page (950ms–6s).** Loop over pages 1..14. For each: `html2canvas(pageEl, { scale: 2, useCORS: true, backgroundColor: null })`, then `pdf.addImage(canvas, 'PNG', 0, 0, 210, 297)`. After each page, update `<progress value={i} max={14}>` and `pdf.addPage()` unless it's the last page. A 14-page report rasterises in ~5 seconds on an M-series Mac; budget 10 seconds on a mid-range Windows laptop.

**Step 7 — save (6s).** `pdf.save('lumana-competitive-intelligence-2026-04-23.pdf')`. The browser's download dialog fires. Re-enable the Generate button. Log nothing to console on success; log the error with the failing page id on failure.

**Total wall time:** ~6 seconds for a 14-page, 30-competitor report. File size ~4–6 MB (well under the 10 MB deliverable-checklist cap) because screenshots are scaled to thumbnail size before capture, not rasterised at full resolution.

**What can go wrong during this pass:**

- Chart.js canvases capture blank — see Pitfall 3 above. Symptom: page 5 renders but has empty chart areas. Fix: confirm the `afterRender` wait resolved.
- Appendix shows 19 records instead of 20 on the first page — off-by-one in the paginator. Cause: usually passing the record slice as `competitors.slice(start, start + 19)` instead of `start + 20`. Fix: test with a 21-record input, not just 30.
- Cell Detail Appendix wraps mid-cell — a single cell's `specialisation_for_cell` is long enough to break across the page-break. Fix: measure before appending; if the next cell doesn't fit, start a new page.
- PDF generation hangs at page 7a — full-bleed orange page. Usually means a logo asset is a cross-origin image without `useCORS`. Fix: check the `useCORS: true` flag, and host logos on the same origin or on a CORS-enabled bucket.

## Re-run protocol

When Agent 8 is dispatched against an existing report folder, the work is purely re-generation — no state survives between runs because the output is a PDF, not a data file. Still, a few things are worth checking before clicking Generate.

- **Confirm every upstream file is current.** Spot-check `meta.research_date` (or equivalent) in each JSON. A report generated off a 4-month-old `competitors.json` is not a "refreshed report" — it's a reprint of stale data with today's footer, which is worse than no report.
- **Delete the previous PDF before generating.** File managers and cloud-sync tools sometimes serve stale cached copies when the new file has the same name. Delete first; generate second.
- **Version the filename only when content differs materially.** The convention is `<slug>-competitive-intelligence-<date>.pdf`. If you regenerate the same day against a tweaked `whitespace-framework.json`, overwrite — same date, same filename. If you regenerate a week later against updated inputs, the new date in the filename makes the versions self-labelling.
- **Preview before saving.** `admin/report.html` shows the same DOM the PDF captures. Scroll it top-to-bottom before clicking Generate. If page 7c looks wrong in the preview, it will look wrong in the PDF.

## Rendering safety

**Page DOM is built exclusively via a `h()` helper** — a tiny `createElement` wrapper — not via `innerHTML` or template-string injection. Example:

```js
const h = (tag, props = {}, children = []) => {
  const el = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => {
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
    else el.setAttribute(k, v);
  });
  children.flat().forEach(c => el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
  return el;
};
```

Rule: **no HTML-string setters anywhere in the renderer.** Competitor names, rationales, and specialisation text all come from JSON that, while authored, is not guaranteed safe. A single unescaped `<` in a rationale breaks the DOM silently and the PDF ships with a broken page. The `h()` helper sets text via `createTextNode`, which cannot inject markup. No exceptions — even "trusted" fields go through `h()`.

This also makes the renderer testable: each section returns a DOM subtree; you can snapshot it, diff it, and re-render it deterministically without the DOM-as-string gymnastics that plague larger frameworks.

## Deliverable checklist

Self-audit against this list before declaring Agent 8 done.

- [ ] All 9 report parts render without a JavaScript error in the console.
- [ ] Generated PDF opens cleanly in `Preview.app` (macOS) and Chrome's built-in PDF viewer.
- [ ] Cover page is full-bleed — brand-primary reaches all four edges, no white frame.
- [ ] TOC page numbers match the actual rendered page numbers (spot-check at least 3: exec summary, whitespace heatmap, appendix first page).
- [ ] Footer appears on every non-cover page with correct `<project> · page N of M · <date>`.
- [ ] Cell Detail Appendix (7c) lists **every green 0–1 cell** and **every red 4+ cell** with `specialisation_for_cell` populated; amber summarised in a table.
- [ ] PDF file size < 10 MB for a 30-competitor sample project. If larger, check screenshot asset compression.
- [ ] Filename is `<project-slug>-competitive-intelligence-<date>.pdf`.
- [ ] Fonts render as brand fonts (not Arial fallback) — visible on cover and executive summary headings.
- [ ] Chart.js visuals appear populated, not blank.
- [ ] No `position: fixed` anywhere in the report stylesheet.
- [ ] `report.css` contains zero hard-coded hex values or font-family literals — only `var(--token)` references.
- [ ] Opening paragraphs on sections 3–8 interpolate real numbers from the JSON (not placeholder text).
- [ ] Preview in `admin/report.html` matches generated PDF, page for page.

If any item fails, fix it before handing the PDF to the project owner. A stale number on the cover or a blank chart on page 5 undermines the credibility of every upstream agent's work.

# semantic-html-audit — Semantic HTML hygiene auditor

The other half of the v2.1 SEO rigor track. Where `schema-jsonld` adds machine-readable structure, this mechanic enforces the **markup itself** is structured: one h1 per page, no skipped heading levels, real landmarks, real alt text, real internal linking.

## What it does

Walks the DOM (or an HTML string in Node) and emits a typed report of semantic-HTML violations. Two modes:

1. **Browser dev banner** — drop into every page; shows red banner on localhost or `?audit=1` if any violations. Mirrors the a11y-axe-runner UX.
2. **Node CLI** — `node audit.js path/to/index.html` returns JSON of violations. Used by Agent 7 for batch audit across a whole site or across the toolkit's shipped fleet.

## When to plug in

**Every page of every site.** Should be running in dev mode (banner) before any new commit, and as part of Agent 7's QA pass before declaring a site shipped.

For the **shipped fleet audit** (one-time backfill), run the Node CLI across each project's `index.html` + key subpages, aggregate scores, produce ranked fix list.

## What it audits — the 8 dimensions

### 1. Heading hierarchy

- **Exactly one `<h1>` per page.** Multiple h1s confuse crawlers and rich-snippet eligibility.
- **No skipped levels.** h1 → h2 → h3 is fine. h1 → h3 (skipping h2) is a violation. Common when devs use heading tags for visual size instead of structure.
- **Headings exist at all.** A page with zero headings is treated as un-structured prose.

### 2. Semantic landmarks

Required (at least one of each, where applicable):

- `<header>` — site/page header
- `<nav>` — primary navigation
- `<main>` — primary page content (exactly one)
- `<footer>` — site footer

Recommended:

- `<article>` for self-contained content blocks (blog posts, product cards)
- `<section>` for thematic groupings within a page
- `<aside>` for sidebars / related links

Pages that wrap everything in `<div>` instead of these landmarks are penalised.

### 3. Image hygiene

Every `<img>` must have:

- **`alt` attribute** — descriptive, not empty (unless decoration, in which case `alt=""` is correct).
- **`width` + `height` attributes** — prevents Cumulative Layout Shift (CLS), a Core Web Vital.
- **`loading="lazy"`** for images below-the-fold (recommended, not strict).

### 4. Internal linking

A content page should link to ≥3 other site pages. Pages that are dead-ends ("orphan pages") rank poorly. The auditor reports links count + warns if <3.

Anchor text quality:
- Bad: "click here", "read more", "learn more"
- Good: "see our pricing", "Phuong's founder story", "Q1 2026 audit results"

### 5. Lang attribute

`<html lang="en">` (or `en-SG`, `zh-Hant`, etc.) is required. Missing lang attribute hurts accessibility and prevents Google from inferring locale.

### 6. Content thinness

Body text word count. Heuristic thresholds:

- <100 words → almost certainly thin / placeholder content
- 100–300 → marketing landing acceptable
- 300+ → content-rich, ideal for SEO

Counts text inside `<main>` only (excludes nav + footer chrome).

### 7. Title + meta description

- `<title>` exists, 30–70 chars, contains site name + page-specific descriptor.
- `<meta name="description">` exists, 80–160 chars, NOT identical to title.
- Multiple titles or descriptions → violation.

### 8. Heading text quality

Soft check: headings shouldn't be just brand name in isolation. "Lumana" as h1 on every page is weak. "Lumana — Aged-care monitoring without cameras" is strong.

---

## Severity model

| Violation | Severity | SEO impact |
|---|---|---|
| No h1 / multiple h1s | high | Confuses crawler; affects rich-result eligibility |
| Skipped heading level | medium | Hurts accessibility + crawl structure |
| `<img>` without alt | high | A11y critical + SEO loss |
| `<img>` without dimensions | medium | CLS penalty (Core Web Vital) |
| Missing `<main>` | high | Crawler can't identify primary content area |
| Missing `<header>`/`<footer>` | low | Soft penalty |
| Missing lang attribute | medium | Locale inference broken |
| <3 internal links | low | Orphan-page risk |
| Bad anchor text ("click here") | low | Soft penalty per link |
| <100 words in `<main>` | medium | Thin-content flag |
| Missing title or meta description | high | Severe SEO loss |

---

## Trade-offs

- **Pro:** Catches the silent-killer SEO issues that no human will spot visually. Fast: ~50ms per page.
- **Pro:** Both runtime (dev banner) and batch-mode (CLI) — one mechanic, two surfaces.
- **Con:** Heuristic thresholds (word counts, link counts) are not absolute — judgement still required.
- **Con:** Doesn't catch sentence-level prose issues (keyword density, readability, structured paragraphs). For those use a separate content audit.

---

## How to use

### Browser mode

Drop the snippet into every page's `<head>` or shared partial. Activates on `localhost` or `?audit=1`. On violation, it logs the report to console + flashes a red banner.

```html
<script src="/assets/js/semantic-html-audit.js" defer></script>
```

### Node CLI mode

```bash
node mechanics/semantic-html-audit/cli.js path/to/index.html
# → JSON report on stdout
```

Or audit a whole site:

```bash
find ./mysite -name "*.html" -not -path "*/node_modules/*" \
  | xargs -I {} node mechanics/semantic-html-audit/cli.js {}
```

Pipe results into a CSV or scoring summary as needed.

### Agent 7 integration

Before declaring a site shipped, Agent 7 runs:

1. axe scan (a11y-axe-runner) — accessibility violations
2. **semantic-html-audit (this mechanic)** — semantic violations
3. mobile-test-harness — viewport sanity check
4. Lighthouse — perf + SEO score

All four go into `qa-report.json`. Each violation creates a candidate pitfall proposal.

---

## Linked pitfalls

- `seo-multiple-h1` — page has 2+ `<h1>` elements. Crawler picks an arbitrary one. Severity: high.
- `seo-heading-skip` — h1 → h3 directly, no h2. Common when devs style for size, not structure. Severity: medium.
- `seo-img-no-alt` — image carries info but `alt` missing or empty. A11y + SEO double-loss. Severity: high.
- `seo-img-no-dimensions` — `<img>` without width/height attributes. CLS penalty hits Core Web Vitals. Severity: medium.
- `seo-no-landmarks` — page wrapped in `<div>` only, no `<main>`/`<header>`/`<footer>`. Crawler can't find primary content. Severity: high.
- `seo-no-lang-attr` — `<html>` without `lang` attribute. Severity: medium.
- `seo-thin-content` — page has <100 words in `<main>`. Severity: medium.
- `seo-no-internal-links` — page has <3 links to other site pages. Severity: low.

---

## Sourced from

- W3C HTML Living Standard sectioning content: https://html.spec.whatwg.org/multipage/sections.html
- Google Search Central — Semantic HTML guidance: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Web Content Accessibility Guidelines (WCAG 2.2) — Heading and landmark requirements
- 2026-Q1 audit of dt-site-creator-shipped sites — common defects: 4/6 sites had multiple h1s on landing page; 5/6 sites had decorative `<img>` without alt; 6/6 sites missed `loading="lazy"` on below-fold images.

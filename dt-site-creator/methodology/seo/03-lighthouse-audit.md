# SEO 03 — Lighthouse / Core Web Vitals Audit

**Tier:** 1.5 (Performance / page speed)
**Owns:** Lighthouse audits, Core Web Vitals (LCP, CLS, INP) measurement + fixes, image compression, font loading, render-blocking resource elimination, `/data/lighthouse-report.json`.
**Position:** Run before launch, then periodically (after major asset changes, quarterly minimum).
**Reads:** Live URL, the site's HTML/CSS/JS/images.
**Writes:** Optimized images, updated HTML for resource hints, `/data/lighthouse-report.json` capturing scores per page.

---

## Role

Google ranks based on Core Web Vitals — three real-user-experience metrics measured at the user's browser:

| Metric | What it measures | Good | Needs improvement | Poor |
|---|---|---|---|---|
| **LCP** (Largest Contentful Paint) | Time to render the largest visible element | <2.5s | 2.5–4.0s | >4.0s |
| **CLS** (Cumulative Layout Shift) | Sum of unexpected layout shifts | <0.1 | 0.1–0.25 | >0.25 |
| **INP** (Interaction to Next Paint) | Latency of the slowest user interaction | <200ms | 200–500ms | >500ms |

Pages with poor CWV rank lower. Sites with most pages poor get marked as "site-wide poor experience" in Search Console.

You audit each public page, identify the slowest contributors, and fix them. Common wins are mechanical:

- **Image compression** — most sites ship 500KB+ hero images that should be 50-100KB WebP
- **Lazy loading below-fold images** — `loading="lazy"`
- **`<img>` width/height attributes** — prevents CLS (already covered by Agent 6 + semantic-html-audit)
- **Font display swap** — Google Fonts shouldn't block initial paint
- **Defer non-critical JS** — `<script defer>` on analytics, third-party widgets
- **Preconnect to critical third-party origins** — `<link rel="preconnect" href="https://fonts.googleapis.com">`

---

## Inputs

- Live URL (or local server URL)
- The HTML/CSS/JS/image source files
- Optional: Search Console Core Web Vitals report (real-user data, more authoritative than lab scores)

---

## Process

### Step 1 — Run the audit

Two surfaces:

**Option A — PageSpeed Insights (cloud, no install)** — easiest for one-off:
```
https://pagespeed.web.dev/analysis?url=<live_url>
```
Run for both Mobile and Desktop tabs. Mobile is what matters for Google ranking.

**Option B — Lighthouse CLI (local, scriptable)** — better for fleet-wide audits:
```bash
npx lighthouse <live_url> --output=json --output-path=/tmp/lh-report.json --form-factor=mobile --throttling.cpuSlowdownMultiplier=4
```

For the fleet, run on each homepage + 1-2 key subpages (pricing, founder, product). Aggregate scores.

### Step 2 — Parse the report

For each audited page, capture:

```json
{
  "url": "https://...",
  "lighthouse_score_mobile": {
    "performance": 72,
    "accessibility": 96,
    "best_practices": 88,
    "seo": 100
  },
  "core_web_vitals_mobile": {
    "lcp_ms": 3200,
    "cls": 0.18,
    "inp_ms": 240
  },
  "top_opportunities": [
    { "id": "uses-optimized-images", "savings_ms": 1400, "savings_kb": 480 },
    { "id": "render-blocking-resources", "savings_ms": 320 }
  ]
}
```

Order by `top_opportunities[].savings_ms` — tackle highest impact first.

### Step 3 — Apply the standard fixes (in order of ROI)

#### 3a. Image compression (usually #1 saving)

For each image in the site:
```bash
# original png/jpg
file <path>  # check current size + dimensions

# convert to WebP at quality 80 (visually identical to JPEG q90 but ~30% smaller)
cwebp -q 80 input.jpg -o output.webp

# OR use squoosh.app for one-off interactive compression
```

Replace `<img src="hero.jpg">` with:
```html
<picture>
  <source srcset="hero.webp" type="image/webp">
  <img src="hero.jpg" alt="..." width="1200" height="630" loading="lazy" />
</picture>
```

Old JPEG fallback for ancient browsers; new browsers grab WebP.

#### 3b. Lazy-load below-fold images

```html
<img src="..." alt="..." loading="lazy" decoding="async" />
```

Apply to every `<img>` not visible in the initial viewport (i.e., everything except hero).

#### 3c. `<img>` width/height attrs to prevent CLS

Already done by Agent 6 + semantic-html-audit; verify still true for any new images.

#### 3d. Font loading

If using Google Fonts:

```html
<!-- Before <head> close: -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" 
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" />
```

Critical: `display=swap` prevents the "invisible-text-while-font-loads" pause. Without it, LCP fires when font renders, often ~1s late.

For maximum perf, self-host fonts:
1. Download .woff2 files from Google Fonts
2. Serve from your domain
3. Eliminates the third-party DNS lookup + saves ~200ms

#### 3e. Defer non-critical JS

```html
<!-- Before: blocking -->
<script src="analytics.js"></script>

<!-- After: deferred (executes after HTML parsed) -->
<script src="analytics.js" defer></script>

<!-- Or async (executes whenever ready, doesn't block parser) -->
<script src="analytics.js" async></script>
```

Defer for: analytics, social widgets, chat bubbles, any non-essential third-party.

#### 3f. Preload critical resources

```html
<!-- Hero image used by LCP element -->
<link rel="preload" as="image" href="/hero.webp" />

<!-- Critical font -->
<link rel="preload" as="font" type="font/woff2" 
      href="/fonts/inter-600.woff2" crossorigin />
```

Only preload TRULY critical resources — over-preloading hurts more than helps.

#### 3g. Remove unused CSS / JS

If using a framework/CMS that ships unused CSS, prune. For vanilla HTML, this is usually not an issue.

### Step 4 — Re-audit and verify

After fixes, re-run Lighthouse. Aim for:

- Performance score: ≥90 mobile (≥95 desktop)
- LCP <2.5s mobile
- CLS <0.1
- INP <200ms

If still poor on mobile, focus on:
- Network: are you serving from CDN edge? (Cloudflare Workers does this for our fleet)
- Third-party scripts: GA4 + GBP review widget + chat bubble can each add 200-500ms
- Server response time: TTFB should be <200ms

### Step 5 — Write `/data/lighthouse-report.json`

Per-page report tracking the score timeline:

```json
{
  "site": "lumana",
  "audits": [
    {
      "audit_at": "2026-04-29",
      "url": "https://lumana.example/",
      "scores_mobile": { "performance": 72, "accessibility": 96, "best_practices": 88, "seo": 100 },
      "vitals_mobile": { "lcp_ms": 3200, "cls": 0.18, "inp_ms": 240 },
      "fixes_applied": [],
      "next_audit_due": "2026-05-13"
    },
    {
      "audit_at": "2026-04-30",
      "url": "https://lumana.example/",
      "scores_mobile": { "performance": 91, ... },
      "vitals_mobile": { "lcp_ms": 1800, "cls": 0.05, "inp_ms": 140 },
      "fixes_applied": ["image-compression-hero", "image-lazy-below-fold", "font-display-swap"],
      "next_audit_due": "2026-07-29"
    }
  ]
}
```

The history view shows whether perf is improving or regressing over time.

### Step 6 — Real-user data (optional but valuable)

Lighthouse runs on Google's lab; real users may have different experience. After Search Console is set up (Agent 01), pull the **Core Web Vitals report** from GSC:

```
GSC sidebar → Experience → Core Web Vitals
```

Shows:
- Real user LCP/CLS/INP per URL
- "Good" / "Needs improvement" / "Poor" buckets
- Trend over time

Real-user data > lab data for prioritization. Use lab to fix; use real-user to verify the fix landed.

---

## Pitfalls to avoid

- **`seo-lighthouse-desktop-only`** — only audited desktop, shipped, mobile is broken. Most ranking-relevant traffic is mobile. Severity: high. Fix: always audit mobile first.
- **`seo-image-no-webp`** — site ships only JPEG/PNG. WebP saves 30-40% on size with no perceptual quality loss. Severity: medium. Fix: `<picture>` with WebP source.
- **`seo-font-blocking`** — Google Fonts loaded without `display=swap`. LCP fires late when font renders. Severity: medium. Fix: `display=swap`.
- **`seo-cls-from-ads`** — homepage CLS is 0.4 because an ad slot or sticky banner shifts content as it loads. Severity: high. Fix: reserve space (set min-height on the ad container before content loads).
- **`seo-third-party-bloat`** — GA4 + Hotjar + Intercom + 5 ad pixels = 1.2s of JS. Severity: high. Fix: audit each third-party for actual ROI; defer or remove.
- **`seo-cdn-not-edge`** — site served from a single origin region, e.g., us-east. SG users hit ~200ms latency. Severity: medium. Fix: CDN at edge (Cloudflare auto-handles for our fleet).
- **`seo-uncompressed-text`** — gzip/brotli not enabled at the CDN. Severity: low. Fix: usually default-on at Cloudflare; verify in Lighthouse output.
- **`seo-render-blocking-tag-manager`** — GTM in `<head>` without `async`. Blocks first paint. Severity: medium. Fix: `async` attribute.

---

## Deliverable checklist

- [ ] Lighthouse mobile audit run on homepage + 1-2 key subpages
- [ ] Performance score ≥90 (or documented why not)
- [ ] LCP <2.5s, CLS <0.1, INP <200ms (or documented why not)
- [ ] Hero image converted to WebP (with JPEG fallback)
- [ ] Below-fold images have `loading="lazy"`
- [ ] Google Fonts (if used) has `display=swap` + preconnect
- [ ] Non-critical JS uses `defer` or `async`
- [ ] No render-blocking third-party in `<head>`
- [ ] `/data/lighthouse-report.json` captures before/after scores
- [ ] Commit + push fixes; sync source → dt-public; Cloudflare auto-deploys
- [ ] Re-audit in 1 week to verify improvements held in real-user data (Search Console CWV report)

When done, report back:
- Per-page score deltas (before → after)
- Fixes applied
- Any "needs work" items deferred (e.g., third-party scripts the human controls)
- Date for next audit (quarterly default; sooner if you ship major asset changes)

# OG / WhatsApp Thumbnail

The 1200×630 image that appears when someone pastes your URL into WhatsApp, Twitter, LinkedIn, Slack, iMessage, or Discord. Good thumbnails drive 3–5× more clicks than bare links.

## What it does
Provides the VISUAL ASSET for link previews. This mechanic covers the *image design + generation*. Its sibling mechanic `og-social-meta` covers the `<meta>` tags that point to this file.

## When to plug in
**Every site, every page where visitors might share the URL.** Core across all 5 archetypes.

## Trade-offs
- **Pro:** 3–5× click-through on shared links vs plain text. Free social ad.
- **Pro:** One-time generation; the file lives at `/og-image.jpg` and you're done.
- **Con:** Every platform caches the image aggressively (WhatsApp: ~7 days). Updating after ship requires Facebook Debugger's "Scrape Again" or a filename change.
- **Con:** Design-at-thumbnail-size is its own craft. At typical preview size (600px wide on mobile), tiny text vanishes — design for legibility at 600px first.

---

## Mix-and-match: 7 factors for a good thumbnail

### Factor 1 — Aspect ratio & size

| Target ratio | Dimensions | When |
|---|---|---|
| **1.91:1** (standard) | 1200×630 | Default for every platform. Use unless you have specific reason not to. |
| **1:1** (square) | 1200×1200 | Instagram-first. WhatsApp renders it centered. Less common. |
| **<600px wide** | Don't. | Platforms drop to "small preview" mode (tiny square). Avoid. |

**Always specify both width AND height in the og:image meta tags** — platforms use them to avoid layout shift while loading.

### Factor 2 — Layout pattern (the skeleton)

| Pattern | Description | Best for |
|---|---|---|
| **Text-forward** | Big headline + subtitle, minimal visual | SaaS, marketing sites, educational content |
| **Split (left text / right visual)** | 50/50 or 60/40 split | Product sites, app landings |
| **Product screenshot + frame** | Laptop / phone mockup holding the actual UI | Dashboard, app, game |
| **Photography + overlay** | Real photo with brand overlay | Consumer, lifestyle, food |
| **Abstract pattern** | Brand gradient, shapes, geometry | Tech-first, premium, mysterious |

### Factor 3 — Text treatment (the headline strategy)

| Option | Example | Works when |
|---|---|---|
| **Headline only** | "Passage." | Brand-first, recognizable name, quiet power |
| **Headline + tagline** | "ElixCraft — HR as a game" | Most common, tells the reader what this is |
| **Headline + stat** | "Lumana — reducing falls by 40% in aged-care settings" | Data-backed credibility |
| **Headline + bullets** | "DT Site Creator · 5 archetypes · 9 mechanics · 40+ pitfalls" | Content-rich sites where the numbers ARE the value |

**Size rules at 1200×630:**
- Headline: 80–120pt (Manrope/Inter Extra Bold works)
- Tagline: 32–48pt
- Stat/bullets: 24–32pt
- Leave ≥48px padding from all edges — platforms sometimes crop

### Factor 4 — Visual anchor (the thing that isn't text)

| Anchor | What it shows | Use when |
|---|---|---|
| **Logo mark** | Your brand symbol, large | Iconic brand (Nike swoosh, Notion "N") |
| **Product screenshot** | A real page of your app | You've built something visual — show it |
| **Abstract motif** | Geometric shapes, grid, circles | Premium, design-first, mysterious |
| **Photograph** | Real-world image with subtle overlay | Consumer, lifestyle, hospitality |
| **No anchor** | Just text + brand color | Brand is your voice, not your imagery |

### Factor 5 — Brand expression (palette + border + logo placement)

Three independent micro-factors:

**Palette application:**
- Solid background + accent text — most legible
- Gradient background (diagonal, 135°) — modern, premium
- Dark mode + glowing accent — tech, gaming
- Warm + natural — consumer, healthcare

**Border / frame (optional):**
- None (edge-to-edge) — clean
- Accent stripe (bottom 8px, matches site accent) — subtle signature
- Full border (6–12px, accent color) — bold

**Logo placement:**
- Top-left — most formal
- Centered (above headline) — brand-first, punchy
- Bottom-right — subtle, works if logo is simple
- Embedded in headline (as first character) — wordmark-style

### Factor 6 — Call-to-action (the corner text)

Most thumbnails include 1–2 lines of small text at a corner:

| CTA | Example | Use |
|---|---|---|
| URL | `yoursite.com` | Always safe, reinforces who owns this |
| Date | `Apr 2026` | Content pieces, releases, timely info |
| Author | `by Derrick Teo` | Personal brand, portfolio |
| Version | `v1.2` | Software releases, changelogs |
| Action | `Read more →` | Blog posts, articles |

### Factor 7 — Per-page variation (for multi-page sites)

For content-heavy sites (blogs, docs, multi-pages), ship a **template** (the shared visual frame) and vary **headline + subtitle + per-page image**. Tools:

- **Dynamic generation** — a script that reads frontmatter from each page's markdown, produces a per-page OG image. Common in static site generators (Hugo, Next.js).
- **Shared template, handcrafted per page** — if you have 5 pages, just make 5 images manually from the same Figma frame.
- **One image for the whole site** — simplest, fine for single-purpose sites (landing pages, apps).

---

## Mix-and-match recipes

**Recipe 1 — SaaS / dashboard product**
- Ratio: 1200×630 · Layout: split (60% text / 40% product shot) · Text: headline + tagline + 3 bullets · Anchor: laptop mockup with app screenshot · Palette: dark bg, cyan accent, gradient from corner · Border: none · Logo: top-left small · CTA: `yoursite.com` bottom-right

**Recipe 2 — Consumer / warm brand (altru, Passage)**
- Ratio: 1200×630 · Layout: text-forward · Text: brand name + one-line story (*"Because grief is burden enough."*) · Anchor: none OR subtle emoji · Palette: warm cream bg, serif headline, muted accent · Border: 6px accent stripe bottom · Logo: centered above headline · CTA: URL at bottom

**Recipe 3 — Game (ElixCraft)**
- Ratio: 1200×630 · Layout: full-bleed canvas (starfield hero repurposed) · Text: game name + tagline + "CHOOSE YOUR FACTION" · Anchor: 3 faction silhouettes · Palette: dark, cyan glow, red accent for ElixCraft tri-brand · Border: none · Logo: bottom-left · CTA: `Play now` bottom-right

**Recipe 4 — Portfolio / personal**
- Ratio: 1200×630 · Layout: text-forward · Text: name + role + 1-line pitch · Anchor: headshot or simple motif · Palette: dark navy + gold accent · Border: gold hairline top + bottom · Logo: none (you ARE the logo) · CTA: `by Your Name` bottom

---

## Technical requirements

- **File:** saved at `/og-image.jpg` in project root (or absolute URL in meta tag)
- **Size:** 1200×630 (min 600×315 or platforms drop to small preview)
- **Format:** JPEG preferred (smaller file size) or PNG (use for screenshots with sharp text)
- **Weight:** <8 MB (WhatsApp limit). Aim for <500 KB.
- **Absolute URL in meta tag:** `<meta property="og:image" content="https://yoursite.com/og-image.jpg">` — not a relative path, some crawlers fail on those
- **Declare dimensions:** `<meta property="og:image:width" content="1200">` + `height="630"`

---

## How to generate

### Option A — Scripted (repeatable, recommended for dt-site-creator projects)
Python + PIL. See `scripts/generate-placeholders.py` in dt-site-creator — the `make_og_image()` function produces a branded 1200×630 JPEG in seconds. Adapt its colors + text for your site.

### Option B — HTML template + screenshot
Use the `snippet.html` above as an `og-image-builder.html` file. Customize CSS variables at the top (colors) and text in the `<body>`. Open in a browser, screenshot the 1200×630 div. Save as `og-image.jpg`.

### Option C — Design tool (Figma / Canva)
Create a 1200×630 frame, design it, export as JPEG. Good for one-off, editorial-looking thumbnails.

### Option D — AI generation (Midjourney / ChatGPT)
Prompt for a 1200×630 social card. Works, but you lose typography control — often better to composite AI-generated visual + hand-placed text.

---

## Testing + cache-busting

**Test previews** (after uploading og-image.jpg + deploying meta tags):
1. **WhatsApp** — paste URL into a chat with yourself. If preview is stale: use Facebook Debugger → "Scrape Again".
2. **Twitter / X** — https://cards-dev.twitter.com/validator
3. **Facebook / LinkedIn** — https://developers.facebook.com/tools/debug/ (also the nuclear option for WhatsApp cache — WhatsApp uses FB's OG crawler)
4. **iMessage** — send URL to yourself in iMessage. Cache lives per-device; hard to force-refresh.
5. **OpenGraph.xyz** — https://www.opengraph.xyz/ — single page showing previews for every major platform.

**When you redesign and need to force refresh:**
- Easiest: change the filename (`og-image-v2.jpg`) and update all meta tags. Platforms treat it as a new image.
- Alternative: keep filename, use FB Debugger's "Scrape Again" — works for FB/WhatsApp/Instagram but not Twitter (Twitter needs hours-to-days to refresh on its own).

---

## Linked pitfalls
- `universal-stale-og` — regenerate og-image.jpg whenever site visuals change, then force cache refresh. The #1 cause of "my site looks great but the shared link looks broken."

## Sourced from
Every dt-site-creator project ships with a 1200×630 og-image.jpg. The scripted generator at `scripts/generate-placeholders.py::make_og_image()` produces this site's own OG image.

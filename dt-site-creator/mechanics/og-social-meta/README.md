# OG / Social Meta

A drop-in `<head>` block of Open Graph + Twitter Card + canonical tags. The bare-minimum ingredients for a WhatsApp-shareable link preview.

## What it does
Every `og:*` and `twitter:*` tag required for rich previews on WhatsApp, Telegram, Slack, Facebook, LinkedIn, Twitter, iMessage, and Discord. Plus a `<link rel="canonical">` for SEO hygiene.

## When to plug in
- **Every site. Mandatory across all 5 archetypes.**

## Trade-offs
- **Pro:** WhatsApp-shared link with a proper preview gets 3-5× more click-through than a bare URL.
- **Pro:** Zero runtime cost — these are static `<meta>` tags.
- **Con:** Requires a 1200×630 OG image at a reachable URL (generate via frontend-design or a Canvas template).
- **Con:** Social platforms cache aggressively. If you update the image, use FB Debugger's "Scrape Again" to force a refresh.

## How to use (3 steps)

1. Copy the snippet into your page's `<head>`.
2. Replace `{{title}}`, `{{description}}`, `{{canonical_url}}`, `{{site_name}}` with real values.
3. Save a 1200×630 image at `<canonical_url>/og-image.jpg`.

## Validators

- https://cards-dev.twitter.com/validator
- https://developers.facebook.com/tools/debug/
- https://www.opengraph.xyz/

Test each page before announcing. WhatsApp is the harshest cache — paste the URL into a chat with yourself before any public share.

## Linked pitfalls
- `universal-stale-og` — regenerate `og-image.jpg` whenever visuals change, then force cache refresh via FB Debugger.

## Per-page variants

For multi-page sites, each page should have its own `og:title` / `og:description` (and ideally its own og-image). Keep `og:site_name` consistent across all pages.

## Sourced from
Used on every dt-site-creator project. The pattern hasn't changed in 3 years because these tags haven't.

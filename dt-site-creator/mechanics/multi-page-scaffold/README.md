# Multi-Page Scaffold

Shared top nav (fixed, glassmorphic) + footer + mobile hamburger menu, with automatic current-page highlighting.

## What it does
Mounts a fixed-position nav bar at the top of any page, plus a footer at the bottom. Reads `<body data-current-page="..."` to decide which nav link gets the `.active` class. At ≤768px viewport, hides the desktop nav and shows a hamburger that toggles a mobile menu panel.

All DOM built via `createElement` — no innerHTML interpolation.

## When to plug in
- **Static informational / Transactional** (core): standard multi-page sites.
- **Simulator / Game / Dashboard** (optional): when you have an About / Pricing / Contact alongside the main app.

## Trade-offs
- **Pro:** One snippet, identical nav across all pages, zero duplication.
- **Pro:** Mobile-tested hamburger pattern.
- **Con:** Configuration is via editing constants in the snippet's JS — not externalized to JSON.
- **Con:** Doesn't do sticky / collapse-on-scroll. Add if your design needs it.

## How to use (3 steps)

1. On every page, set `<body data-current-page="index">` (or `pricing`, `faq`, etc.).
2. Include the snippet once per page.
3. Edit the `NAV_ITEMS` array and `SITE_NAME` / `CTA_LABEL` constants at the top of the script to match your site.

## Testing mobile

**Always test at ≤768px viewport in devtools before commit.** The hamburger JS listener is the #1 thing that breaks silently.

## Linked pitfalls
- `static-mega-index` — use this mechanic to split content across multiple pages (SEO + linkability).
- `static-mobile-untested` — the hamburger is in the snippet, but test it before shipping.

## Sourced from
`casket/nav.html`, `altru/nav.html`, `elitez-security/nav.html`.

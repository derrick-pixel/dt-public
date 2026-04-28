# mobile-test-harness (iframe spot-check at common phone widths)

Single-page tool that loads the live site in 3 iframes — iPhone 13 (390px), Pixel 7 (412px), iPad (768px) — so Agent 7 can spot-check responsive layout without DevTools. Lives at `/mobile-test.html` (gitignored or excluded from sitemap.xml).

## What it does

1. Reads URL from query string: `?url=https://derrick-pixel.github.io/lumana/`.
2. Renders the URL in 3 iframes side-by-side at:
   - iPhone 13 — 390 × 844
   - Pixel 7 — 412 × 915
   - iPad — 768 × 1024
3. Provides "Reload all" and "Inspect" controls.
4. Shows scrollbar visibility per frame (catches horizontal scroll bleed).
5. Optional: page selector dropdown reading from `sitemap.json` so Agent 7 can iterate every page.

## When to plug in

Optional for most archetypes, **core for dashboard-analytics** (mobile-first is mandatory; execs check on phones).

Used by Agent 7 (QA Curator) during the mobile-checks phase. Can also be opened by Derrick during build for human spot-checks.

## How to use

```
# Open in browser (after deploying mobile-test.html)
https://derrick-pixel.github.io/<project>/mobile-test.html?url=https://derrick-pixel.github.io/<project>/
```

Inspects:
- Hamburger menu opens at ≤768px? Test in iPhone + Pixel frames.
- Tap targets ≥44px? Eyeball.
- No horizontal scroll? Frame's scrollbar should be vertical only.
- Text legible without zoom? Compare to browser zoom 100%.
- Admin tables scroll horizontally inside their container (not bleed)?

## Output

Agent 7 fills `qa-report.json.mobile_checks`:

```json
{
  "iphone_13": { "passes": true, "notes": "Hamburger works, tap targets ≥44px" },
  "pixel_7": { "passes": false, "notes": "Footer CTA cut off — test on real device" },
  "ipad": { "passes": true, "notes": "Layout is desktop, no issues" }
}
```

## Trade-offs

- **Pro:** Faster than DevTools — see all 3 widths simultaneously.
- **Pro:** Forces awareness of width variance (390 vs 412 catches edge-case wraps).
- **Pro:** Sharable URL — other reviewers can load `mobile-test.html` and see what Agent 7 saw.
- **Con:** Not a substitute for real-device testing (real iOS Safari has unique quirks: rubber-banding scroll, safe-area insets, viewport unit traps).
- **Con:** Requires the site to be hosted (iframes can't load `file://` URLs reliably).

## Linked pitfalls

- `qa-mobile-not-tested` — site shipped without mobile check. Hamburger broken on phones.
- `ui-mobile-shrink` — 4-col layout horizontal-scrolls on iPhone.
- `dash-mobile-shrink` — dashboard 4-col grid horizontal-scrolls on phone.

## Past uses

(new mechanic shipped 2026-04-28)

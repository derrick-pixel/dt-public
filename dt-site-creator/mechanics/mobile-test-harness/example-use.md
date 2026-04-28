# mobile-test-harness — Example usage

## Pattern: drop in, open, inspect

1. Save `snippet.html` as `/mobile-test.html` in the project root.
2. Add `mobile-test.html` to `.gitignore` OR exclude from sitemap.xml + robots.txt.
3. Open `https://derrick-pixel.github.io/<project>/mobile-test.html?url=https://derrick-pixel.github.io/<project>/` in a browser.
4. See the site at 3 phone widths simultaneously.
5. Iterate via the URL input + "Reload" button.

## Pattern: Agent 7 walks every page

Agent 7 generates a list from `sitemap.json` and visits each in turn:

```
?url=https://derrick-pixel.github.io/lumana/             # home
?url=https://derrick-pixel.github.io/lumana/about.html   # about
?url=https://derrick-pixel.github.io/lumana/admin.html   # admin
?url=https://derrick-pixel.github.io/lumana/admin-insights.html
```

For each, record findings in `qa-report.json.mobile_checks`:

```json
{
  "iphone_13": { "passes": true, "notes": "Hamburger works, tap targets ≥44px, hero readable" },
  "pixel_7": { "passes": true, "notes": "Same as iPhone 13, no Pixel-specific issues" },
  "ipad": { "passes": true, "notes": "Layout falls back to desktop at 768px+" }
}
```

If any frame fails, surface to human and don't write pitfall proposals until fixed.

## Pattern: `?ipad=` toggle

Some projects want only phone widths (iPad is wide enough that desktop layout applies). Add a query param:

```
?url=https://...&iframes=phone-only
```

…and hide the iPad column. Optional extension to the snippet.

## Sourced from

(new mechanic shipped 2026-04-28; codifies "test on actual phones" rule from past pitfall scar tissue)

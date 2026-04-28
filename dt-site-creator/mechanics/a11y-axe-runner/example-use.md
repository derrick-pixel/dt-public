# a11y-axe-runner — Example usage

## Pattern: dev-mode banner on every page

Drop the snippet at the end of every page's `<body>`. Active only on localhost or with `?a11y=1`.

```html
<!-- ... your site content ... -->
<!-- a11y-axe-runner (dev-mode only) -->
<script>
  (function() {
    if (location.hostname !== 'localhost' && !location.search.includes('a11y=1')) return;
    // ... see snippet.html ...
  })();
</script>
</body>
```

## Pattern: Agent 7 batch run

Agent 7 invokes Playwright (or any headless browser tool):

```bash
# Example: with @axe-core/cli
npx -y @axe-core/cli https://derrick-pixel.github.io/lumana/ --save lumana-axe.json
npx -y @axe-core/cli https://derrick-pixel.github.io/lumana/about.html --save lumana-axe-about.json
# ... merge results into qa-report.json
```

Or in-process via Playwright + axe-core npm package — see README "Agent 7's batch runner" section.

## Pattern: qa-report.json output

```json
{
  "axe_violations": [
    {
      "page_id": "home",
      "rule": "color-contrast",
      "severity": "serious",
      "selector": ".hero-subhead",
      "fix_suggestion": "https://dequeuniversity.com/rules/axe/4.10/color-contrast"
    },
    {
      "page_id": "home",
      "rule": "image-alt",
      "severity": "critical",
      "selector": "img.hero-illustration",
      "fix_suggestion": "Add alt attribute. Decorative images should use alt=''."
    },
    {
      "page_id": "admin",
      "rule": "label",
      "severity": "serious",
      "selector": "input[type='search']",
      "fix_suggestion": "Wrap input in <label> or add aria-label."
    }
  ],
  "axe_summary": {
    "critical": 1,
    "serious": 2,
    "moderate": 0,
    "minor": 0
  }
}
```

If `axe_summary.critical > 0` or `axe_summary.serious > 0`, Agent 7 STOPS and surfaces to human. Fix the site before pitfall curation begins.

## Sourced from

(new mechanic shipped 2026-04-28)

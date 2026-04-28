# a11y-axe-runner (browser-side accessibility audit)

Browser-side axe-core integration. Agent 7 (QA Curator) loads this on each page in `sitemap.json.pages[]` and records violations in `qa-report.json.axe_violations[]`.

## What it does

1. Loads axe-core via CDN (~120 KB gzipped) — only in dev mode (controlled by `?a11y=1` query param or `localhost` hostname).
2. After page load, runs `axe.run(document)`.
3. Outputs:
   - Console table of violations grouped by severity (critical / serious / moderate / minor).
   - Visual overlay (toggleable) highlighting violating elements.
   - Structured JSON dumped to `qa-report.json.axe_violations[]` if running under Agent 7.

## When to plug in

Optional for every archetype, **core for dashboard-analytics** (internal tools shipped without a11y are a compliance risk for B2B clients).

Always run BEFORE Agent 7 (QA Curator) writes pitfall proposals — if the site has critical or serious violations, fix them first.

## How to use

### As a dev-mode banner

Add to every page's footer:

```html
<script>
  if (location.hostname === 'localhost' || location.search.includes('a11y=1')) {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.0/axe.min.js';
    s.onload = () => {
      axe.run(document).then(r => {
        if (r.violations.length) {
          console.group('a11y violations');
          console.table(r.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help })));
          console.groupEnd();
        } else {
          console.log('a11y: 0 violations');
        }
      });
    };
    document.head.appendChild(s);
  }
</script>
```

### As Agent 7's batch runner

Agent 7 dispatches a headless browser (Playwright or Puppeteer) that loads each page in `sitemap.json.pages[]`, injects axe-core, and collects results into `qa-report.json`.

```js
// Pseudocode for Agent 7
import { chromium } from 'playwright';
import axeCore from 'axe-core';

const browser = await chromium.launch();
const violations = [];

for (const page of sitemap.pages) {
  const tab = await browser.newPage();
  await tab.goto(brief.live_url + page.path);
  await tab.addScriptTag({ content: axeCore.source });
  const result = await tab.evaluate(() => axe.run());
  result.violations.forEach(v => {
    v.nodes.forEach(n => {
      violations.push({
        page_id: page.id,
        rule: v.id,
        severity: v.impact,
        selector: n.target.join(' '),
        fix_suggestion: v.helpUrl
      });
    });
  });
  await tab.close();
}

qaReport.axe_violations = violations;
await browser.close();
```

## Quality bar

- 0 critical violations
- 0 serious violations
- ≤5 moderate violations (each with tracked fix path)
- Minor violations noted but not blocking

If the site has critical or serious violations, the QA gate fails.

## Trade-offs

- **Pro:** Catches real WCAG issues (contrast, alt text, ARIA labels) automatically.
- **Pro:** axe-core is the industry standard — the same scanner WAVE and DevTools use.
- **Pro:** Dev-mode banner gives feedback during build, not at the end.
- **Con:** axe doesn't catch every issue (subjective ones like reading level). Manual review still helps.
- **Con:** False positives on patterns axe doesn't understand (e.g., `aria-hidden` on a presentational SVG might flag).

## Linked pitfalls

- `qa-skipped-axe` — site shipped without an a11y scan. 12 critical violations on production. Fix: axe scan is non-optional before pitfall curation begins.
- `qa-axe-shipped-violations` — axe scan run, violations seen, but shipped anyway. Fix: critical/serious violations block Agent 7 from proceeding.

## Past uses

(new mechanic shipped 2026-04-28)

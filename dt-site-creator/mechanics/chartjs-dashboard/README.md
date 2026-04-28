# Chart.js Dashboard

Chart.js line/bar chart with two dashboard-specific safeguards baked in: flex-safe sizing and a self-updating "last updated" timestamp.

## What it does
Wraps a Chart.js canvas in a container with `position: relative; height: 300px` and sets `maintainAspectRatio: false` — this avoids the silent flex-collapse bug where charts render as a flat 0-height line.

Shows a "Updated X ago" subtitle that refreshes every 10 seconds so stale data is visible at a glance.

Exposes `window.renderDashboardChart({ title, labels, values, color, datasetLabel })` so your data loader can populate the chart.

## When to plug in
- **Dashboard analytics** (core): mandatory for KPI widgets.
- **Simulator / Transactional** (optional): when visualizing computed results.

## Trade-offs
- **Pro:** Chart.js is mature, responsive, animation-ready, supports many chart types.
- **Pro:** The sizing fix saves 30 minutes of debugging per new dashboard.
- **Con:** 270KB gzip from the CDN. Overkill for a single sparkline — use D3 or SVG for that.

## How to use (3 steps)

1. Drop the snippet into your dashboard page.
2. Replace the demo call in the `DOMContentLoaded` listener with your real data fetch.
3. Call `renderDashboardChart({...})` after your fetch resolves — it automatically refreshes the "Updated" timestamp.

## Customization

- **Chart type:** set `type` option to `'bar'`, `'pie'`, `'doughnut'`, etc.
- **Multiple datasets:** extend `datasets: []` inside the Chart.js config.
- **Auto-refresh data:** combine with polling (backoff-aware — see `dash-poll-hammer`).

## v2 canonical patterns (added 2026-04-28)

These three patterns are now baked into the snippet and Agent 4 must keep them:

### Lazy-init via IntersectionObserver
Charts below the fold cost nothing until they scroll into view. Wrap chart creation in:

```js
const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting && !e.target.dataset.charted) {
      e.target.dataset.charted = '1';
      renderDashboardChart({ canvasEl: e.target, ...config });
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('canvas[data-chart]').forEach(c => obs.observe(c));
```

Saves 100ms+ on first paint when a dashboard has 8+ charts.

### Wait for `Chart.afterRender` before screenshot/PDF
If Agent 8 (Report Generator) wants to capture a chart for PDF export, html2canvas fires before Chart.js finishes rendering. Subscribe to the chart's `afterRender` callback first:

```js
const chart = new Chart(canvas, {
  ...config,
  options: {
    ...config.options,
    animation: {
      onComplete: () => { canvas.dataset.rendered = '1'; }
    }
  }
});

// Later:
await waitFor(() => canvas.dataset.rendered === '1');
const png = await html2canvas(canvas);
```

### Flex-collapse guard (canonical fix)
Parent of canvas MUST have `display: block` (NOT `flex`) and an explicit `height` (`px` or `vh`, not `%`). Inside the canvas wrapper, `position: relative` + Chart.js `maintainAspectRatio: false`. Skipping any of these → flat-line bug.

```html
<div class="chart-wrap" style="display:block; height:320px; position:relative;">
  <canvas id="my-chart"></canvas>
</div>
```

## Linked pitfalls
- `dash-chart-flat` — the sizing fix is already in; don't remove `maintainAspectRatio: false`.
- `dash-no-timestamp` — the updated subtitle is the cheapest way to avoid showing stale data as fresh.

## Sourced from
`eco-dashboard/components/RevenueChart.tsx`, `elitez-csuite/js/gmail-volume-chart.js`. v2 lazy-init + Chart.afterRender patterns added from competitor-intel-template viz work (2026-04).

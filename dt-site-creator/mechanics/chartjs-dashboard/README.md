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

## Linked pitfalls
- `dash-chart-flat` — the sizing fix is already in; don't remove `maintainAspectRatio: false`.
- `dash-no-timestamp` — the updated subtitle is the cheapest way to avoid showing stale data as fresh.

## Sourced from
`eco-dashboard/components/RevenueChart.tsx`, `elitez-csuite/js/gmail-volume-chart.js`.

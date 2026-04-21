# Dashboard-Analytics — Pitfalls

```yaml
- id: universal-no-push
  title: "The site that went live but nobody could see"
  severity: high
  phase: shipping
  story: "Local-only edit."
  source: "Universal"
  fix: |
    git push after every change.
  lesson: "GitHub Pages serves from remote."
  mechanic: null

- id: universal-dark-default
  title: "Another dark-cyan site"
  severity: medium
  phase: planning
  story: "Dark-cyan default."
  source: "Universal"
  fix: |
    colors.html first.
  lesson: "Personality matters."
  mechanic: null

- id: universal-stale-og
  title: "The WhatsApp preview showing last week's site"
  severity: medium
  phase: shipping
  story: "Stale thumbnail."
  source: "Universal"
  fix: |
    Regenerate og-image.jpg.
  lesson: "OG cache."
  mechanic: og-social-meta

- id: universal-no-competitors
  title: "The generic copy"
  severity: medium
  phase: planning
  story: "Skipped research."
  source: "Universal"
  fix: |
    Research 30+.
  lesson: "See the best."
  mechanic: null

- id: dash-baseui-aschild
  title: "The button that wouldn't style"
  severity: medium
  phase: building
  story: "Used base-ui's asChild pattern from a stale tutorial. Styles didn't apply. Spent an hour debugging before realizing base-ui uses render prop."
  source: "eco-dashboard, Apr 2026"
  fix: |
    1. base-ui uses the render prop, NOT asChild.
    2. Example: <Menu render={(props) => <button {...props} />} />
    3. Check base-ui version docs before copying Radix patterns.
  lesson: "base-ui is not Radix. Read the docs, don't paraphrase."
  mechanic: null

- id: dash-onvaluechange-null
  title: "The crash on clear"
  severity: high
  phase: building
  story: "base-ui Select's onValueChange(v) passed null when user cleared selection. Code assumed string, crashed on v.toLowerCase()."
  source: "eco-dashboard, Apr 2026"
  fix: |
    1. Always guard: onValueChange={(v) => v && setFilter(v)}
    2. Or explicit null-check: if (v === null) return;
    3. TypeScript catches this; plain JS does not.
  lesson: "Component APIs pass null more than you think. Guard at the boundary."
  mechanic: null

- id: dash-chart-flat
  title: "The chart that rendered as a line"
  severity: medium
  phase: building
  story: "Chart.js inside a flex container collapsed to 0 height. Showed as a single horizontal line."
  source: "eco-dashboard"
  fix: |
    1. Wrap Chart.js canvas in a div with explicit height: 300px.
    2. Set Chart options: { maintainAspectRatio: false }.
    3. Set the div's display: block or position: relative.
  lesson: "Flexbox plus auto-sized canvas equals collapse. Constrain the container."
  mechanic: chartjs-dashboard

- id: dash-poll-hammer
  title: "The tab that DDOSed the API"
  severity: high
  phase: shipping
  story: "Dashboard polled /api/metrics every 1 second. User left tab open overnight. 86,400 requests logged against a 10K/day quota."
  source: "elitez-csuite Gmail poll"
  fix: |
    1. Base poll interval >= 30 seconds for dashboards.
    2. Exponential backoff on errors (1s -> 2s -> 4s -> max 60s).
    3. Pause polling when document.hidden === true.
    4. Use SWR or similar with built-in dedup / cache.
  lesson: "Background tabs are forever. Respect external quotas."
  mechanic: null

- id: dash-no-timestamp
  title: "The 3-day-old metric"
  severity: medium
  phase: shipping
  story: "Dashboard showed 'Revenue: $47K'. User trusted it. Number was from a failed cron 3 days prior."
  source: "eco-dashboard v1"
  fix: |
    1. Every widget has a 'Last updated X ago' subtitle.
    2. Red-tint the widget when stale beyond threshold (e.g., >1h).
    3. Expose refresh-now button.
  lesson: "Data is timestamped; dashboards that hide the timestamp lie."
  mechanic: null

- id: dash-weak-admin-pw
  title: "The dashboard password anyone could guess"
  severity: critical
  phase: shipping
  story: "Hardcoded admin password was 'admin123'. Shipped publicly. Found in April security audit."
  source: "eco-dashboard security audit, Apr 2026"
  fix: |
    1. No hardcoded passwords in source.
    2. Read from env var or Supabase row.
    3. Minimum 16-char random password, documented in a secrets manager.
    4. Rotate quarterly.
  lesson: "A hardcoded password is a public password."
  mechanic: admin-auth-gate

- id: dash-mobile-shrink
  title: "The desktop dashboard on a 6-inch screen"
  severity: high
  phase: shipping
  story: "Designed at 1440px with 4-column grid. On phone, charts stacked but each chart kept its 600px width — required horizontal scroll."
  source: "eco-dashboard v1"
  fix: |
    1. Design mobile-first: single column, 100% width, stacked.
    2. At 768px+, upgrade to 2-col. At 1200px+, 4-col.
    3. Test on actual phone, not devtools emulation alone.
  lesson: "Dashboards are phone-viewed more than you think. Plan phone first."
  mechanic: null
```

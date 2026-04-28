# Dashboard-Analytics — Agent Dispatch

**Sibling fork recommendation:** **Optional.** Internal tools rarely benefit from competitive intelligence. Fork only if the dashboard is customer-facing (e.g., a SaaS analytics product) or if positioning vs. alternatives is a real concern.

---

## Dispatch order

```
[1] Sibling fork — OPTIONAL (default skip for internal tools)
        ↓ if forked: /data/intel/*.json
[2] Agent 1 (Brief & Archetype Router)
        ↓
[3] Agents 2 + 3 + 5 in parallel
        ↓
[4] Human picks palette (consider whether mode = light is required for long-session readability)
        ↓
[5] Agent 4 (Stitch / UI Composer) — MAY produce Next.js + base-ui scaffold instead of vanilla
        ↓
[6] Agent 6 (SEO / OG / Asset Engineer) — light touch (internal dashboards skip rich OG)
        ↓
[7] Agent 7 (QA & Pitfall Curator) — opt-in
```

Additional non-agent step before Agent 4: write `data-model.md` documenting per-widget data, refresh cadence, auth boundaries. Standard for dashboard-analytics.

---

## Tech-stack deviation

This is the only archetype that may deviate from vanilla HTML/CSS/JS:
- **Default**: vanilla (single-file or multi-page scaffold).
- **Upgrade to Next.js + base-ui** when: routing is non-trivial, server-side rendering is needed (SEO of public-facing analytics), >50 components shared across pages, real-time data via SSE/WebSockets.
- **Upgrade to Streamlit** when: heavy compute (CAPM, DCF, ML) and a Python audience.

Document the tech choice in `brief.json.constraints[]` and in `design-system.json.notes`. Agent 4 reads both.

base-ui specific gotchas (carry over from `pitfalls.md`):
- Use `render` prop, NOT `asChild`.
- `onValueChange` returns `string | null` — guard with `v && v.toLowerCase()`.

---

## Required pages

| Page | Owner | Notes |
|---|---|---|
| `index.html` (or login) | Agents 3 + 4 + 5 | Login screen + 4 hero KPI tiles |
| `dashboard.html` | Agents 3 + 4 + 5 | Main dashboard, **auth-gated** |
| `reports.html` | Agents 3 + 4 + 5 | Optional — PDF export of monthly/quarterly views |
| `colors.html` | Agent 2 | Transient |

Admin pages (admin.html, admin-insights.html) usually NOT shipped — if the dashboard is itself an internal admin, these are redundant. Ship only if there's external positioning to communicate.

---

## Mechanics required

| Mechanic | Always? | Notes |
|---|---|---|
| `og-social-meta` | yes | Mandatory (even for internal — Slack previews matter) |
| `favicon` | yes | Mandatory |
| `multi-page-scaffold` | yes if >1 page | |
| `chartjs-dashboard` | yes | Charts with flex-collapse fix, `Chart.afterRender` wait |
| `localstorage-state` | yes | Filter / view preferences persist |
| `admin-auth-gate` | yes | Auth-gate every dashboard route |
| `palette-tryout` | yes | colors.html |

## Mechanics optional

| Mechanic | When |
|---|---|
| `pdf-pipeline` | reports.html, executive summaries |
| `wizard-form` | Report generators, scenario builders |
| `intel-consumer` | If sibling intel forked |
| `market-funnel` | If sibling intel and dashboard surfaces market context |
| `meta-tags-generator` | If dashboard has any public-facing pages |

---

## Critical conventions

### Last-updated timestamps (mandatory)
Every widget shows "Last updated X minutes ago" or similar. Documented in `chartjs-dashboard` mechanic. If data >1h old, tint the timestamp red.

### Polling backoff (mandatory)
Never naive `setInterval(refresh, 1000)`. Use:
- Base 30s minimum
- Exponential backoff on error (max 5 min)
- Pause when `document.hidden` true
- SWR or stale-while-revalidate library if Next.js

A pitfall (`dash-poll-hammer`) cost 86,400 requests in a single tab — never repeat.

### Mobile-first (mandatory)
Execs check dashboards on phones. Every widget must be readable at 375px wide. No 4-col grids that horizontal-scroll.

### Auth secrets (mandatory)
- No hardcoded passwords in JS source ("admin123" is famous).
- Env vars or sessionStorage hash gate.
- 16+ char random password rotated quarterly.
- Document the rotation in `brief.json.constraints` if site has client SLA.

---

## Skip rules

If `brief.constraints[]` includes:
- `read-only-public` → skip auth-gate; the dashboard is public (e.g., Streamlit financial analysis). Light-mode default.
- `internal-no-charts` → wrong archetype; route to static-informational with admin auth instead.
- `realtime-required` → upgrade to Next.js + base-ui (or Server-Sent Events on vanilla); document in design-system.json.

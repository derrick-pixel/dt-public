# Dashboard-Analytics — Data Contract

JSON files this archetype produces and consumes, plus the data-model documentation that distinguishes it.

---

## Produces (standard 7 + data-model.md)

Standard 7 from FIELD-DICTIONARY.md.

### Plus: `data-model.md` (project-level documentation, not JSON)

Written before Agent 4 builds. Documents:
- **Per-widget data:** what each KPI tile / chart shows. Source (Supabase table, REST endpoint, computed). Refresh cadence (real-time, every 5 min, hourly, daily).
- **Auth boundaries:** which roles see which widgets. RLS policies if Supabase. Token scopes if API.
- **Data freshness:** acceptable staleness per widget. When to red-tint the timestamp.
- **Failure modes:** what to render when the source is down or returns 0 rows.

Example:

```markdown
## Widget: "Plant uptime (last 24h)"
- Source: Supabase view `plant_uptime_24h`
- Refresh: every 5 min
- Stale threshold: 15 min (red-tint after)
- Empty state: "No data — check sensor connectivity"
- Error state: "Source unavailable — last shown value: 87.3% at 14:30"
- Auth: `role: ops_team` or higher
```

---

## Consumes (when sibling intel forked)

| File | Used by | Purpose |
|---|---|---|
| `competitors.json` | Agent 3 (admin), Agent 5 (positioning copy) | If dashboard is customer-facing SaaS |
| `market-intelligence.json` | rare | Only if dashboard surfaces macro context (e.g., market_tracker) |
| `pricing-strategy.json` | rare | Only if pricing is in scope |
| `whitespace-framework.json` | rare | Only if positioning vs. competitors matters |

For internal dashboards, sibling intel is usually skipped.

---

## Minimum viable shapes

### `brief.json` (additions over baseline)
- `constraints[]` includes the tech-stack choice: `tech: "vanilla" | "nextjs" | "streamlit"`
- `constraints[]` documents auth model: `auth: "sessionstorage-hash" | "supabase-auth" | "okta" | …`
- `constraints[]` documents data sources: `data_sources: ["supabase://project-x.public.orders", …]`

### `palette.json` (additions over baseline)
- Status bands required: `--success`, `--warn`, `--error` in EVERY variant
- Mode bias: prefer light for long-session readability unless brief says otherwise

### `sitemap.json` (additions over baseline)
- `dashboard.html.auth_gated: true` (mandatory)
- `auth_gated: true` pages excluded from sitemap.xml automatically

### `design-system.json` (additions over baseline)
- `tech_stack: "vanilla" | "nextjs" | "streamlit"`
- `framework_version: "next@16.0.0" | "streamlit@1.30" | null`
- `data_fetcher: "fetch" | "swr" | "tanstack-query" | "streamlit-native"`
- `polling_strategy: { "base_ms": 30000, "max_ms": 300000, "pause_on_hidden": true }`

### `qa-report.json` (additions over baseline)
- `polling_audit:` did we hit rate limits in 1h tab-open test? (Agent 7 must run this.)
- `mobile_dashboard_audit:` does every widget render on iPhone 13 width?
- `auth_audit:` is dashboard.html unreachable without auth? (try `curl -i /dashboard.html` — must redirect or 401)

---

## State persistence

User filter / view preferences persist via `localstorage-state` mechanic:

```json
{
  "version": 1,
  "filters": {
    "date_range": { "start": "2026-04-01", "end": "2026-04-28" },
    "plant_ids": ["P-01", "P-02"],
    "status": ["active"]
  },
  "view": "table | grid | timeline",
  "updated_at": "2026-04-28T08:30:00Z"
}
```

Versioned. Migrate on schema change. Don't lose filters on refresh.

---

## Failure mode contract

Every widget must handle these states explicitly:

| State | What renders |
|---|---|
| Loading (first fetch) | Skeleton + "Loading…" |
| Loading (refresh) | Existing data + subtle spinner in corner (don't blank the screen) |
| Empty (success, no rows) | "No data — [hint why]" with explicit suggestion |
| Error (source down) | Last-known value + "Source unavailable since HH:MM" + retry button |
| Stale (refresh failed >threshold) | Red-tinted "Last updated X ago" |

Documented per widget in `data-model.md`. Agent 4 implements; Agent 7 verifies.

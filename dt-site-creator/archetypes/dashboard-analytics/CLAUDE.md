# Dashboard / Analytics Archetype Playbook (v1 thin)

Data-heavy internal tools with charts, KPIs, auth-gated routes. Examples: eco-dashboard, elitez-csuite.

## Tech stack deviation (important!)

Unlike static-informational, this archetype may use **Next.js + base-ui** when complexity warrants:
- eco-dashboard: Next.js 16 + React 19 + base-ui + Chart.js
- elitez-csuite: Next.js + Gmail/Calendar/Tasks/Keep integration

Vanilla HTML/CSS/JS is the default for prototypes. Upgrade to Next.js only when the project explicitly requires routing, SSR, or complex state management.

## Inherits from
`archetypes/static-informational/CLAUDE.md` — for the vanilla fallback track.

## Additional v1 rules

1. **Auth-gate every dashboard.** No public analytics. Use `admin-auth-gate` mechanic or proper Supabase/NextAuth.
2. **Last-updated timestamps are mandatory.** Every data widget shows when it was last refreshed.
3. **Polling must back off.** No naive `setInterval(fetch, 1000)`. Use SWR or exponential backoff. Pause when `document.hidden`.
4. **Mobile-first for dashboards.** Most dashboards are checked on phones by execs. Plan mobile layout first.
5. **base-ui gotchas** (if using): use the render prop, not `asChild`. `onValueChange(v)` returns `string|null` — guard with `v && ...`.
6. **Chart.js inside flex containers:** set `maintainAspectRatio: false` or charts flatten to 0 height.

## Deferred to v2
- Full Next.js + base-ui conventions
- Real-time data (SSE, WebSockets)
- Role-based access patterns

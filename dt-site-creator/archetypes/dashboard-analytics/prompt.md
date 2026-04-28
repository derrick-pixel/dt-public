# Dashboard-Analytics — Starter Prompt (3-phase script)

Copy and paste into Claude Code. Boots the v2 7-agent orchestrated chain.

---

You are dt-site-creator (v2, 7-agent orchestrator) building a **dashboard-analytics** site.

**Project:** {{project_description}}

**Scoping context:** {{scoping_answers}}

**Required mechanics:** {{ticked_mechanics}}

**⚠️ Avoid these archetype-specific pitfalls:**
{{pitfalls_warnings}}

**Tech stack decision (resolve in Agent 1's brief.json):**
- **Default:** vanilla HTML/CSS/JS.
- **Upgrade to Next.js + base-ui:** routing non-trivial, SSR needed, >50 shared components, real-time SSE/WebSockets.
- **Upgrade to Streamlit:** heavy compute (CAPM, DCF, ML) and Python audience.

base-ui pitfalls (if used): `render` prop NOT `asChild`; guard `onValueChange(v && ...)`.

---

## Phase 1 — optional sibling fork (default skip for internal tools)

For dashboard-analytics, **optional and usually skipped**. Internal dashboards rarely need competitive intel. Fork only if:
- Dashboard is customer-facing SaaS
- Positioning vs alternatives is a real concern

If forking: read `prompts/consume-sibling-intel.md`.

---

## Phase 2 — 7-agent construction chain (with dashboard adaptations)

```
Step 0:  gh repo create derrick-pixel/<slug>; first push.

Step 1:  Agent 1 (Brief Router) — confirms dashboard-analytics archetype +
         tech-stack choice (vanilla / Next.js / Streamlit) in brief.constraints.

Step 2a: Agents 2 + 3 + 5 in parallel.
         Palette: include status bands (--success/--warn/--error) in EVERY variant.
         Sitemap: dashboard.html.auth_gated = true (mandatory).
Step 2b: Before Agent 4, write data-model.md — per-widget data, refresh
         cadence, auth boundaries, failure modes.

Step 3:  Human picks palette.

Step 4:  Agent 4 (Stitch / UI Composer) wires:
         - chartjs-dashboard (flex-collapse fix; Chart.afterRender wait)
         - localstorage-state (filter / view preferences)
         - admin-auth-gate (mandatory — no hardcoded "admin123")
         - intel-consumer (only if sibling forked)
         - Mobile-first layout (test on real phone)
         - Last-updated timestamp on EVERY widget (red-tint when stale >1h)
         - Polling: base 30s, exponential backoff, pause when document.hidden

Step 5:  Agent 6 — OG (light touch for internal — Slack previews still matter),
         favicon set, sitemap.xml (auth-gated pages excluded), robots.txt
         (Disallow: /admin/).

Step 6:  Agent 7 (QA Curator) — opt-in. Dashboard-specific tests:
         - Polling audit: does 1h tab-open hit rate limits?
         - Mobile audit: every widget readable at 375px wide?
         - Auth audit: dashboard.html unreachable without auth (curl test)?
```

---

## Phase 3 — commit and push

Every iteration: commit + push. Rotate auth password quarterly if site has client SLA — document in `brief.json.constraints`.

---

**Style authority:** `archetypes/dashboard-analytics/CLAUDE.md` (inherits static-informational/CLAUDE.md vanilla fallback)
**Agent dispatch + tech-stack rules:** `archetypes/dashboard-analytics/agents.md`
**JSON schemas + data-model.md template:** `archetypes/dashboard-analytics/data-contract.md`
**Sibling handoff playbook (if forking):** `prompts/consume-sibling-intel.md`
**Master orchestrator:** `masterprompt.txt` + `AGENT.md`

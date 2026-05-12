# Ecosystem Page — Design

**Date:** 2026-05-12
**Status:** Draft (awaiting user review)
**Driver:** dt-site-creator just gained a `backend-backed-app` archetype with 4 integration recipes (magic-link-auth-supabase, cf-zero-trust-static-admin, containerized-fastapi-fly, streamlit-cloud-analytics). These recipes name external services — GitHub, Cloudflare, Supabase, Resend, Fly.io, Streamlit Cloud — plus stack-candidates (Neon, Upstash, Sentry, Railway, Vercel). The site has no visual that shows how these services connect to each other. This spec adds one: a single page that visualizes the production stack as a layered architecture with the 4 recipe paths colored over the top.

---

## 1. Problem

A visitor reading `archetypes/backend-backed-app/` can answer "what does a backend-backed app look like?" but not "how do all these tools fit together?" The methodology archive describes the parts; it doesn't picture the whole.

The 4 integration recipes give 4 different routes through the same set of services. Without a visual, a reader has to mentally compose them by reading 4 separate snippet.html files plus the archetype CLAUDE.md.

## 2. Goals

- A single page that visualizes the entire production-stack ecosystem at a glance.
- Show shipped services AND stack-candidates honestly (candidates visually marked, not hidden).
- Let the reader filter by integration recipe to see "what does the Streamlit path look like vs the containerized FastAPI path?"
- Match the existing dt-site-creator dashboard aesthetic — no new JS dependencies, no design drift.

## 3. Non-goals

- Not an interactive editor (no drag-drop, no rearrange).
- Not a real-time service health monitor (no live status pings).
- Not an archetype overview (stays focused on services and recipes).
- Not a multi-page deep-dive — the page is one screen with one filter dimension.

## 4. Page anatomy

A new top-level page at `ecosystem.html` (7th nav tab, between Showcase and Pitfalls).

### 4.1 Header band

- **Title:** "How it all fits together"
- **Tagline:** "Each project picks a path. The ecosystem is the library of paths."
- **Filter pills row:** `[All paths]` `[🐳 Containerized]` `[🪄 Magic-link]` `[🛡️ CF Zero Trust]` `[📊 Streamlit]`. Active pill highlighted; clicking sets the page filter.

### 4.2 Layered architecture (5 layers, top to bottom)

Each layer is a card with a small-caps label top-left and a row of node tiles inside.

**Layer 1 — Source**
- GitHub (one node — represents `derrick-pixel/*` repos)

**Layer 2 — Build & Deploy**
- GH Pages
- CF Pages
- Streamlit Cloud
- Fly.io
- Vercel *(candidate)*
- Railway *(candidate)*

**Layer 3 — Edge & Auth Gate**
- Cloudflare DNS (the CDN/proxy)
- CF Zero Trust (Google OAuth IdP)

**Layer 4 — App Services**
- Supabase Auth
- Supabase Postgres
- Resend
- Neon *(candidate)*
- Upstash Redis *(candidate)*
- Local docker-compose (pg+pgvector / redis / minio / mailhog)

**Layer 5 — Observability**
- Fly logs
- CF logs
- Sentry *(candidate)*

### 4.3 Connection lines

Between layer boundaries, thin SVG curves connect related nodes. Default state: all lines rendered at `rgba(255,255,255,0.15)` — visible but not loud. Lines are computed at page-load by reading bounding-rects of source and destination nodes; an internal anchor-point system keeps curves clean.

## 5. Recipe path overlay

Four paths cross the same layers, but pick different nodes:

| Path | Color | Nodes it touches |
|---|---|---|
| 🐳 Containerized FastAPI | cyan `#0ea5e9` | GitHub → Fly.io → CF DNS → Supabase Auth + Supabase Postgres + Local docker-compose + Resend → Fly logs |
| 🪄 Magic-link auth | violet `#a78bfa` | GitHub → CF Pages → CF DNS → Supabase Auth + Supabase Postgres + Resend → CF logs |
| 🛡️ CF Zero Trust gate | indigo `#818cf8` | GitHub → CF Pages (or GH Pages proxied) → CF DNS + CF Zero Trust → CF logs |
| 📊 Streamlit Cloud | green `#10b981` | GitHub → Streamlit Cloud (deploy + logs are bundled in the Streamlit Cloud node) |

**Filter behavior:**

- **All paths** (default): every node at full opacity; lines at `rgba(255,255,255,0.15)`.
- **Single path active**: nodes the path touches stay at full opacity with a 2px border in the path color and a subtle glow. Non-path nodes drop to 30% opacity. Lines render only between the path's nodes, in the path color, at 2px width.
- **Hover any node** (any filter state): tooltip with the one-liner from the node's `summary` field (sourced from `ecosystem.json`). For candidates, tooltip ends with "Stack candidate — evaluated, not yet shipped."
- **Click any node**: navigate (same tab) to the node's link. Mechanic-backed nodes go to `mechanics/<id>/` or a relevant archetype section. Candidate nodes go to `archetypes/backend-backed-app/stack-candidates.md` anchor for that tool.

### 5.1 URL hash sync

Filter state syncs to `#path=containerized` (or `magic-link`, `cf-zero-trust`, `streamlit`, or absent for "all"). Loads with the correct filter when a shared link is opened. Browser back/forward updates the filter.

## 6. Visual treatment

- **Background:** site default (dark slate, faint grain) matching existing dashboard pages.
- **Layer cards:** thin border in `--accent` amber (`#ffa657`) at low opacity; label in small caps top-left.
- **Shipped node tiles:** rounded rect, icon (emoji) + service name, white text on slate. Default hover lifts 2px with shadow.
- **Candidate node tiles:** dashed 1px border, 60% opacity, small "Candidate" badge bottom-right.
- **Filter pills:** match existing `.btn` shape from `dashboard/css/style.css`; active pill has filled background in the path color.
- **Connection lines:** 1px default, 2px when path-active, color per path. SVG renders behind nodes (z-index lower).

## 7. Responsive behavior

- **≥1100px:** full 5-layer vertical stack, nodes laid out horizontally per layer. Connection lines render between layer boundaries.
- **600–1100px:** layers stay vertical; nodes wrap to 2-3 per row within a layer. Connection lines still render between layers (more curvy because of node wrapping).
- **<600px:** layers stack vertically; nodes stack vertically within each layer. Connection lines collapse to a single left-side vertical rail with branch points (a simpler visual). Filter pills wrap to multiple rows.

## 8. Data model

`dashboard/data/ecosystem.json` is the single source of truth:

```json
{
  "layers": [
    { "id": "source", "label": "Source", "nodes": ["github"] },
    { "id": "deploy", "label": "Build & Deploy", "nodes": ["gh-pages", "cf-pages", "streamlit-cloud", "fly", "vercel", "railway"] },
    { "id": "edge", "label": "Edge & Auth Gate", "nodes": ["cf-dns", "cf-zero-trust"] },
    { "id": "app", "label": "App Services", "nodes": ["supabase-auth", "supabase-postgres", "resend", "neon", "upstash", "local-compose"] },
    { "id": "observability", "label": "Observability", "nodes": ["fly-logs", "cf-logs", "sentry"] }
  ],
  "nodes": {
    "github": { "label": "GitHub", "icon": "📦", "summary": "Source of truth. derrick-pixel/* repos.", "link": "https://github.com/derrick-pixel", "shipped": true },
    "gh-pages": { "label": "GH Pages", "icon": "📄", "summary": "Static deploy from main branch. Used by dt-site-creator and other public sites.", "link": null, "shipped": true },
    "cf-pages": { "label": "CF Pages", "icon": "☁️", "summary": "Cloudflare static-site deploy. Used by elitez-ai-tender-creator.", "link": "mechanics/cf-zero-trust-static-admin/", "shipped": true },
    "streamlit-cloud": { "label": "Streamlit Cloud", "icon": "📊", "summary": "Python data app hosting. Used by market-tracker, yishun.", "link": "mechanics/streamlit-cloud-analytics/", "shipped": true },
    "fly": { "label": "Fly.io", "icon": "🪂", "summary": "Container deploy. Used by sp-wsg-corenet across backend/cron/staging.", "link": "mechanics/containerized-fastapi-fly/", "shipped": true },
    "vercel": { "label": "Vercel", "icon": "▲", "summary": "Frontend-first deploy with edge functions. Candidate.", "link": "archetypes/backend-backed-app/stack-candidates.md#vercel", "shipped": false },
    "railway": { "label": "Railway", "icon": "🚂", "summary": "Container deploy, Heroku-shaped. Candidate.", "link": "archetypes/backend-backed-app/stack-candidates.md#railway", "shipped": false },
    "cf-dns": { "label": "Cloudflare DNS", "icon": "🌐", "summary": "DNS + proxy + CDN. Front door for everything served via CF.", "link": null, "shipped": true },
    "cf-zero-trust": { "label": "CF Zero Trust", "icon": "🛡️", "summary": "Edge auth gate with Google OAuth IdP. Used for static admin paths.", "link": "mechanics/cf-zero-trust-static-admin/", "shipped": true },
    "supabase-auth": { "label": "Supabase Auth", "icon": "🪄", "summary": "OTP / magic-link sign-in. Used with Resend for email delivery.", "link": "mechanics/magic-link-auth-supabase/", "shipped": true },
    "supabase-postgres": { "label": "Supabase Postgres", "icon": "🐘", "summary": "Hosted Postgres + auth schema. Used by tender-creator, ESOP (in migration).", "link": "mechanics/magic-link-auth-supabase/", "shipped": true },
    "resend": { "label": "Resend", "icon": "✉️", "summary": "Custom-domain SMTP for magic-link emails. SPF+DKIM verified.", "link": "mechanics/magic-link-auth-supabase/", "shipped": true },
    "neon": { "label": "Neon", "icon": "🟢", "summary": "Serverless Postgres with branching. Candidate.", "link": "archetypes/backend-backed-app/stack-candidates.md#neon", "shipped": false },
    "upstash": { "label": "Upstash Redis", "icon": "⚡", "summary": "Serverless Redis with HTTP API. Candidate.", "link": "archetypes/backend-backed-app/stack-candidates.md#upstash", "shipped": false },
    "local-compose": { "label": "Local docker-compose", "icon": "🐳", "summary": "Local pg+pgvector / redis / minio / mailhog stack. Used by sp-wsg-corenet.", "link": "mechanics/containerized-fastapi-fly/", "shipped": true },
    "fly-logs": { "label": "Fly logs", "icon": "📜", "summary": "Structured logs from Fly apps. Default observability for containerized stacks.", "link": null, "shipped": true },
    "cf-logs": { "label": "CF logs", "icon": "📋", "summary": "Cloudflare Workers/Pages request logs. Default for CF-deployed apps.", "link": null, "shipped": true },
    "sentry": { "label": "Sentry", "icon": "📡", "summary": "Error monitoring + tracing. Candidate.", "link": "archetypes/backend-backed-app/stack-candidates.md#sentry-io", "shipped": false }
  },
  "paths": {
    "containerized": {
      "label": "Containerized FastAPI",
      "icon": "🐳",
      "color": "#0ea5e9",
      "nodes": ["github", "fly", "cf-dns", "supabase-auth", "supabase-postgres", "local-compose", "resend", "fly-logs"]
    },
    "magic-link": {
      "label": "Magic-link auth",
      "icon": "🪄",
      "color": "#a78bfa",
      "nodes": ["github", "cf-pages", "cf-dns", "supabase-auth", "supabase-postgres", "resend", "cf-logs"]
    },
    "cf-zero-trust": {
      "label": "CF Zero Trust gate",
      "icon": "🛡️",
      "color": "#818cf8",
      "nodes": ["github", "cf-pages", "gh-pages", "cf-dns", "cf-zero-trust", "cf-logs"]
    },
    "streamlit": {
      "label": "Streamlit Cloud",
      "icon": "📊",
      "color": "#10b981",
      "nodes": ["github", "streamlit-cloud"]
    }
  }
}
```

The data file is hand-maintained but small. Adding or removing a candidate is a one-line JSON edit.

## 9. Files created / modified

**Created:**
- `ecosystem.html` — page shell, nav, layer cards, filter pills. ~250 lines.
- `dashboard/css/ecosystem.css` — layer/node/line styles + responsive breakpoints. ~300 lines.
- `dashboard/js/ecosystem.js` — fetch `ecosystem.json`, render nodes, compute SVG line geometry, handle filter pills + URL hash. ~150 lines.
- `dashboard/data/ecosystem.json` — single source of truth as specified in §8.

**Modified (1-line nav additions):**
- `index.html`, `mechanics.html`, `assembly.html`, `showcase.html`, `pitfalls.html`, `setup.html` — add `Ecosystem` to nav between Showcase and Pitfalls. Also update the mobile-menu list in each.
- Top-level `README.md` — bump nav-tab count from 6 to 7 if it's mentioned.

No JS framework added. No build step changed.

## 10. Out of scope (deferred)

- Archetype-overlay layer (Section 5 candidate option declined): page stays stack-only.
- Real-time service health checks.
- A "compare two paths side-by-side" mode.
- Mobile-specific reflow beyond the breakpoints in §7.

## 11. Acceptance criteria

- [ ] `ecosystem.html` renders at full width with all 5 layers + 18 nodes + correct connection lines.
- [ ] All 4 filter pills work; clicking each highlights its path correctly and dims everything else.
- [ ] URL hash sync works: `#path=containerized` loads with the cyan filter active; clicking [All paths] removes the hash.
- [ ] Hover tooltips show node summaries; candidates have the "Stack candidate" suffix.
- [ ] Click a shipped node → navigates to its mechanic page in same tab.
- [ ] Click a candidate node → navigates to its `stack-candidates.md` anchor in same tab.
- [ ] Page renders cleanly at ≥1100px, 600–1100px, and <600px breakpoints.
- [ ] `Ecosystem` nav tab visible on all 7 existing pages, between Showcase and Pitfalls.
- [ ] No console errors. `node --check dashboard/js/ecosystem.js` passes.
- [ ] Pushed to derrick-pixel/dt-site-creator and mirrored to derrickteo.com.

# dt-site-creator

A methodology archive + interactive dashboard for Derrick Teo's website-building practice.

**Live:** https://derrick-pixel.github.io/dt-site-creator/

## What this is

Six archetype playbooks, 21 reusable mechanics, forty-plus pitfalls — compiled from 20+ past projects. Browse as a dashboard, or point Claude at it for your next project.

## Two ways to use

**Visual (humans):** open [index.html](./index.html) or the live URL. Answer 4 scoping questions, get archetype recommendations, pick mechanics, copy a ready-made prompt for Claude.

**Textual (agents):** tell Claude *"Use dt-site-creator for [project]"* — it reads `archetypes/README.md`, picks the archetype, follows the playbook.

## Running locally

Because the dashboard fetches JSON/markdown from disk, you need to serve it via HTTP (not open `index.html` directly — `file://` blocks fetch under CORS).

```bash
cd dt-site-creator
python3 -m http.server 8000
# Open http://localhost:8000 in your browser
```

Or via any static server (`npx serve`, `live-server`, etc.).

## Structure

- `archetypes/` — 6 playbook folders (static-informational, transactional, simulator-educational, game, dashboard-analytics, backend-backed-app)
- `mechanics/` — 21 reusable Lego bricks (paynow-qr, localstorage-state, admin-auth-gate, canvas-hero, chartjs-dashboard, pdf-pipeline, wizard-form, multi-page-scaffold, og-social-meta, og-thumbnail, favicon + 7 v2 mechanics + 2 v2.1 mechanics + 4 v3 mechanics)
- `dashboard/` — the HTML dashboard (CSS, JS, data, sample gallery)
- `pitfalls.html` — standalone pitfalls wall (filterable by archetype/severity/phase)
- `reference/` — dark/light starter templates
- `scripts/` — placeholder-image generator

## Teach it

Toggle **Teaching mode** in the top-right nav to show the "why" behind each step — designed for onboarding vibe-coders.

## Roadmap

- **v1 (shipped):** breadth — 5 archetypes present, 9 mechanics authored, pitfalls wall, dashboard deployed
- **v1.5 (shipped):** depth on static-informational + transactional, card-flip animations, real past-site screenshots
- **v2 (shipped):** 7 new mechanics (intel-consumer, palette-tryout, stitch-bridge, copy-deck, meta-tags-generator, a11y-axe-runner, mobile-test-harness); 7-agent orchestration architecture
- **v2.1 (shipped):** SEO rigor track — schema-jsonld + semantic-html-audit mechanics
- **v2.3 (shipped):** 6th archetype backend-backed-app; 4 production-stack mechanics (magic-link-auth-supabase, cf-zero-trust-static-admin, containerized-fastapi-fly, streamlit-cloud-analytics); Supabase + Streamlit mechanics now available
- **v3 (next):** trainee account save, verify-scoring.py test coverage expansion

## Contribute

Add a pitfall / mechanic / archetype. Open a PR.

## Design docs

- [Design spec](./docs/specs/2026-04-18-methodology-archive-design.md)
- [v1 implementation plan](./docs/plans/2026-04-18-v1-methodology-archive.md)

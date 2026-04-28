# 00 — dt-site-creator Methodology Overview

**Version:** 2026-04-28
**Audience:** every construction agent reads this first.

---

## Why this paradigm exists

The previous monolithic `masterprompt.txt` (v1, 2026-04-09) tried to encode all of "how Derrick builds sites" in 585 lines. It worked for one agent doing one site, but it had four limits:

1. **Orchestration was implicit.** "Do steps 1–14 in order" buries the dependency graph. No quality gates between steps. No structured handoff.
2. **Schemas drifted.** Every site invented its own `competitors.json`, `personas.json`, `palette.json` shape. No canonical dictionary, no migrations.
3. **No specialist memory.** Every site re-derived its admin page structure, its copy patterns, its OG image rules. No shared methodology to refine.
4. **No curator loop.** When a new pitfall surfaced, it lived as scar tissue in one project. It rarely propagated back into the toolkit.

The sibling repo **competitor-intel-template** demonstrated a fix: split the work into specialist agents with named handoffs, write methodology handbooks the agents read, and add a curator agent that walks finished projects and proposes upgrades back to the toolkit.

dt-site-creator v2 applies that same paradigm to **site construction** (not market intelligence — that's the sibling's job).

---

## What this repo owns vs. what the sibling owns

| dt-site-creator (this repo) | competitor-intel-template (sibling) |
|---|---|
| 5 archetypes (static/transactional/dashboard/simulator/game) | 1 generic intelligence pipeline |
| 7 construction agents | 9 intelligence agents |
| ~12 mechanics (PayNow, OG, localStorage, etc.) | 7 viz + 6 admin pages |
| ~50 pitfalls scoped to construction | ~40 pitfalls scoped to research |
| Output: shipped GitHub Pages site | Output: 4 JSON files + PDF report |

The split is clean: **the sibling answers "what should we build?"; this repo answers "how do we build it?"**

---

## The 7 agents

| # | Agent | One-line role |
|---|---|---|
| 1 | Brief & Archetype Router | Reads brief, picks archetype, decides sibling fork |
| 2 | Palette & Brand Generator | 5 diametrically different palette variants |
| 3 | Information Architect | Pages, nav, admin routes, OG-per-page |
| 4 | Stitch / UI Composer | Stitch screens + design system tokens |
| 5 | Copy & Microcopy Writer | All strings rendered on the site |
| 6 | SEO / OG / Asset Engineer | OG image, meta tags, favicon, sitemap.xml |
| 7 | QA & Pitfall Curator | axe + mobile checks + propose new pitfalls |

Each has a methodology handbook at `methodology/0N-<name>.md` (~400–800 lines) with:
- Inputs (what files/context the agent expects)
- Outputs (what the agent produces, paths)
- Methodology (how to think; rubrics; sources to consult)
- Pitfalls to avoid (cross-references to `pitfalls/`)
- Deliverable checklist (20–40 items, all must tick before handoff)

Each has a dispatch prompt at `prompts/invoke-<name>.md` (self-contained, no conversation context required).

---

## Dispatch graph

```
[optional sibling fork → /data/intel/*.json]
                  │
                  ▼
       Agent 1 — Brief & Archetype Router
                  │
        ┌─────────┼─────────┐
        ▼         ▼         ▼
    Agent 2   Agent 3   Agent 5      (palette ∥ IA ∥ copy)
                  │
                  ▼
       Agent 4 — Stitch / UI Composer
                  │
                  ▼
       Agent 6 — SEO / OG / Asset Engineer (every commit)
                  │
                  ▼
       Agent 7 — QA & Pitfall Curator (last + opt-in)
```

**Why 2/3/5 in parallel:** they own non-overlapping artefacts. Palette is colour. Sitemap is structure. Copy is words. They can be drafted independently and reconciled in Agent 4.

**Why Agent 6 every commit:** OG image must reflect current state. Stale OG is a documented pitfall (`seo-stale-og`).

**Why Agent 7 last and opt-in:** QA against the live site. The agent is the meta-curator, not part of the build chain.

---

## Sibling handoff protocol

If the brief warrants intel (most static-informational and transactional sites do), fork **competitor-intel-template** before dispatching Agent 1. It produces four JSON files:

```
competitors.json              ← Top-5, threat × beatability scoring
market-intelligence.json      ← TAM/SAM/SOM derivation, policy, culture
pricing-strategy.json         ← Personas, NBA, tiers, grants
whitespace-framework.json     ← 8-D canvas, heatmap, attack plans
```

Drop them into `/data/intel/` of the construction repo. From there:

- **Agent 3** reads them to seed `admin.html` and `admin-insights.html` scaffolding.
- **Agent 5** reads `pricing-strategy.personas[].pains[]` to seed hero subhead voice and FAQ.
- **Agent 6** reads `competitors.json` to identify SEO white-space (meta description angles competitors don't use).

dt-site-creator never writes back to `/data/intel/`. Sibling JSON is read-only here.

If the brief is light (single-page marketing, internal tool, game), skip the sibling. Agents 1–7 run standalone.

---

## How an agent works (step-by-step)

When dispatched, an agent:

1. **Reads its handbook** at `methodology/0N-<name>.md` end-to-end.
2. **Reads `FIELD-DICTIONARY.md`** for canonical schemas.
3. **Reads the archetype's `agents.md`** at `archetypes/<archetype>/agents.md` for archetype-specific guidance.
4. **Reads `/data/intel/*.json`** if present and if the agent's handbook says so (only Agents 3, 5, 6).
5. **Drafts its owned artefacts** in `/data/<file>.json` (see FIELD-DICTIONARY for paths).
6. **Self-audits against the deliverable checklist** at the end of the handbook.
7. **Commits with a structured handoff note** for the next agent.
8. **Reports back** with: files written, key decisions, blockers (if any).

Agents do not edit artefacts owned by another agent. If Agent 5 needs a new sitemap entry, it proposes via handoff note — Agent 3 owns the change.

---

## Quality gates (per agent)

Each handbook ends with a deliverable checklist. Examples:

- Agent 2: "5 palettes are diametrically different — check warm/cool, dark/light, muted/vibrant, monochrome/colourful, earthy/neon"
- Agent 3: "Every page has og.title and og.description ≤60/160 chars"
- Agent 5: "No hardcoded copy in HTML — search the repo for any string >12 chars in HTML and verify it's templated from copy.json"
- Agent 6: "og-image.jpg modification time ≥ last commit that changed brand/title/tagline"
- Agent 7: "axe-core scan: 0 critical violations, 0 serious violations"

If any item is unchecked, the agent's work is incomplete. The next agent should not proceed.

---

## The curator loop (how this repo evolves)

Agent 7 (QA & Pitfall Curator) walks finished sites and proposes additions to:

- `archetypes/<name>/pitfalls.md` — new scar-tissue YAML entries
- `methodology/0N-<name>.md` — refined rubrics, new sources
- `mechanics/` — new patterns extracted from 2+ sites
- `archetypes/<name>/agents.md` — archetype-specific dispatch tweaks

Proposals land at `methodology/proposals/<YYYY-MM-DD>-<target>.md`. A human reviews, ✅-marks accepted items, and merges. `METHODS.md` gets a version-bumped entry.

The agent does not edit files directly. It proposes.

Threshold rules (mirroring sibling):
- ADD or MODIFY: ≥2 projects show the pattern, OR ≥50-word generalisation
- DELETE: ≥3 projects unused
- REGRESSION (new pitfall): no count threshold — single occurrence is enough if severity ≥ medium

---

## Structured handoff notes

Every agent commits with a handoff note at the bottom of the commit message:

```
feat(agent-3): sitemap.json + admin route plan

Files written:
  /data/sitemap.json
  /admin.html (skeleton)
  /admin-insights.html (skeleton)

Key decisions:
  - Sibling intel present at /data/intel/, hydrating admin pages
  - 6 public pages, 2 admin pages, 1 colors.html (transient)
  - OG-per-page: distinct og.title for /pricing and /about

Blockers:
  - None — Agents 4 and 5 unblocked

Next agent: 4 (Stitch / UI Composer)
```

This makes the chain auditable. The next agent reads the handoff before starting.

---

## Per-archetype dispatch differences

Each archetype's `agents.md` tunes the chain:

- **static-informational** dispatches all 7. Recommends sibling fork.
- **transactional** dispatches all 7 + invokes mechanics: paynow-qr, localstorage-state, wizard-form. Recommends sibling fork.
- **dashboard-analytics** dispatches all 7 but Agent 4 may produce Next.js + base-ui scaffold instead of vanilla. Sibling fork optional.
- **simulator-educational** dispatches all 7. Agent 5 reads sibling personas only if WTP is in scope.
- **game** dispatches all 7 except sibling fork (skipped — game peers ≠ SaaS).

See each archetype's `agents.md` for the exact dispatch order, parallelism, and skip rules.

---

## What this overview does NOT cover

- Per-agent methodology details — see `methodology/01-*.md` through `07-*.md`
- JSON schemas — see `FIELD-DICTIONARY.md`
- Archetype decision matrix — see `archetypes/README.md`
- Mechanics catalogue — see `mechanics/README.md`
- Pitfall details — see `archetypes/<name>/pitfalls.md`

Read those when you need depth. This file is the orientation map.

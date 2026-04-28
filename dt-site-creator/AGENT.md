# dt-site-creator — Agent Architecture

**Version:** 2026-04-28 (v2 paradigm shift)
**Status:** active

## What this repo is

dt-site-creator is the **construction toolkit** for Derrick Teo's websites. It owns:

- 5 archetypes (static-informational, transactional, dashboard-analytics, simulator-educational, game)
- A library of ~12 reusable mechanics (PayNow QR, OG meta, localStorage state, etc.)
- ~50 documented pitfalls (scar tissue) across all archetypes
- The 7 specialist construction agents documented here

## What this repo is NOT

This repo does NOT own market intelligence. That lives in the sibling repo:

> **competitor-intel-template** — https://github.com/derrick-pixel/competitor-intel-template

The sibling produces four JSON files that dt-site-creator can optionally consume:

```
competitors.json              ← Top-5 + threat × beatability scoring (Agent 1)
market-intelligence.json      ← TAM/SAM/SOM derivation_flow + policy + culture (Agent 2)
pricing-strategy.json         ← Personas + NBA + tiers + grants (Agent 3)
whitespace-framework.json     ← 8-D canvas + heatmap + 3 attack plans (Agent 4)
```

Don't duplicate that work here. Reference it.

## The two-repo handoff

```
┌─────────────────────────────┐         ┌─────────────────────────────┐
│ competitor-intel-template   │  JSON   │ dt-site-creator             │
│ (sibling repo)              │ ──────▶ │ (this repo)                 │
│                             │         │                             │
│ Research/intel agents (1-9) │         │ Construction agents (1-7)   │
│ 4 JSON output files         │         │ Site shipped to GitHub Pages│
└─────────────────────────────┘         └─────────────────────────────┘
       optional upstream                       always runs
```

The handoff is **one-directional** (intel flows into construction; nothing flows back) and **opt-in** (some briefs don't need deep intel).

When sibling JSON is present: Agent 3 (Information Architect) drops it into `/data/intel/` and agents 4–6 read it to seed admin pages, hero copy, and the market-funnel mechanic.

When sibling JSON is absent: the 7-agent chain runs standalone with project-brief inputs only.

## The 7 construction specialists

| # | Specialist | Owns |
|---|---|---|
| 1 | **Brief & Archetype Router** | `brief.json` — scoping answers, archetype pick, sibling-fork decision |
| 2 | **Palette & Brand Generator** | `palette.json` (5 diametrically different) + `colors.html` |
| 3 | **Information Architect** | `sitemap.json` — page list, nav order, admin routes, OG-per-page |
| 4 | **Stitch / UI Composer** | screen designs via Stitch + `design-system.json` |
| 5 | **Copy & Microcopy Writer** | `copy.json` — headlines, taglines, CTAs, FAQ, error toasts |
| 6 | **SEO / OG / Asset Engineer** | `og-image.jpg`, meta tags, `sitemap.xml`, favicon set, `robots.txt` |
| 7 | **QA & Pitfall Curator** | runs axe + mobile checks, proposes new pitfalls back into this repo |

Methodology handbooks for each are at `methodology/0N-<name>.md` (400–800 lines each).
Invocation prompts are at `prompts/invoke-<name>.md` (one-shot dispatch templates).

## Dispatch graph

```
[optional sibling fork → /data/intel/*.json]
                  │
                  ▼
       Agent 1 — Brief & Archetype Router
                  │
        ┌─────────┼─────────┐
        ▼         ▼         ▼
    Agent 2   Agent 3   Agent 5      (palette ∥ IA ∥ copy in parallel)
                  │
                  ▼
       Agent 4 — Stitch / UI Composer
                  │
                  ▼
       Agent 6 — SEO / OG / Asset Engineer (runs on every commit)
                  │
                  ▼
       Agent 7 — QA & Pitfall Curator (last + opt-in)
```

Agents 2, 3, 5 can fire in parallel after Agent 1 because they own non-overlapping artefacts (palette.json, sitemap.json, copy.json). Agent 4 needs all three to compose screens. Agent 6 runs every commit (OG image must be current). Agent 7 runs at the end and is the meta-agent that proposes upgrades to this repo itself.

## How an agent works

Every agent follows the same contract:

1. **Read its own methodology handbook** — `methodology/0N-<name>.md` end-to-end.
2. **Read FIELD-DICTIONARY.md** — the canonical schema for every JSON file produced.
3. **Read the archetype-specific `agents.md`** — which agents fire for the chosen archetype.
4. **Read sibling JSON** if present — `/data/intel/*.json` (only Agents 3, 5, 6).
5. **Produce its owned artefacts** — files listed in the methodology handbook.
6. **Self-audit against the deliverable checklist** — every box must be ticked.
7. **Commit with a structured handoff note** to the next agent.

No agent edits artefacts owned by another agent. Schema changes route through Agent 7 (Pitfall Curator), which proposes them as additions to FIELD-DICTIONARY.md.

## Quality gates

Each methodology handbook ends with a **Deliverable checklist** (20–40 items). The agent self-audits before handing off. If any item is unchecked, the work is not done.

## Curator loop (how this repo evolves)

Agent 7 (QA & Pitfall Curator) runs against finished sites and proposes additions to:

- `pitfalls/` — new scar-tissue entries
- `methodology/0N-<name>.md` — refined rubrics, new sources
- `mechanics/` — promoted reusable patterns
- `archetypes/<name>/` — archetype-specific updates

Proposals land at `methodology/proposals/<YYYY-MM-DD>-<target>.md`. A human reviews, ✅-marks accepted items, and merges. METHODS.md gets a version bump.

The agent does not edit files directly. It proposes.

## How to dispatch (for Claude Code)

```
Agent(
  subagent_type: "general-purpose",
  description: "Run dt-site-creator Agent N",
  prompt: <paste contents of prompts/invoke-<name>.md, with {{placeholders}} filled>
)
```

Each `prompts/invoke-*.md` is a self-contained dispatch template. The receiving agent has no conversation context — the prompt must brief it from scratch. The methodology handbook fills in the depth.

## Backward compatibility

The previous monolithic `masterprompt.txt` (585 lines, dated 2026-04-09) has been retired. Old "use dt-site-creator to build me X" prompts still work — they route to Agent 1 (Brief & Archetype Router), which routes to the right archetype, which dispatches the rest of the chain.

## See also

- `masterprompt.txt` — slim orchestrator (replaces the old monolith)
- `FIELD-DICTIONARY.md` — canonical schemas for every JSON file
- `METHODS.md` — changelog (version-bumped, append-only)
- `methodology/00-overview.md` — paradigm + dispatch graph (this doc, expanded)
- `archetypes/README.md` — decision matrix for picking an archetype
- `archetypes/<name>/agents.md` — per-archetype dispatch order
- `archetypes/<name>/data-contract.md` — JSON schemas the archetype produces

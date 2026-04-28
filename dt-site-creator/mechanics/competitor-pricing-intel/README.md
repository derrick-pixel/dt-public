# competitor-pricing-intel — DEPRECATED (v2, 2026-04-28)

**Status:** Deprecated. Work moved upstream to the sibling repo.

## Why

This mechanic encoded ~80% of what is now formalised as a complete 9-agent pipeline in `competitor-intel-template`. Keeping a thin "intel" mechanic in dt-site-creator caused drift — projects ended up with two parallel competitive analyses that disagreed.

In v2, the boundaries are clean:

- **`competitor-intel-template` (sibling repo)** owns ALL competitive / market / pricing / whitespace work. It produces 4 JSON files via 9 specialist agents.
- **dt-site-creator** consumes those files via the new `intel-consumer` mechanic, then renders them via `market-funnel`, `strategy-canvas-radar`, `segment-need-heatmap`, and `persona-cards` mechanics (the last 4 are not yet shipped — they live in the sibling repo's `template/` folder for now and will be promoted to dt-site-creator once they've appeared in 2+ construction projects per Agent 7's threshold rule).

## What to use instead

Replace any reference to `competitor-pricing-intel` with this two-step:

1. **Fork** `competitor-intel-template` for the project. Run its 9-agent chain. Get 4 JSON files.
2. **Drop** the JSON files into `<construction-project>/data/intel/`.
3. Use **`intel-consumer`** (this repo's mechanics/intel-consumer/) to load them in admin pages.
4. Use sibling-repo viz files (vendored copy) OR write archetype-specific renderers that consume the typed JSON.

See `prompts/consume-sibling-intel.md` for the full handoff playbook.

## Migration

Existing projects (elix-eor, Elitez-marketing-services, xinceai) used this mechanic in v1. They're not affected — their admin pages already shipped. New projects should use the sibling fork pattern.

## What this folder still contains

- `meta.json` — kept so the dashboard (`/index.html`) doesn't break. `fits` updated to all `skip` to mark deprecation.
- `snippet.html` — kept as a historical reference. Don't lift from it for new projects.
- `example-use.md` — kept as a historical reference.
- This `README.md` — points to the new pattern.

The folder will be removed entirely in v2.1 (target: 2026-Q3) once enough projects have migrated to confirm no regression.

## Related v2 mechanics

- `intel-consumer` — bridge: load sibling JSON
- `market-funnel` — viz for TAM/SAM/SOM (planned promotion)
- `strategy-canvas-radar` — viz for 8-D canvas (planned promotion)
- `segment-need-heatmap` — viz for whitespace heatmap (planned promotion)
- `persona-cards` — viz for personas + NBA cards (planned promotion)

## Linked pitfalls (historical)

- `stale-competitor-data` — benchmarks rot in 6–12 months. Now caught by sibling Agent 7 (Methodology Curator).
- `public-pricing-leak` — never publish the atlas itself, only distilled positioning. Still applies.
- `framework-over-insight` — the grid is a tool, not an answer. Still applies.

## Past uses (historical)

- elix-eor (2026-Q1) — flagship: 15×15, 45+ competitors scraped with real SG pricing.
- Elitez Marketing Services (2026-Q1) — 8×8, 25 competitors.
- XinceAI (2026-Q1) — 10×8, 30 competitors.

These projects should NOT be re-run with v2. They're preserved as historical examples. New projects go through the sibling fork.

# AGENT.md — Briefing for AI agents

You are starting a new analytics project based on this template. Read this first.

## What's here

- Eight subagents in `.claude/agents/` — dispatch via `Agent(subagent_type: <slug>)`.
- Nine methodology files in `/methodology/` — each agent reads its paired file first.
- Nine invocation prompts in `/prompts/` — literal text to pass to each agent.
- Scaffold in `/template/` with all visualisations wired on sample data.
- Field dictionary in `/methodology/FIELD-DICTIONARY.md` — canonical schema.

## Agent roster

| # | Slug | Role |
|---|---|---|
| 1 | competitor-research-analyst | Competitor database + Top-5 |
| 2 | market-intelligence-analyst | SG/SEA macro landscape |
| 3 | pricing-strategy-analyst | Personas, NBA, elasticity, tiers |
| 4 | whitespace-blue-ocean-analyst | Strategy canvas + heatmap + attack plans |
| 5 | website-design-auditor | 5-dimension design rubric |
| 6 | data-visualization-engineer | Charts + search UX |
| 7 | methodology-curator | Freshness ritual (meta) |
| 8 | report-generator | Full-bleed PDF compiled from 1–6 |

**File numbering reflects addition order, not workflow.** Workflow order: 1 → 2 → 3 → 4 → 5 → 6 → 8. Agent 7 runs later.

## Starting a new project

1. Read the human's project brief.
2. Update every `/template/data/*.json` `meta` block: `project_name`, `brand_tokens`, `research_date`, `sample_data: false`.
3. For agents 1 → 6: read `/methodology/0N-<slug>.md`, then dispatch with the prompt in `/prompts/invoke-<slug>.md`.
4. Each agent writes to its owned slice of `/template/data/` and `/template/`.
5. Dispatch `report-generator` to produce the PDF.
6. `git add . && git commit && git push`. Pages auto-deploys.

## Rules

- Never ship with `meta.sample_data: true`.
- Every data field must be in `FIELD-DICTIONARY.md` first.
- Whitespace heatmap `cells[*].competitors[]`: each MUST have a pair-specific `specialisation_for_cell` ≤ 120 chars. Generic copy-paste of `strengths` is forbidden.
- Commit after every agent, not just at the end.
- All DOM construction uses the `h()` helper in `/template/assets/js/dom.js`. No HTML-string setters — this template handles user-supplied competitor data.

## When the project is done

Dispatch Agent 7 (methodology-curator) against the finished project. See `/prompts/extract-new-patterns.md`.

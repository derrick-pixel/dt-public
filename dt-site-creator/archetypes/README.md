# Archetypes — Decision Matrix

When Claude is asked to build a new site, **Agent 1 (Brief & Archetype Router)** reads this matrix first, picks the matching archetype, then reads that folder's 7-file contract.

## The 5 Archetypes

| Archetype | Use when | Sibling fork? | Past examples |
|---|---|---|---|
| [static-informational](./static-informational/) | Marketing / content, no transactions | **strongly recommended** | casket, Lumana, vectorsky, XinceAI |
| [transactional](./transactional/) | Users pay, upload, or persist data | **recommended** | altru, discounter, the-commons, quotation-preparer |
| [dashboard-analytics](./dashboard-analytics/) | Data-heavy internal tools, auth-gated | optional | eco-dashboard, elitez-csuite |
| [simulator-educational](./simulator-educational/) | Interactive learning, calculators, scenario engines | optional (only if WTP/pricing in scope) | market_tracker, dtws_works, ELIX-resume |
| [game](./game/) | Goal-driven play, scoring, progression | **skip** | elixcraft |

"Sibling fork" = whether to fork the sibling repo `competitor-intel-template` for upstream intelligence (4 JSON files into `/data/intel/`). See `../prompts/consume-sibling-intel.md`.

## 4-Question Scoping

1. **Who visits?** — public / customers / internal / learners
2. **Do users give you money or data?** — no / one-time / recurring / escrow
3. **Core experience?** — content / interaction / goal
4. **Live data layer?** — no / dashboard / API

Canonical scoring weights in `/dashboard/data/archetypes.json`.

## The 7-File Contract (v2 — 2026-04-28)

Every archetype folder contains exactly seven files:

1. `CLAUDE.md` — the playbook (tech stack + rules + workflow)
2. `prompt.md` — copy-paste starter prompt with `{{placeholders}}` (now a 3-phase script: optional sibling fork → 7-agent chain → commit/push)
3. `examples.md` — past projects that fit
4. `mechanic-fit.md` — which mechanics apply (human summary; `mechanics/<slug>/meta.json` is authoritative)
5. `pitfalls.md` — YAML-front-matter scar-tissue entries
6. **`agents.md`** *(new in v2)* — which of the 7 construction agents fire, in what order, with skip rules per archetype
7. **`data-contract.md`** *(new in v2)* — JSON schemas this archetype produces and consumes (FIELD-DICTIONARY excerpts), plus archetype-specific docs (data-flow.md / data-model.md / scenarios.md / game-design.md / progression-curve.md)

The 5-file contract from v1 still exists — files 1–5 are unchanged. Files 6–7 are additive and align this repo with the sibling 9-agent paradigm.

See `../AGENT.md` for the full dispatch graph and `../methodology/00-overview.md` for the orchestration overview.

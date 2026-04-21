# Archetypes — Decision Matrix

When Claude is asked to build a new site, it reads this matrix first, picks the matching archetype, then reads that folder's 5-file contract.

## The 5 Archetypes

| Archetype | Use when | Past examples |
|---|---|---|
| [static-informational](./static-informational/) | Marketing / content, no transactions | casket, Lumana, vectorsky, XinceAI |
| [transactional](./transactional/) | Users pay, upload, or persist data | altru, discounter, the-commons, quotation-preparer |
| [simulator-educational](./simulator-educational/) | Interactive learning, calculators, scenario engines | market_tracker, dtws_works, ELIX-resume |
| [game](./game/) | Goal-driven play, scoring, progression | elixcraft |
| [dashboard-analytics](./dashboard-analytics/) | Data-heavy internal tools, auth-gated | eco-dashboard, elitez-csuite |

## 4-Question Scoping

1. **Who visits?** — public / customers / internal / learners
2. **Do users give you money or data?** — no / one-time / recurring / escrow
3. **Core experience?** — content / interaction / goal
4. **Live data layer?** — no / dashboard / API

Canonical scoring weights in `/dashboard/data/archetypes.json`.

## The 5-File Contract

Every archetype folder contains exactly:

1. `CLAUDE.md` — the playbook (tech stack + rules + workflow)
2. `prompt.md` — copy-paste starter prompt with `{{placeholders}}`
3. `examples.md` — past projects that fit
4. `mechanic-fit.md` — which mechanics apply (human summary; `mechanics/<slug>/meta.json` is authoritative)
5. `pitfalls.md` — YAML-front-matter scar-tissue entries

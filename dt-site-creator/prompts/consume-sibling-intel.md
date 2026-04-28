# Sibling Intel Handoff: How to consume `competitor-intel-template` outputs

This is not an agent prompt. It's a **playbook** for how dt-site-creator agents read sibling JSON.

The sibling repo `competitor-intel-template` produces 4 JSON files. dt-site-creator agents 3, 5, and 6 consume them. This document explains the contract.

---

## When to fork the sibling

| Archetype | Fork? |
|---|---|
| static-informational | **Strongly recommended** — admin pages are the value prop |
| transactional | **Recommended** — NBA + tiers + whitespace shape the offer |
| dashboard-analytics | Optional |
| simulator-educational | Optional (only if WTP in scope) |
| game | Skip |

Decision is made by Agent 1 (Brief & Archetype Router) and recorded in `brief.json.sibling_intel.fork_recommended`.

---

## How to fork

```bash
cd <where-you-keep-projects>
gh repo fork derrick-pixel/competitor-intel-template --clone --remote=origin --org=derrick-pixel --fork-name=<project>-intel
cd <project>-intel
# run sibling's 9-agent chain per its AGENT.md
```

Sibling's chain produces 4 JSONs at `data/`:
- `competitors.json`
- `market-intelligence.json`
- `pricing-strategy.json`
- `whitespace-framework.json`

Copy them into the construction project:

```bash
mkdir -p <construction-project>/data/intel
cp data/{competitors,market-intelligence,pricing-strategy,whitespace-framework}.json \
   <construction-project>/data/intel/
```

Update `brief.json.sibling_intel.intel_files_present` to list the files.

---

## Schemas (excerpts — see sibling's FIELD-DICTIONARY.md for full)

### competitors.json
- `top_5[]` — array of competitor objects with rationale
- `competitors[]` — full list (≥30 records)
- Each competitor: `id`, `name`, `url`, `hq_region`, `category`, `target_market`, `sg_monthly_sgd`, `pricing_flag`, `features[]`, `strengths[]`, `weaknesses[]`, `threat_level` (1–5), `beatability` (1–5), optional `website_design_rating`, `website_design_notes`, `website_screenshot_path`

### market-intelligence.json
- `tam_sgd`, `sam_sgd`, `som_sgd` — top-line numbers
- `derivation_flow` — structured TAM/SAM/SOM with stages, stacks, equations, results
- `policies[]` — each with `name`, `sentiment`, `effective_date`, `url`, `implication_for_us`
- `cultural_signals[]` — observation + evidence + implication
- `economic_indicators[]` — value + source + implication
- `adoption_patterns` — `sme_penetration_pct`, `mnc_penetration_pct`, `country_readiness` (per country: regulatory + tech_maturity + price_tolerance, 1–5 each)
- `trends[]` — 12–24 month horizon, evidence-dated
- `self_audit` — sibling's own design audit

### pricing-strategy.json
- `personas[]` — name, icp, pains[], current_workaround, wtp_band_sgd (low/expected/upper), next_best_alternative (with numeric S$ cost)
- `pricing_models[]` — candidates scored 1–5 per persona
- `elasticity_heuristics[]` — default medium, low/high backed by evidence
- `recommended_tiers[]` — 3 standard tiers, each with price_sgd, target_persona, what_in[], what_excluded[], psychological_anchor, effective_price_after_psg
- `grants[]` — PSG / EDG / SFEC

### whitespace-framework.json
- `strategy_canvas` — dimensions[], scores per competitor + us, headline_thesis
- `heatmap` — segments × needs grid with cells (per-competitor scores, our_score, verdict)
- `attack_plans[]` — exactly 3, ranked, with niche_name, icp, tam_estimate_sgd, why_gap, why_we_win, gtm

---

## Agent 3 (Information Architect) consumption

Read `competitors.json` and `whitespace-framework.json` to plan `admin.html`. Read `market-intelligence.json`, `pricing-strategy.json`, `whitespace-framework.json` to plan `admin-insights.html`.

Set `sitemap.json.pages[<id>].consumes_intel[]` per page:
- `admin.html` → `["competitors.json", "whitespace-framework.json"]`
- `admin-insights.html` → `["market-intelligence.json", "pricing-strategy.json", "whitespace-framework.json"]`

---

## Agent 5 (Copy Writer) consumption

### Pattern: hero subhead from dominant persona
1. Read `pricing-strategy.json.personas[]`.
2. Find dominant: highest `wtp_band_sgd.expected`.
3. Pick top 1–2 entries from `pains[]`.
4. Write `copy.json.pages.home.hero_subhead` to address those pains in the persona's language.

### Pattern: FAQ from competitor weaknesses
1. Read `competitors.json.competitors[].weaknesses[]`.
2. Cluster repeated weaknesses (e.g., "pricing requires sales call" appears in 4 competitors).
3. Write FAQ Q from the cluster: "How long does setup take?", "Can I see pricing without a call?".
4. Write FAQ A as your differentiator.

### Pattern: value-prop from attack plan
1. Read `whitespace-framework.json.attack_plans[0]` (top-ranked).
2. `attack_plans[0].why_we_win` is your value-prop section heading.
3. `attack_plans[0].why_gap` is your proof-point body.

---

## Agent 6 (SEO Engineer) consumption

### Pattern: meta-description white-space
1. Read `competitors.json.competitors[].website_design_notes` (if Agent 5 of sibling ran).
2. Identify recurring meta-description angles competitors use ("AI-powered", "enterprise-grade", "all-in-one").
3. Avoid those clichés in your `<meta description>`. Lead with a differentiator competitors don't claim.

### Pattern: geo signal
1. Read `market-intelligence.json.adoption_patterns.country_readiness`.
2. If SG `regulatory + tech_maturity + price_tolerance` summed >> other countries: set `<meta name="geo.region" content="SG">`.
3. If multi-country: list them in `<meta name="geo.placename">` order of strength.

---

## Pitfalls when consuming sibling intel

- **intel-stale-fork** — Sibling JSON forked 6 months ago. Pricing landscape has shifted. Severity: medium. Fix: re-run sibling's `02-market-intelligence-analyst.md` if forked >12 months ago.
- **intel-partial-files** — Only `competitors.json` present, not the other 3. Admin-insights renders empty sections. Severity: medium. Fix: either run all 4 sibling agents or omit the dependent admin sections explicitly in `sitemap.json`.
- **intel-fields-missing** — Sibling JSON missing `derivation_flow` (older sibling version). `market-funnel` mechanic crashes. Severity: low. Fix: graceful fallback in mechanic — render flat numbers if `derivation_flow` absent.
- **intel-wrong-direction** — Edited sibling JSON in the construction repo to "fix" something. Sibling and construction now diverge. Severity: high. Fix: sibling JSON is read-only here. Push corrections back to sibling repo's working logs.
- **intel-no-attribution** — Used sibling's persona insights but no source citation in admin-insights.html. Future maintainer can't trace. Severity: low. Fix: render "Source: competitive intelligence run YYYY-MM-DD" footer on admin pages.

---

## Update cadence

Sibling intel ages. Refresh recommendations:

| Field | Refresh after |
|---|---|
| Competitor pricing | 6 months |
| Policies | 12 months |
| Cultural signals | 24 months |
| TAM/SAM/SOM | 12 months unless macro shock |
| Personas | 18 months |
| Attack plans | 12 months |

Agent 7 (Curator) flags stale intel as a `qa-stale-intel` proposal in its run.

# FIELD-DICTIONARY

## 1. Introduction

This file is the canonical schema reference for every JSON data file in `/template/data/`. Every field in any data file must be documented here before first use. There are no silent fields in this project: if a field appears in sample data, a rendered view, or an agent output without being catalogued below, that is a defect. The dictionary exists so agents, human editors, and downstream templates share one source of truth for what each key means, what values it accepts, and what its absence implies.

If you need a new field, you must add it here first, then populate sample data with a concrete example, and only then may agents or views reference it. The ordering matters: dictionary entry, then sample data, then consumption. See Section 9 for the exact add-a-field workflow. When in doubt, assume the field does not exist yet and propose it through the Methodology Curator (Agent 7).

## 2. Shared `meta` block

Every file inside `/template/data/*.json` opens with a `meta` block. This block is identical in shape across files and lets tooling know which project, which brand, and which point-in-time a dataset reflects.

| Field | Type | Required | Description | Example |
|---|---|---|---|---|
| `meta.project_name` | string | yes | Human-readable project name | `"XinceAI 2026"` |
| `meta.brand_tokens` | object | yes | See brand_tokens sub-schema below | `{...}` |
| `meta.research_date` | YYYY-MM-DD | yes | Date of last full refresh of this file | `"2026-04-24"` |
| `meta.sample_data` | boolean | yes | `true` if this is scaffold sample data, `false` for real project data | `false` |

### Sub-schema `meta.brand_tokens`

All string, all required. These tokens feed the rendering layer so swapping projects re-skins the whole template.

| Field | Type | Required | Description |
|---|---|---|---|
| `primary` | string | yes | Primary brand colour (hex or named CSS colour) |
| `secondary` | string | yes | Secondary brand colour |
| `accent` | string | yes | Accent / highlight colour |
| `neutral_dark` | string | yes | Dark neutral (text on light, container on dark themes) |
| `neutral_light` | string | yes | Light neutral (background, surface) |
| `font_display` | string | yes | Display typeface family |
| `font_body` | string | yes | Body typeface family |

## 3. `competitors.json` fields

Top-level shape: `{ meta, top_five[], competitors[] }`. The `meta` block follows Section 2. The `top_five[]` array is documented in Section 4. Each entry inside `competitors[]` must carry the following fields.

| Field | Type | Required | Allowed / range | Description |
|---|---|---|---|---|
| `id` | string | yes | lowercase-with-underscores | Stable unique ID used as foreign key in other files |
| `name` | string | yes |  | Display name |
| `url` | string | yes | valid URL | Homepage URL |
| `category` | string | yes | see Section 8 Enums | Competitor archetype |
| `hq` | string | yes |  | City, Country of headquarters |
| `hq_region` | string | yes | `SEA` \| `APAC` \| `Global` \| `Other` | Region bucket for filtering |
| `target_market` | string[] | yes |  | Customer segments they serve |
| `countries_covered` | string[] | yes |  | Countries where they have paying customers |
| `sg_monthly_sgd` | number or null | yes | `>= 0` or null | Our-market (Singapore) price per month; null if not applicable or not offered in SG |
| `pricing_range_published` | string | yes |  | Human-readable price range as published / triangulated |
| `pricing_flag` | string | yes | `public` \| `partial` \| `hidden_estimated` | How public the price is |
| `primary_value_prop` | string | yes | <= 120 chars | Their one-sentence pitch, paraphrased |
| `features` | string[] | yes |  | Notable features (short phrases) |
| `strengths` | string[] | yes |  | Evidence-anchored strengths |
| `weaknesses` | string[] | yes |  | Evidence-anchored weaknesses |
| `threat_level` | integer | yes | 1-5 | Per rubric in `01-competitor-intel.md` |
| `beatability` | integer | yes | 1-5 | Per rubric in `01-competitor-intel.md` |
| `market_share_estimate_pct` | number or null | yes | 0-100 or null | Only fill if cited or triangulated; otherwise null |
| `research_date` | YYYY-MM-DD | yes |  | Per-record research date (may lag the file-level `meta.research_date`) |
| `website_design_rating` | number or null | yes | 1-10 or null | Per `05-website-design.md` rubric |
| `website_design_notes` | string | yes | <= 160 chars | Required if any website design dimension scored <= 6 |
| `website_screenshot_path` | string | yes |  | Relative path to screenshot inside the repo |

## 4. `top_five[]` array

Curated by Agent 1 (Competitor Intel) per the selection rubric in `01-competitor-intel.md`. Each entry is a lightweight reference pointing back at a full record in `competitors[]`.

| Field | Type | Required | Allowed / range | Description |
|---|---|---|---|---|
| `competitor_id` | string | yes | foreign key to `competitors[].id` | Which competitor this entry describes |
| `rank` | integer | yes | 1-5 | Placement in the curated Top-5 |
| `rationale` | string | yes | <= 200 chars | Why this competitor made the Top-5 |

## 5. `market-intelligence.json` fields

Top-level shape: `{ meta, market_size, policies[], cultural_signals[], economic_signals[], adoption_patterns, trends[] }`. The `meta` block follows Section 2. The rest is below.

### 5.1 `market_size`

| Field | Type | Required | Description |
|---|---|---|---|
| `tam_sgd` | number | yes | Total Addressable Market in SGD |
| `sam_sgd` | number | yes | Serviceable Addressable Market in SGD |
| `som_sgd` | number | yes | Serviceable Obtainable Market in SGD |
| `reasoning` | string | yes | Short prose on how TAM/SAM/SOM were derived |
| `sources[]` | object[] | yes | Citations supporting the numbers |
| `sources[].title` | string | yes | Human title of the source |
| `sources[].url` | string | yes | URL of the source |
| `implication_for_us` | string | yes | What this sizing means for our go-to-market |

### 5.2 `policies[]`

| Field | Type | Required | Allowed | Description |
|---|---|---|---|---|
| `title` | string | yes |  | Short policy name |
| `body` | string | yes |  | 2-4 sentence summary |
| `sentiment` | string | yes | `support` \| `neutral` \| `against` | Directional impact on our category |
| `effective_date` | YYYY-MM-DD | yes |  | When the policy took effect |
| `sunset_date` | YYYY-MM-DD | no |  | When it ends, if known |
| `url` | string | yes |  | Link to primary source |
| `data_as_of` | YYYY-MM-DD | yes |  | When we captured this record |
| `implication_for_us` | string | yes |  | Concrete implication for our plan |

### 5.3 `cultural_signals[]`

| Field | Type | Required | Description |
|---|---|---|---|
| `observation` | string | yes | The cultural / behavioural pattern observed |
| `evidence` | string | yes | Specific evidence with date / source where possible |
| `implication_for_us` | string | yes | What we should do about it |

### 5.4 `economic_signals[]`

| Field | Type | Required | Description |
|---|---|---|---|
| `indicator` | string | yes | Name of the indicator (e.g. "SG SME IT spend YoY") |
| `value` | string | yes | Value with units and period |
| `source_url` | string | yes | Link to primary source |
| `implication_for_us` | string | yes | What we should do about it |

### 5.5 `adoption_patterns`

| Field | Type | Required | Range | Description |
|---|---|---|---|---|
| `sme_penetration_pct` | number | yes | 0-100 | Estimated SME penetration of the category |
| `mnc_penetration_pct` | number | yes | 0-100 | Estimated MNC penetration |
| `note` | string | yes |  | Caveats, definitions, and methodology |
| `country_readiness[]` | object[] | yes |  | Array, one entry per country of interest |
| `country_readiness[].country` | string | yes |  | Country name |
| `country_readiness[].regulatory` | integer | yes | 1-5 | Regulatory readiness |
| `country_readiness[].tech_maturity` | integer | yes | 1-5 | Tech maturity |
| `country_readiness[].price_tolerance` | integer | yes | 1-5 | Price tolerance |

### 5.6 `trends[]`

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | yes | Short trend label |
| `evidence` | string | yes | Evidence with date / source |
| `implication_for_us` | string | yes | What we should do about it |

## 6. `pricing-strategy.json` fields

Top-level shape: `{ meta, personas[], pricing_models[], elasticity_heuristics[], recommended_tiers[], grants[] }`. `meta` follows Section 2.

### 6.1 `personas[]`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes | Persona display name |
| `icp` | string | yes | Ideal customer profile sentence |
| `pains[]` | string[] | yes | Top pains this persona experiences |
| `current_workaround` | string | yes | How they cope today without us |
| `wtp_band_sgd` | object | yes | Willingness to pay band in SGD |
| `wtp_band_sgd.low_anchor` | number | yes | Low anchor price |
| `wtp_band_sgd.expected` | number | yes | Expected price |
| `wtp_band_sgd.upper_stretch` | number | yes | Upper stretch price |
| `nba` | string | yes | Next best alternative (competitor or substitute) |

### 6.2 `pricing_models[]`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes | Model name (e.g. "Per-seat", "Flat monthly", "Usage-based") |
| `rationale` | string | yes | Why this model might work for us |
| `score_by_persona` | object | yes | Map of persona name to 1-5 fit score |
| `score_by_persona.<persona_name>` | integer | yes (at least one) | 1-5 fit score for the named persona |

### 6.3 `elasticity_heuristics[]`

| Field | Type | Required | Allowed | Description |
|---|---|---|---|---|
| `segment` | string | yes |  | Segment name (matches a persona or broader segment) |
| `elasticity_band` | string | yes | `low` \| `medium` \| `high` | Demand elasticity band |
| `evidence` | string | yes |  | Evidence supporting the band |

### 6.4 `recommended_tiers[]`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes | Tier display name |
| `price_sgd` | number | yes | List price in SGD |
| `target_persona` | string | yes | Which persona this tier targets |
| `what_in[]` | string[] | yes | What is included |
| `what_excluded[]` | string[] | yes | What is deliberately excluded |
| `psychological_anchor` | string | yes | The anchor framing used |
| `effective_price_after_psg` | number | yes | Effective price after grant coverage (e.g. PSG) |

### 6.5 `grants[]`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes | Grant name (e.g. "PSG", "EDG", "WDG(JR+)") |
| `coverage_pct` | number | yes | Coverage percentage (0-100) |
| `cap_sgd` | number or null | yes | Cap in SGD, null if uncapped |
| `eligibility` | string | yes | 1-sentence eligibility summary |
| `applies_to_tiers[]` | string[] | yes | Names of `recommended_tiers[].name` this grant applies to |

## 7. `whitespace-framework.json` fields

Top-level shape: `{ meta, strategy_canvas, heatmap, attack_plans[] }`. `meta` follows Section 2.

### 7.1 `strategy_canvas`

| Field | Type | Required | Description |
|---|---|---|---|
| `headline_thesis` | string | yes | The one-sentence whitespace thesis |
| `dimensions[]` | object[] | yes | Radar dimensions |
| `dimensions[].key` | string | yes | Short key used inside `scores` |
| `dimensions[].label` | string | yes | Human label shown in the view |
| `scores` | object | yes | Map of `<competitor_id>` to per-dimension score map |
| `scores.<id>.<dim_key>` | number | yes | Score 0-5 for that competitor on that dimension |

### 7.2 `heatmap`

| Field | Type | Required | Description |
|---|---|---|---|
| `segments[]` | object[] | yes | Row axis of the heatmap |
| `segments[].id` | string | yes | Stable segment id |
| `segments[].name` | string | yes | Display name |
| `segments[].descriptor` | string | yes | Short descriptor |
| `needs[]` | object[] | yes | Column axis of the heatmap |
| `needs[].id` | string | yes | Stable need id |
| `needs[].name` | string | yes | Display name |
| `needs[].short` | string | yes | Short label for cramped UI |
| `cells` | object | yes | Map keyed `<segment_id>:<need_id>` |
| `cells.<seg_id>:<need_id>.our_score` | number | yes | Our capability score 0-5 for this cell |
| `cells.<seg_id>:<need_id>.competitors[]` | object[] | yes | Per-competitor scoring for this cell |
| `cells.<seg_id>:<need_id>.competitors[].id` | string | yes | Foreign key to `competitors[].id` |
| `cells.<seg_id>:<need_id>.competitors[].name` | string | yes | Denormalised competitor name |
| `cells.<seg_id>:<need_id>.competitors[].score` | number | yes | Score 0-5 for this cell |
| `cells.<seg_id>:<need_id>.competitors[].specialisation_for_cell` | string | yes | <= 120 chars, pair-specific |

**Important**: `specialisation_for_cell` must be **pair-specific** (this competitor for this exact segment-need cell) and must **never** be a generic copy of `competitors[].strengths`. If a cell ends up with identical specialisation strings across competitors, or strings that read as generic strengths rather than cell-specific specialisations, the heatmap is wrong and must be re-done.

### 7.3 `attack_plans[]`

| Field | Type | Required | Description |
|---|---|---|---|
| `rank` | integer | yes | Ordering of the attack plan (1 = top priority) |
| `niche_name` | string | yes | Short name of the whitespace niche |
| `icp` | string | yes | Ideal customer profile for this niche |
| `tam_estimate_sgd` | number | yes | Estimated TAM for this niche in SGD |
| `tam_reasoning` | string | yes | How the TAM was derived |
| `why_gap` | string | yes | Why competitors have left this gap |
| `why_we_win` | string | yes | Why we are positioned to win it |
| `gtm` | object | yes | Go-to-market sub-object |
| `gtm.channel` | string | yes | Primary acquisition channel |
| `gtm.pitch` | string | yes | One-sentence pitch |
| `gtm.pricing` | string | yes | Pricing shape for this niche |
| `gtm.content` | string | yes | Content / proof strategy |

## 8. Enumerations (canonical values)

These are the canonical values for all enum fields. Spelling, case, and punctuation must match exactly.

- `category`: `global_incumbent` | `sg_local` | `regional_challenger` | `diy_alternative` | `adjacent` | `big_si`
- `hq_region`: `SEA` | `APAC` | `Global` | `Other`
- `pricing_flag`: `public` | `partial` | `hidden_estimated`
- `sentiment` (policies): `support` | `neutral` | `against`
- `elasticity_band`: `low` | `medium` | `high`
- `threat_level`, `beatability`: integer 1-5
- Scoring bands:
  - 0-5 for radar dimensions (`strategy_canvas.scores`) and heatmap cell scores (`our_score`, `competitors[].score`)
  - 1-5 for `threat_level`, `beatability`, `country_readiness.*`, and `pricing_models.score_by_persona.*`
  - 1-10 for `website_design_rating`

## 9. Adding a new field

1. **Propose via the Methodology Curator (Agent 7)**. See `07-methodology-curator.md`. The Curator is the only agent authorised to mutate methodology; every other agent proposes a delta and the Curator decides. The proposal must include why the existing fields are insufficient, which agent would populate the new field, and which view or calculation would consume it.

2. **Document in THIS file (FIELD-DICTIONARY.md) first**, before any data or code changes. Specify the field's full path (e.g. `competitors[].my_new_field`), its type, its required flag, its allowed values or range, a 1-sentence description, and at least one concrete example value. If the field is an enum, add it to Section 8 in the same change.

3. **Update at least one example in sample data** so agents have a concrete template to copy from. No silent fields: if the dictionary lists a field but no sample row uses it, agents will not learn it exists. The rule is strict: dictionary entry first, sample data second, consumers third. Any PR that reverses that order should be rejected.

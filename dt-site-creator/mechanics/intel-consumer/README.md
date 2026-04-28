# intel-consumer (sibling JSON bridge)

The bridge between **competitor-intel-template** (sibling repo) and **dt-site-creator** (this repo). Loads sibling JSON files from `/data/intel/` and exposes them as a typed JS module other mechanics + admin pages can render against.

## What it does

Provides a single `loadIntel()` function that:
1. Fetches all 4 sibling JSONs (or whichever subset is present at `/data/intel/`).
2. Validates basic shape (presence of expected top-level keys).
3. Returns a typed object: `{ competitors, marketIntelligence, pricingStrategy, whitespaceFramework }`.
4. Surfaces missing files as a structured warning (not a hard error) so admin pages can render fallback content.

This mechanic does NOT own visualisation. It owns loading + typing. Pair with:
- `market-funnel` — renders TAM/SAM/SOM from `marketIntelligence.derivation_flow`
- `strategy-canvas-radar` — renders 8-D radar from `whitespaceFramework.strategy_canvas`
- `segment-need-heatmap` — renders heatmap from `whitespaceFramework.heatmap`
- `persona-cards` — renders personas + NBA from `pricingStrategy.personas`

## When to plug in

Whenever the project's `brief.json.sibling_intel.fork_status === "complete"` and any of the 4 JSONs exist at `/data/intel/`. Required for static-informational and transactional admin pages; optional for dashboard-analytics; skip for game.

## How to use

```js
import { loadIntel } from './assets/js/intel-consumer.js';

const intel = await loadIntel('/data/intel/');

if (intel.competitors) {
  renderCompetitorTable(intel.competitors);
}
if (intel.marketIntelligence?.derivation_flow) {
  renderMarketFunnel(intel.marketIntelligence.derivation_flow);
}
if (intel.warnings.length) {
  console.warn('intel-consumer:', intel.warnings);
  // render fallback / "data coming soon" banner
}
```

The returned object always has these keys (any can be `null` if file absent):
```ts
{
  competitors: CompetitorsJson | null,
  marketIntelligence: MarketIntelligenceJson | null,
  pricingStrategy: PricingStrategyJson | null,
  whitespaceFramework: WhitespaceFrameworkJson | null,
  warnings: string[],     // missing files, shape mismatches
  loaded_at: string       // ISO timestamp
}
```

## Trade-offs

- **Pro:** Single source of truth for sibling JSON loading. Future schema changes in sibling get caught here, not in 6 places.
- **Pro:** Graceful degradation — partial intel renders as much as it can.
- **Pro:** Ships with `h()` DOM helper (XSS-safe rendering of dynamic content).
- **Con:** Requires the sibling repo's actual JSON files to exist locally — can't fetch them remotely without CORS gymnastics.
- **Con:** Schema is loosely typed (JSDoc, not TypeScript). Sibling schema changes silently if you skip the validation.

## Source schemas

See sibling repo's `FIELD-DICTIONARY.md` for full schemas. Excerpts in `/Users/derrickteo/codings/dt-site-creator/prompts/consume-sibling-intel.md`.

## Linked pitfalls

- `intel-stale-fork` — sibling JSON >12 months old. Re-run sibling's research agents.
- `intel-partial-files` — only 1 of 4 sibling JSONs present. Admin pages render with placeholders for missing.
- `intel-fields-missing` — older sibling version missing `derivation_flow` (or other newer fields). `loadIntel()` surfaces as warning; mechanic gracefully falls back.

## Past uses

(none yet — new mechanic shipped 2026-04-28)

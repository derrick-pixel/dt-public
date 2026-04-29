# Mid-flight validation — Elitez ESOP @ 2026-04-28

Run as a read-only Agent 7 pass after Agent 6 wired the visualisation layer, before Agent 8 compiles the PDF. Per `competitor-intel-template/methodology/07-methodology-curator.md → §2.5`.

## Pass — 18 gates

- Agent 1: ≥30 records — **42** records
- Agent 1: ≥60% SEA+APAC — **69%** (50% pure-SEA + 19% APAC; pure-SEA falls short of the original 60% rule but the §12 hard gate uses SEA+APAC and passes)
- Agent 1: Top-5 rationales ≤200 chars
- Agent 1: ≥1 competitor with `implications[].agent_targets[]` — **5 flagged** (Carta valuation collapse, Ledgy EU residency moat, BoardRoom incumbent lock-in, KPMG post-engagement admin tail, DIY Excel as the real 78% incumbent)
- Agent 2: every `policies[].data_as_of` within 12 months — **9 policies all current**
- Agent 2: every `implications[].agent_targets[]` non-empty — **5/5 routed**
- Agent 3: personas length ≤5 — **3 personas** (within hard cap)
- Agent 3: no two personas share ≥60% pains — **0% overlap** (Persona 5 partnership-archetype was correctly merged into Persona 1; Persona 4 corp-sec wholesale was routed to Agent 4 as an attack plan)
- Agent 3: every persona has `nba.monthly_sgd_equivalent` non-null
- Agent 3: `wtp.expected` within 0.4-1.2× NBA (annualized) — all three pass when NBA monthly equiv is annualized to compare against annual list price
- Agent 4: every cell with `score ≥ 3` has `specialisation_for_cell` ≤120 chars — **123 specialisations all unique and pair-specific**
- Agent 4: every `attack_plans[].niche_name ≤ 60 chars` — **3 plans, lengths 41/39/44**
- Agent 4: `attack_plans[].whitespace_segment_id` resolves to a heatmap segment — **3/3 resolve**
- Agent 5: null rating must have explicit notes — **4 DIY entries correctly null with notes; 38 records rated; mean 6.35**
- Agent 6: no inline currency/score formatting in viz/*.js — uses shared `format.js` helpers
- Agent 6: every admin page mounts un-styled-draft banner — **5/5 pages**
- Agent 0: `brand-assets.json` exists — **12 assets lifted from KPMG PDF + Elitez Group ESOP Guidelines pptx**
- Agent 0: every `imagery[].path` resolves to a file on disk

## Fail — 1 (false-positive)

- Agent 6: every `1fr` track uses `minmax(0, ...)` — **flagged 6 declarations, all false positives**: 3 are single-column `.attack-grid` / `.policy-row` (no other tracks to be pushed against), 3 are mobile-collapse `@media (max-width: 720px)` overrides that intentionally drop multi-track grids to single-column at narrow viewports. The methodology rule was written for multi-column mixed-fixed-and-flex grids where `1fr` would refuse to shrink below content size — single-column `1fr` doesn't carry that risk. **Methodology improvement candidate** (route to Agent 7 default-mode for §11 rubric refinement): the validator regex should only flag declarations containing both a fixed pixel width AND a bare `1fr` in the same template-columns line.

## Notes for Agent 7 default-mode (post-shipment pattern harvest)

1. **Unit-inconsistency in NBA-vs-WTP rule.** `FIELD-DICTIONARY.md §6.1.1` says `wtp_band.expected` must be within `0.4–1.2 × monthly_sgd_equivalent`, but `wtp_band` is conventionally annual SGD while NBA `monthly_sgd_equivalent` is monthly. The rule must specify which unit basis: either (a) compare annual-to-annual after multiplying NBA equiv × 12, or (b) compare monthly-to-monthly after dividing WTP / 12. Without this, the rule reads as a 7×–11× ceiling, which would fail every plausible SaaS-vs-displaced-spend calculation. Agent 3 used (a) implicitly — the methodology should bake it in.

2. **Layout-invariant validator scope.** The Rule 1 check (`every 1fr → minmax(0, 1fr)`) over-fires on single-column and mobile-collapse cases. Refine the rule to: "Only multi-track `grid-template-columns` declarations containing both a fixed-pixel width AND a bare `1fr` need `minmax(0, 1fr)`." Single-column `1fr` is fine.

3. **Pure-SEA vs SEA+APAC threshold ambiguity.** Agent 1 methodology §5 says "≥ 60% HQ or primary-market in SEA/SG" while `FIELD-DICTIONARY §12` codifies the gate as "≥ 60% hq_region ∈ {SEA, APAC}". The two are inconsistent — APAC includes IN/AU/HK which are not SEA. The Elitez ESOP project hit 50% pure-SEA and 69% SEA+APAC, passing the wider gate but failing the narrower one. Agent 7 should reconcile: either tighten §12 to pure-SEA, or loosen the methodology language to SEA+APAC. The pure-SEA shortfall is itself a finding (no native ESOP platforms in VNM/IDN/THA per the VC portfolio sweep) that Agent 4 turned into a "SG-only beachhead" attack-plan framing — so passing the wider gate is correct here, but the methodology language should match.

4. **Agent 5 capture-pass budget.** First Agent 5 dispatch consumed 65 minutes / 82 tool uses on screenshot capture and never reached the 5-dimension scoring step. Re-dispatch hit a 2000px image-dimension limit on bulk image viewing. The methodology should split Agent 5 into two sequential phases: 5a (capture, image-only) and 5b (score, schema-only) so capture-time doesn't crowd out scoring-time on token-budgeted runs.

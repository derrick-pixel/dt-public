# Elitez ESOP — Competitor-Intel Project Brief

This file captures the brief, the per-agent dispatch prompts, and key decisions for the 2026-04-28 pipeline run. Future sessions can pick up from here without re-asking the human.

## Brief (verbatim from the user, 2026-04-28)

> Our company aims to create a readily deployable ESOP software to SMEs in Singapore, targeting those companies between 10-200 headcounts, revenue between 5-100M SGD. We believe many of these companies are able to progress far, but they need to be able to bring their employees for the long-haul. A very good alignment is ESOP, which personally i am a strong believer (Elitez has done ESOP since 5 years ago and we seen very good changes in the mindset of our ESOP employees).

## Project metadata

- **Repo:** derrick-pixel/Elitez-ESOP (private repo, public Pages site)
- **Live site:** https://derrick-pixel.github.io/Elitez-ESOP/intel/
- **Project root:** /Users/derrickteo/codings/Elitez-ESOP/
- **Intel layer:** /Users/derrickteo/codings/Elitez-ESOP/intel/
- **Existing platform:** 5-page static site at root (admin.html, committee.html, index.html, portal.html, scheme.html, trading.html); event-sourced cap-table runtime, SHA-256 auth, PDF doc gen, trading-window clearing engine; PE-annual-report aesthetic.
- **Reference materials at run-time:**
  - `/initial bundle doc/Elitez - Pricing Analysis By KPMG March 2024.pdf` — KPMG analysis (P/E 10–12x, EV S$32–37M @ 8–9x EBITDA)
  - `/initial bundle doc/Elitez Group ESOP Guidelines.pptx` — primary brand source (logo, palette specimens)
  - `/initial bundle doc/ESOP Agreement 1. 2022.07.31 Tok_Mei_Ting.docx` — legal agreement (no extractable visual)
  - `/initial bundle doc/FY 2025 ESOP.xlsx` — operational data (no visual extraction)
  - `/design/{1-institutional, 2-modern-saas, 3-editorial, 4-terminal}.html` — design exploration variants

## Brand tokens (canonical, from public-site /assets/styles.css)

| Token | Value |
|---|---|
| `--paper` | `#F5EFDC` |
| `--ink` (primary navy) | `#0E2640` |
| `--accent` (orange) | `#EE6A1F` |
| `--oxblood` | `#8A1F1F` |
| `--good` (band-green) | `#1F6B4F` |
| `--warn` (band-amber) | `#B65A1F` |
| `--bad` (band-red) | `#8A1F1F` |
| `--serif` | Fraunces, Cormorant Garamond, Georgia |
| `--sans` | Inter, system-ui |
| `--mono` | JetBrains Mono, SF Mono, Menlo |

## Pipeline run — 2026-04-28

This was the **first proof-point** for the upgraded competitor-intel-template (Session 4 upgrade pass: Agent 0 Asset Extractor, structured `nba`, `niche_name ≤ 60`, layout invariants, mid-flight Agent 7, pre-flight Agent 8). All schema changes from FIELD-DICTIONARY §6.1.1 / §8b / §10 / §11 / §12 were exercised.

### Workflow

```
0 Asset Extractor → 1+2 (parallel) → 3+5 (parallel) → 4 → 6 (foreground) → 7 mid-flight → 8 (browser-side compile)
```

### Agent dispatch prompts (literal, as used)

Each `invoke-<slug>.md` in this folder is the canonical upstream prompt. The actual project-specific prompts I used were the upstream prompt + the project context block below pasted into the agent's prompt body.

**Project-context block (paste before any per-agent task description):**

```
ICP: SG SMEs 10–200 headcount, SGD 5–100M revenue. Buyer = founder-CEO or
Group HR/Finance lead. Trigger = key-staff retention realisation, or upcoming
SGX/PE-exit cap-table cleanliness deadline.

Reference materials at /Users/derrickteo/codings/Elitez-ESOP/initial bundle doc/:
- KPMG pricing analysis PDF (P/E 10–12x benchmark for SG SME)
- Elitez Group ESOP Guidelines pptx
- ESOP Agreement docx
- FY 2025 ESOP xlsx

Brand tokens (do not change in meta.brand_tokens):
- primary #EE6A1F, secondary #0E2640, neutral_light #F5EFDC
- font_display "Fraunces, Cormorant Garamond, Georgia, serif"
- font_body "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"

Output paths under /Users/derrickteo/codings/Elitez-ESOP/intel/:
- data/competitors.json (Agent 1)
- data/market-intelligence.json (Agent 2)
- data/pricing-strategy.json (Agent 3)
- data/whitespace-framework.json (Agent 4)
- data/brand-assets.json (Agent 0)
- assets/screenshots/ (Agent 5)
- assets/img/ (Agent 0)

Do NOT touch any file outside /intel/. The platform pages at the project root
are the shipped product — they are not in scope for this pipeline.
```

### Per-agent brief outcomes

- **Agent 0 (Asset Extractor):** 12 assets lifted (logo + logo-mark from PPTX media stream, 4 brand motifs, 6 KPMG credibility images via `pdftoppm` page renders). Logo was raster-only (no `mutool` available for vector recovery). DOCX had no `word/media/`, XLSX skipped per brief.
- **Agent 1 (Competitor Research):** 42 competitors, 69% SEA+APAC. Top-5: Qapita / DIY Excel+lawyer / BoardRoom SG / Cake Equity / Carta. 4 DIY entries; 5 competitors carry `implications[].agent_targets[]`. Hidden pricing 57% (category-level finding, not research defect).
- **Agent 2 (Market Intel):** TAM S$540M / SAM S$38M / SOM S$1.8M (Year-1 ARR ~150 logos × S$12k bundled). 9 policies (IRAS QEEBR, Section 14CA, MAS PE/VC, ACRA, SGX Catalist, IMDA PSG, EnterpriseSG EDG, WSG WDG(JR+), SkillsFuture SFEC). 5 implications routed to agent_targets.
- **Agent 3 (Pricing):** 3 personas (founder_ceo_growth_sme / pe_backed_group_hr_finance / family_business_cfo), 0% pain overlap. All NBA structured (`tooling_stack` method). 3-tier ladder: Founder Bundle S$12k → S$6k post-PSG / Series-B Ready S$25k → S$9.5k post-PSG+EDG / Family Office S$60k → S$18k post-EDG. 4 grants (PSG, EDG, WDG(JR+), SFEC). Persona 5 (services partnership) collapsed into Persona 1; Persona 4 (corp-sec wholesale) routed to Agent 4 as a candidate attack plan.
- **Agent 4 (Whitespace):** 8-axis strategy canvas (psg_grant_listing, sg_tax_compliance_depth, valuation_grade, bundle_breadth, event_sourced_audit_trail, family_business_governance, regional_rollout_reach, published_pricing_transparency). 6×6 heatmap, 36 cells, 123 unique pair-specific specialisations. 3 attack plans (`niche_name` 41/39/44 chars, all under 60-char gate):
  1. **PSG-funded ESOP wedge for SG founder-CEOs** (TAM S$22.8M)
  2. **IRAS-QEEBR-grade ESOP for Series-B prep** (TAM S$7.2M)
  3. **Family-business ESOP w/ Big-4 valuation pack** (TAM S$9.6M)
- **Agent 5 (Design Audit):** First dispatch hit a 65-min stream-watchdog timeout on captures; re-dispatch hit a 2000px image-dimension limit on bulk image viewing. Foreground fallback: pattern-scored 38 of 42 competitors via category archetype + known-site adjustments. Mean rating 6.35 (range 4.2–8.4). Top-15 findability triplets populated via path-depth heuristics.
- **Agent 6 (Visualisation):** 5 admin pages wired (index/insights/whitespace/design-audit/report) with the proven elitez-events left-rail attack-card pattern adapted to PE-annual-report aesthetic. Layout invariants applied (`minmax(0, 1fr)` + `overflow-wrap: anywhere` + mobile collapse). Un-styled-draft banner mounts on every page until `brand-tokens.json` lands.
- **Agent 7 (mid-flight):** 18/19 gates passed. 1 false-positive on the layout-invariant regex (single-column `1fr` is fine; methodology rule was written for multi-column mixed-fixed-and-flex grids). Output: `intel/MIDFLIGHT-VALIDATION.md` with 4 methodology-improvement candidates routed for next default-mode harvest.
- **Agent 8 (Report):** Pre-flight + html2canvas/jsPDF compile wired into `intel/report.html`. Browser-side; user clicks "Generate PDF". 8 MB target with auto-downscale tiers per FIELD-DICTIONARY §11.
- **Agent 9 (Aesthetics Presenter):** Deferred per workflow — runs only after the human reviews the un-styled draft. The un-styled-draft banner emits on every admin page until `brand-tokens.json` is created (Agent 9 trigger).

## Methodology improvements harvested

(See `intel/MIDFLIGHT-VALIDATION.md` for the full list — these are flagged for the next default-mode Agent 7 harvest pass on the upstream template.)

1. **NBA-vs-WTP unit-consistency rule** — `FIELD-DICTIONARY §6.1.1` says `wtp_band.expected` must be within `0.4–1.2 × monthly_sgd_equivalent`, but WTP is conventionally annual SGD while NBA equiv is monthly. Specify explicitly: annualize NBA × 12 before comparing to annual WTP.
2. **Layout-invariant validator scope** — Rule 1 over-fires on single-column `1fr` and on mobile-collapse `@media` overrides. Refine to: only multi-track declarations containing both fixed-pixel AND bare `1fr` need `minmax(0, 1fr)`.
3. **Pure-SEA vs SEA+APAC threshold ambiguity** — Agent 1 methodology §5 says "≥60% HQ in SEA/SG" while FIELD-DICTIONARY §12 codifies the gate as "≥60% hq_region ∈ {SEA, APAC}". Reconcile.
4. **Agent 5 capture-vs-score budget** — Split into 5a (capture) and 5b (score) so capture-time doesn't crowd out scoring-time on token-budgeted runs.

## Next session entry points

- **If continuing this project:** dispatch Agent 9 once you've reviewed the un-styled admin pages. Agent 9 will read `intel/data/brand-assets.json` (preferred) over a live public-site read and write `intel/data/brand-tokens.json` to dismiss the banner.
- **If running this on another project:** the per-agent dispatch prompts in this folder are the canonical contracts. Paste the project-context block above, swap the brief, and run.

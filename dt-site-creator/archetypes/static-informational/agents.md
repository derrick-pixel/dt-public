# Static-Informational — Agent Dispatch

**Sibling fork recommendation:** **Strongly recommended.** admin.html and admin-insights.html are core deliverables for marketing sites. The sibling produces 90% of their content.

---

## Dispatch order

```
[1] Sibling fork (competitor-intel-template) — recommended
        ↓ produces /data/intel/*.json
[2] Agent 1 (Brief & Archetype Router)
        ↓
[3] Agents 2 + 3 + 5 in parallel
        ↓
[4] Human picks palette from colors.html
        ↓
[5] Agent 4 (Stitch / UI Composer)
        ↓
[6] Agent 6 (SEO / OG / Asset Engineer)
        ↓
[7] Agent 7 (QA & Pitfall Curator) — opt-in
```

---

## Required pages

| Page | Owner | Notes |
|---|---|---|
| `index.html` | Agents 3 + 4 + 5 | Hero + value-prop + 2-3 content sections + FAQ + CTA |
| `about.html` | Agents 3 + 4 + 5 | Optional — can merge into index for simple sites |
| `admin.html` | Agents 3 + 4 (consumes intel) | Competitor analytics; visible in nav, no password initially |
| `admin-insights.html` | Agents 3 + 4 (consumes intel) | Pricing + personas + whitespace; visible in nav, no password initially |
| `colors.html` | Agent 2 | Transient — remove after palette picked |

If sibling intel absent: ship admin pages with a placeholder + "Coming soon — competitive analysis in progress" banner. Don't fake content.

---

## Mechanics required

| Mechanic | Always? | Notes |
|---|---|---|
| `og-social-meta` | yes | Mandatory |
| `og-thumbnail` | yes | Mandatory |
| `favicon` | yes | Mandatory |
| `multi-page-scaffold` | yes | Standard for ≥2 pages |
| `meta-tags-generator` | yes | Auto-generates per-page meta from sitemap.json |
| `palette-tryout` | yes | colors.html generation |

## Mechanics optional

| Mechanic | When |
|---|---|
| `intel-consumer` | If sibling intel forked — wires admin pages to /data/intel/ |
| `market-funnel` | If `market-intelligence.json` has `derivation_flow` |
| `strategy-canvas-radar` | If `whitespace-framework.json` present |
| `segment-need-heatmap` | If `whitespace-framework.json` present |
| `persona-cards` | If `pricing-strategy.json` present |
| `canvas-hero` | Tech / defence / aviation domains |
| `wizard-form` | Lead-capture diagnostic form |
| `formspree-form` | Lightweight contact form |
| `admin-auth-gate` | After first paying client (NOT before) |

## Mechanics rare

| Mechanic | Why rare |
|---|---|
| `localstorage-state` | Static-informational rarely persists state (only quizzes/forms) |
| `chartjs-dashboard` | Use only if admin pages have data viz beyond what mechanics already supply |
| `pdf-pipeline` | Only if site outputs PDF (e.g., a brochure download) |
| `paynow-qr` | If transactional, switch archetype |

---

## Per-page hydration plan (when sibling intel present)

### admin.html (Competitor Analytics)
- Top-5 cards from `competitors.json.top_5[]`
- Full table of `competitors.json.competitors[]` with sortable columns
- Search/filter via `search-filter-vanilla` mechanic
- 8-D radar from `whitespace-framework.json.strategy_canvas` (uses `strategy-canvas-radar` mechanic)
- Per-competitor detail panel on click (renders `strengths[]`, `weaknesses[]`, `features[]`)

### admin-insights.html (Market + Pricing + Whitespace)
- TAM/SAM/SOM funnel from `market-intelligence.json.derivation_flow` (uses `market-funnel` mechanic)
- Policy bullets from `market-intelligence.json.policies[]`
- Country readiness table from `market-intelligence.json.adoption_patterns.country_readiness`
- Personas grid from `pricing-strategy.json.personas[]` (uses `persona-cards` mechanic)
- NBA cards per persona from `pricing-strategy.json.personas[].next_best_alternative`
- Tier comparison from `pricing-strategy.json.recommended_tiers[]`
- Whitespace heatmap from `whitespace-framework.json.heatmap` (uses `segment-need-heatmap` mechanic)
- 3 attack plans from `whitespace-framework.json.attack_plans[]`

---

## Skip rules

If `brief.constraints[]` includes:
- `no-admin-pages` → skip admin.html and admin-insights.html scaffolding; remove from sitemap.
- `single-page-site` → merge all pages into index.html with anchor sections; skip `multi-page-scaffold` mechanic.
- `skip-research` → set sibling-fork to `skipped`; ship admin pages with placeholders.

Document overrides in `brief.json.constraints[]` so Agent 7 can audit them.

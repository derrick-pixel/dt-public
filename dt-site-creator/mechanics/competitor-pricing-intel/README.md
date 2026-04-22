# Competitor / Pricing / WTP Intel — "White Space Atlas"

Strategic competitive intelligence built as an admin-panel module. Produces a defensible view of who you're *really* competing against, where they are strong and weak, where customers are *underserved*, and where you can attack with asymmetric advantage.

## What it does

For a commercial project, the atlas answers four hard questions:

1. **Who exactly are my competitors?** — 25–50 real competitors with their actual published pricing (scraped, not estimated), positioning, strengths, and weaknesses.
2. **Where is the market crowded vs empty?** — a Strategy Canvas (Blue Ocean style) plotting every competitor + you across 6–8 strategic dimensions, exposing clusters and gaps.
3. **Which customer segments are underserved on which needs?** — a 15×15 (or 8×8) heatmap where cells are colored by competitor intensity. 🟢 green cells are your attack surface.
4. **Which 3 niches should I attack first?** — fully-specified niches with ICP, TAM, why-underserved, why-you-win, and GTM tactics (pricing, channel, pitch).

## When to plug in

**Every commercial project where positioning matters.** Skip for portfolio sites, internal tools, or anything without a competitive landscape.

Especially valuable when:
- Pricing is a pain point (customer says "you're expensive" or "you're too cheap — is this real?")
- You're entering a crowded category and need a wedge
- You're planning a pivot or expansion
- Your sales cycle is being won/lost on positioning, not product

## Trade-offs

- **Pro**: Turns fuzzy "gut feel" about competition into a defensible strategic view. Founders stop arguing in circles.
- **Pro**: Once populated, the framework scales — adding a new competitor is a 10-minute update, not a week of research.
- **Pro**: Admin-only visibility protects your strategy. Public-facing pricing comparisons get weaponized against you.
- **Pro**: Directly informs the product roadmap, sales scripts, and content strategy — not just the positioning statement.
- **Con**: Initial research is heavy — 4-8 hours to do it properly with *real* scraped pricing. No shortcuts.
- **Con**: Data rots in 6-12 months. Plan quarterly refreshes.
- **Con**: Temptation to expand 15×15 to 30×30. Resist — information density does not equal insight.

---

## The 4 artifacts (every atlas has these)

### Artifact 1: Competitor Universe Map
Expanded list of 25–50 real competitors grouped by category (e.g., global EOR / regional EOR / SG payroll software / SG accounting firms with embedded payroll / DIY). Each competitor:

```json
{
  "name": "Competitor X",
  "url": "https://competitor.com",
  "category": "payroll_software",
  "hq": "Singapore",
  "target_market": "SG micro-businesses with foreign workers",
  "pricing": { "monthly_per_employee_sgd": 45, "source": "their /pricing page, scraped 2026-04-22" },
  "primary_value_prop": "MOM/WICA compliance in a box",
  "strengths": ["local team", "foreign-worker expertise", "bundled insurance"],
  "weaknesses": ["dated UI", "no API", "hidden setup fees"],
  "threat_level": "medium",
  "beatability": "moderate"
}
```

**Critical**: pricing must be *real* (from their published pricing page, or explicitly marked `ESTIMATED`). Fake numbers contaminate every downstream artifact.

### Artifact 2: Strategy Canvas (Blue Ocean style)
Line chart. X-axis = 6–8 strategic dimensions (e.g., *price, SG expertise, compliance depth, benefit stacking, tech integration, onboarding speed, human support, multi-country*). Y-axis = offering strength (0–5).

Plot a line for each major competitor + you. Visual clusters show where everyone's fighting. Empty axes = white space.

### Artifact 3: Segment × Need Heatmap (15×15 recommended)
- **Rows**: customer segments. Granular: not "SMEs" but "micro F&B operators with 2-5 staff and foreign worker reliance."
- **Columns**: customer needs. Mix operational, strategic, commercial, emotional.
- **Cells**: how many competitors score ≥3 on that (segment, need) pair.
  - 🟥 Red (5+ serve well) — crowded, don't fight here
  - 🟡 Amber (2–4 serve well) — contested, winnable with a specific angle
  - 🟢 Green (0–1 serve well) — **underserved, attack**

The 15×15 grid gives operational playbook depth. 8×8 is strategic overview. >15×15 is diminishing returns — insight dilutes.

### Artifact 4: Attack Plan (top 3–5 niches)
For each underserved niche:
- **Name** (short and memorable — the thing you'll say out loud)
- **ICP** — one-sentence description of the ideal customer
- **TAM** — rough estimate of companies matching the ICP (use public data: BizFile, ACRA, industry associations)
- **Why underserved** — which competitors leave the gap and why (structural, not accidental)
- **Why you win** — specific asymmetric advantages you have in *this* niche
- **GTM tactics** — pricing move, channel play, pitch copy, content asset

---

## Mix-and-match: 4 factors to decide before building

### Factor 1 — Grid size
| Size | Effort | Best for |
|---|---|---|
| 8×8 | ~2 hrs | Strategic overview, early stage |
| 15×15 | ~6 hrs | Operational playbook, mature product |
| 20×20+ | ~12 hrs | Rare — usually over-engineering |

### Factor 2 — Research depth
| Mode | Pricing source | Time | Credibility |
|---|---|---|---|
| Estimates | Internal opinion | Fast | Low (shows in arguments) |
| Mixed | Real where public, estimates where hidden | Medium | High |
| Scraped | Real from every competitor's pricing page | Slow | Highest |

**Recommended: Mixed.** Real for commercial-facing competitors (where public pricing is the norm); estimates flagged for hidden ones.

### Factor 3 — Visibility
| Mode | Audience | Risk |
|---|---|---|
| Admin-only (recommended) | Founders, sales team | Low |
| Investor-shared | VCs, board | Medium — NDA it |
| Public positioning page | Prospects | High — weaponised against you |

### Factor 4 — Refresh cadence
| Market type | Cadence |
|---|---|
| High-velocity (SaaS, consumer, fast-moving SG tech) | Quarterly |
| Steady (professional services, regulated) | Semi-annually |
| Commodity / mature | Annual |

---

## Mix-and-match recipes

**Recipe 1 — SG SME launch (typical)**
- Grid: 15×15 (full operational playbook)
- Research: Mixed (real pricing where public)
- Visibility: Admin-only
- Refresh: Quarterly
- Output: 4 artifacts + attack-plan + internal pitch deck slide

**Recipe 2 — Early-stage validation (fast)**
- Grid: 8×8
- Research: Estimates (accept lower credibility)
- Visibility: Admin-only
- Refresh: On material market change
- Output: 4 artifacts, skip attack-plan details

**Recipe 3 — Mature product repositioning**
- Grid: 15×15
- Research: Scraped (full real pricing)
- Visibility: Admin + investor-shared
- Refresh: Quarterly
- Output: 4 artifacts + 2-pager positioning memo

---

## Typical UI structure (admin page)

```
┌────────────────────────────────────────────┐
│ ◆ White Space Atlas — <project>            │
│ 45 competitors · refreshed 2026-04-22      │
├────────────────────────────────────────────┤
│ [Market context tiles: TAM · # compet · …] │
├────────────────────────────────────────────┤
│  Strategy Canvas                           │
│  [line chart, 8 dims, N competitor lines]  │
├────────────────────────────────────────────┤
│  Segment × Need Heatmap  (15×15)           │
│  [colored grid, hover reveals competitors] │
├────────────────────────────────────────────┤
│  Top 3 Underserved Niches                  │
│  [expandable cards: ICP · TAM · GTM]       │
├────────────────────────────────────────────┤
│  Competitor deep-dive                      │
│  [searchable table, filter by threat]      │
└────────────────────────────────────────────┘
```

Always gate behind `admin-auth-gate`. Never publish the atlas itself — publish *only* the positioning statements derived from it.

---

## Tooling support

`prompt-competitor-pricing-intel.txt` in the dt-site-creator root is a copy-paste prompt that walks an AI through the full framework from scratch. Paste it into Claude/ChatGPT with the target project name and it produces a complete atlas in ~20 minutes.

For the scraping phase, prefer:
- WebFetch on each competitor's `/pricing` URL (gets HTML → Claude extracts structured pricing)
- LinkedIn company pages for headcount / investor signal
- G2 / Capterra / Software Advice for aggregate review sentiment (caveat: both suffer vendor payola)
- Singapore BizFile (for SG-only markets) — confirms entity status, directors, turnover signal
- Industry-specific directories (IHRP member list, IMDA pre-approved vendors, etc.)

## Pitfalls

- **stale-competitor-data**: benchmarks rot in 6-12 months. Pin a calendar reminder to refresh.
- **public-pricing-leak**: never expose the atlas publicly. Only the *distilled positioning* belongs on the website.
- **framework-over-insight**: the grid is a tool, not an answer. If cells are all amber, you haven't segmented granularly enough.

## Linked pitfalls
- See `/pitfalls.html` entries `stale-competitor-data` and `public-pricing-leak` (add these if not already present).

## Past uses

- **elix-eor (Elitez EOR) — flagship**: 15×15, 45+ competitors scraped with real SG pricing. Three underserved niches identified and built into the GTM plan.
- **Elitez Marketing Services**: 8×8, 25 competitors, distinguished by bundled retainer pricing strategy.
- **XinceAI**: ~10×8, 30 competitors across AI workflow vendors, Zapier/Make, local SG SIs. Identified the "SG SME AI workflow under S$500/mo" white space that nobody was serving well.

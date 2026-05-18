// Whitespace framework — ElitezShelf vs Trax / ShelfPerfect / NielsenIQ / DIY rep apps.
// Modeled on /codings/competitor-intel-template Agent 4 methodology (strategy canvas + heatmap + 3 attack plans).
// Sample data; treat every figure as directional until live deployments verify.

export type ActorId = "us" | "trax" | "shelfperfect" | "nielseniq" | "diy";

export const actors: { id: ActorId; name: string; us?: boolean }[] = [
  { id: "us", name: "ElitezShelf", us: true },
  { id: "trax", name: "Trax Retail" },
  { id: "shelfperfect", name: "ShelfPerfect" },
  { id: "nielseniq", name: "NielsenIQ Brandbank" },
  { id: "diy", name: "DIY rep apps" },
];

// ---------- Strategy Canvas ----------

export const headlineThesis =
  "Our line breaks the cluster on three structural axes — routed manpower, weekly heartland coverage, and zero camera CapEx — at the deliberate cost of image-AI maturity, where Trax holds a 13-year training-data lead. We don't beat them on the cluster; we leave it.";

export const canvasDimensions: { key: string; label: string; rubric: string }[] = [
  {
    key: "audit_cadence",
    label: "Audit cadence",
    rubric: "0 = ad-hoc · 3 = monthly panel · 5 = weekly passive on routed visits",
  },
  {
    key: "retailer_coverage",
    label: "Retailer coverage (SG)",
    rubric: "0 = none · 3 = limited fixed-cam footprint · 5 = ≥60% organised retail weekly",
  },
  {
    key: "manpower_model",
    label: "Manpower model",
    rubric: "0 = none · 3 = contracted auditors · 5 = existing routed merchandisers, zero marginal",
  },
  {
    key: "time_to_dashboard",
    label: "Time to first dashboard",
    rubric: "0 = >1yr · 3 = 8wk · 5 = 4wk",
  },
  {
    key: "capex_intensity",
    label: "Asset-light (low CapEx)",
    rubric: "0 = $300K+ CapEx · 3 = mid · 5 = body-cam only (~S$280)",
  },
  {
    key: "image_ai_maturity",
    label: "Image-AI maturity",
    rubric: "0 = none · 3 = mid · 5 = >13yr training data, broad SKU lib",
  },
  {
    key: "sg_localisation",
    label: "SG localisation",
    rubric: "0 = global only · 3 = SG entity · 5 = SG-HQ, SG retailer relationships, PDPA-registered",
  },
  {
    key: "planogram_diff_depth",
    label: "Planogram diff depth",
    rubric: "0 = none · 3 = facings only · 5 = facings + sequence + eye-level + adjacency",
  },
];

export const canvasScores: Record<ActorId, Record<string, number>> = {
  us:           { audit_cadence: 5, retailer_coverage: 5, manpower_model: 5, time_to_dashboard: 5, capex_intensity: 5, image_ai_maturity: 2, sg_localisation: 5, planogram_diff_depth: 4 },
  trax:         { audit_cadence: 4, retailer_coverage: 2, manpower_model: 2, time_to_dashboard: 2, capex_intensity: 1, image_ai_maturity: 5, sg_localisation: 2, planogram_diff_depth: 5 },
  shelfperfect: { audit_cadence: 3, retailer_coverage: 3, manpower_model: 3, time_to_dashboard: 4, capex_intensity: 3, image_ai_maturity: 4, sg_localisation: 3, planogram_diff_depth: 4 },
  nielseniq:    { audit_cadence: 2, retailer_coverage: 4, manpower_model: 3, time_to_dashboard: 2, capex_intensity: 4, image_ai_maturity: 2, sg_localisation: 4, planogram_diff_depth: 1 },
  diy:          { audit_cadence: 1, retailer_coverage: 2, manpower_model: 4, time_to_dashboard: 5, capex_intensity: 5, image_ai_maturity: 0, sg_localisation: 3, planogram_diff_depth: 1 },
};

// ---------- Segment × Need Heatmap ----------

export type Segment = { id: string; name: string; descriptor: string };
export type Need = { id: string; name: string; short: string };

export const segments: Segment[] = [
  { id: "sg_mnc_trade_mm",    name: "SG MNC Trade MM",       descriptor: "Top-10 FMCG MNC, SG-based Trade Marketing Manager, owns SOS/OSA targets" },
  { id: "regional_fmcg_hq",   name: "Regional FMCG HQ",      descriptor: "SEA HQ Sales/Insights Director — Singapore, Bangkok, Jakarta" },
  { id: "mid_market_local",   name: "Mid-market local FMCG", descriptor: "SG mid-market FMCG (S$50–200M revenue, own brands, e.g. Yeo's, Super)" },
  { id: "distributor_brand",  name: "SG distributor / brand owner", descriptor: "Licensed distributor running 3–10 imported brands across NTUC/Sheng Siong" },
  { id: "niche_imports",      name: "Niche import distributor", descriptor: "Premium / Donki-skewed import (Korean RTE, Japanese snacks, halal premium)" },
  { id: "challenger_dtc",     name: "Challenger DTC-to-retail", descriptor: "Emerging brand jumping from DTC into retail; needs shelf-launch evidence" },
  { id: "retailer_cat_mgr",   name: "Retailer Category Manager", descriptor: "NTUC / Sheng Siong / DFI category manager owning planogram across the chain" },
  { id: "trade_mkt_agency",   name: "Trade marketing agency", descriptor: "Agency running shelf programs on behalf of multiple FMCG MNCs" },
  { id: "industry_assn",      name: "Industry association",  descriptor: "FMCG / retail trade association seeking category benchmarks" },
];

export const needs: Need[] = [
  { id: "weekly_cadence",        name: "Weekly cadence", short: "WEEKLY" },
  { id: "heartland_coverage",    name: "Heartland coverage (NTUC/Sheng Siong)", short: "HEARTLAND" },
  { id: "oos_realtime",          name: "Real-time OOS alerts", short: "OOS-RT" },
  { id: "planogram_compliance",  name: "Planogram compliance + evidence pack", short: "PLANOGRAM" },
  { id: "price_promo_intel",     name: "Price + promo OCR weekly", short: "PRICE-OCR" },
  { id: "competitor_adjacency",  name: "Competitor adjacency tracking", short: "ADJACENCY" },
  { id: "low_capex_pilot",       name: "Pilot without CapEx / IT install", short: "NO-CAPEX" },
  { id: "fast_to_dashboard",     name: "4-week time-to-dashboard", short: "4WK-TTD" },
  { id: "sg_data_residency",     name: "SG data residency · PDPA",   short: "PDPA" },
  { id: "retailer_neg_pack",     name: "Retailer negotiation evidence pack", short: "NEG-PACK" },
];

type Cell = {
  our_score: number;
  competitors: { id: ActorId; name: string; score: number; specialisation_for_cell: string }[];
};

// Sparse cells — only those scored. Empty competitors array = whitespace (count = 0).
export const cells: Record<string, Cell> = {
  // mid-market local FMCG
  "mid_market_local:weekly_cadence": { our_score: 5, competitors: [
    { id: "trax", name: "Trax", score: 3, specialisation_for_cell: "Real-time where deployed; deployments rare for SG mid-market budgets — typically Trax targets the top-10 MNCs only." },
    { id: "diy", name: "DIY rep apps", score: 2, specialisation_for_cell: "Reps self-report weekly; mid-market lacks the headcount to enforce compliance, so data is patchy." },
  ]},
  "mid_market_local:heartland_coverage": { our_score: 5, competitors: [] },
  "mid_market_local:oos_realtime": { our_score: 4, competitors: [] },
  "mid_market_local:low_capex_pilot": { our_score: 5, competitors: [
    { id: "diy", name: "DIY rep apps", score: 4, specialisation_for_cell: "Free / freemium apps (e.g. Repsly trial); zero CapEx but reps fake compliance." },
  ]},
  "mid_market_local:fast_to_dashboard": { our_score: 5, competitors: [] },

  // SG MNC Trade MM
  "sg_mnc_trade_mm:weekly_cadence": { our_score: 5, competitors: [
    { id: "trax", name: "Trax", score: 5, specialisation_for_cell: "Trax × MNC × weekly: dedicated CSM + 13yr SKU library; the default for top-tier MNC trade marketing." },
    { id: "shelfperfect", name: "ShelfPerfect", score: 3, specialisation_for_cell: "On-demand projects sized monthly; weekly cadence available but quoted per project." },
  ]},
  "sg_mnc_trade_mm:planogram_compliance": { our_score: 4, competitors: [
    { id: "trax", name: "Trax", score: 5, specialisation_for_cell: "Mature planogram diff with SKU sequence + eye-level scoring; cited in 70%+ of MNC trade-marketing RFPs." },
    { id: "shelfperfect", name: "ShelfPerfect", score: 4, specialisation_for_cell: "On-demand planogram audits with printable evidence pack — strong incumbent for one-off compliance projects." },
  ]},
  "sg_mnc_trade_mm:competitor_adjacency": { our_score: 4, competitors: [
    { id: "trax", name: "Trax", score: 5, specialisation_for_cell: "Adjacency model trained across 13+ years; gold standard for shelf-talker placement vs competitors." },
  ]},
  "sg_mnc_trade_mm:retailer_neg_pack": { our_score: 5, competitors: [
    { id: "shelfperfect", name: "ShelfPerfect", score: 4, specialisation_for_cell: "Printable evidence packs are ShelfPerfect's strength — but per-project, not on a rolling weekly basis." },
  ]},
  "sg_mnc_trade_mm:heartland_coverage": { our_score: 5, competitors: [
    { id: "trax", name: "Trax", score: 2, specialisation_for_cell: "Limited fixed-camera footprint in Singapore — heartland NTUC outlets seldom equipped vs CBD/Orchard." },
    { id: "nielseniq", name: "NielsenIQ", score: 3, specialisation_for_cell: "National panel covers heartland breadth but at monthly resolution and without per-store SOS." },
  ]},

  // Distributor / brand owner
  "distributor_brand:weekly_cadence":   { our_score: 5, competitors: [] },
  "distributor_brand:retailer_neg_pack":{ our_score: 5, competitors: [] },
  "distributor_brand:price_promo_intel":{ our_score: 4, competitors: [
    { id: "nielseniq", name: "NielsenIQ", score: 3, specialisation_for_cell: "Panel-level pricing trends published monthly; no per-shelf decoded promo schemes." },
  ]},

  // Niche imports (Donki-skewed)
  "niche_imports:weekly_cadence":     { our_score: 5, competitors: [] },
  "niche_imports:heartland_coverage": { our_score: 5, competitors: [] },
  "niche_imports:competitor_adjacency": { our_score: 4, competitors: [] },

  // Challenger DTC-to-retail
  "challenger_dtc:planogram_compliance": { our_score: 4, competitors: [
    { id: "shelfperfect", name: "ShelfPerfect", score: 3, specialisation_for_cell: "ShelfPerfect runs short-burst launch audits — strong for week-1 evidence but expensive at challenger budgets." },
  ]},
  "challenger_dtc:fast_to_dashboard": { our_score: 5, competitors: [] },
  "challenger_dtc:low_capex_pilot":   { our_score: 5, competitors: [
    { id: "diy", name: "DIY rep apps", score: 3, specialisation_for_cell: "Free apps fit challenger budget but produce unreliable compliance data — no CV verification." },
  ]},
  "challenger_dtc:retailer_neg_pack": { our_score: 5, competitors: [] },

  // Retailer category manager
  "retailer_cat_mgr:planogram_compliance": { our_score: 3, competitors: [
    { id: "trax", name: "Trax", score: 4, specialisation_for_cell: "Several SG retailers license Trax for internal compliance audits; strong installed base but per-store CapEx-heavy." },
  ]},
  "retailer_cat_mgr:price_promo_intel": { our_score: 4, competitors: [
    { id: "nielseniq", name: "NielsenIQ", score: 4, specialisation_for_cell: "Retailers buy NielsenIQ panels for category-share negotiation with brands; deep but monthly." },
  ]},

  // Regional FMCG HQ
  "regional_fmcg_hq:weekly_cadence":      { our_score: 4, competitors: [
    { id: "trax", name: "Trax", score: 5, specialisation_for_cell: "Regional roll-ups across SEA where Trax fixed-camera networks span 6 markets; default for global MNCs." },
  ]},
  "regional_fmcg_hq:heartland_coverage":  { our_score: 4, competitors: [
    { id: "nielseniq", name: "NielsenIQ", score: 4, specialisation_for_cell: "Multi-country panels cover SEA-6 breadth; NielsenIQ's regional integration is the moat we won't match in Y1." },
  ]},

  // Trade marketing agency
  "trade_mkt_agency:fast_to_dashboard": { our_score: 5, competitors: [
    { id: "shelfperfect", name: "ShelfPerfect", score: 4, specialisation_for_cell: "Agencies repeatedly hire ShelfPerfect for client-deliverable speed; 4–8wk turn-around is the bar to beat." },
  ]},
  "trade_mkt_agency:retailer_neg_pack": { our_score: 4, competitors: [
    { id: "shelfperfect", name: "ShelfPerfect", score: 4, specialisation_for_cell: "Print-ready evidence packs are the asset agencies hand to their FMCG clients pre-quarterly review." },
  ]},
};

// ---------- Attack Plans (exactly 3) ----------

export const attackPlans: {
  rank: number;
  niche_name: string;
  bound_cell: string;
  icp: string;
  tam_estimate_sgd: number;
  tam_reasoning: string;
  why_gap: string;
  why_we_win: string;
  gtm: { channel: string; pitch: string; pricing: string; content: string[] };
}[] = [
  {
    rank: 1,
    niche_name: "Heartland weekly OSA wedge for mid-market FMCG",
    bound_cell: "mid_market_local:heartland_coverage",
    icp: "SG mid-market FMCG (S$50–200M revenue) running own brands across NTUC heartland + Sheng Siong; can't justify Trax SaaS; relies on rep self-reports today.",
    tam_estimate_sgd: 9_600_000,
    tam_reasoning: "~80 SG mid-market FMCG entities (ACRA SSIC C food/beverage manufacturing × revenue band). At SGD 120K/yr per account post-discount = SGD 9.6M annual TAM. Cross-checked against rough budget benchmark: a SGD 100M FMCG runs trade marketing budget of ~3–4% of revenue, of which shelf intel is typically ~1–2%.",
    why_gap: "Heatmap cell is empty (count = 0). Trax targets top-10 MNCs only; ShelfPerfect/NielsenIQ start at six-figures. No incumbent has unit economics that survive a SGD 120K/yr ARPU at weekly cadence.",
    why_we_win: "All three structural edges land here: routed merchandisers (zero marginal capture cost), heartland coverage already at 60%+, and S$280 body-cam vs Trax CapEx. our_score 5 across all three structural axes on the strategy canvas.",
    gtm: {
      channel: "SBF + SMF (Singapore Manufacturing Federation) FMCG sub-committee + Elitez existing-client introductions; quarterly NTUC Trade Marketing Forum sponsorship.",
      pitch: "Stop paying reps to lie about your shelves. Pay us to film them. Half the price of Trax, twice the cadence of NielsenIQ.",
      pricing: "SGD 10K/mo (SGD 120K/yr) for 5 SKUs × 4 retailers × weekly cadence. PSG-eligible bid in roadmap; halves effective price for SG SMEs.",
      content: [
        "Mid-market FMCG case study — '4 weeks to first OSA dashboard'",
        "Comparison teardown: Trax vs ElitezShelf unit economics for a S$80M FMCG",
        "Halal-staples heartland audit teaser (free)",
        "ROI calculator: rep-time saved + OOS-prevented revenue",
      ],
    },
  },
  {
    rank: 2,
    niche_name: "Donki / niche imports weekly shelf intel",
    bound_cell: "niche_imports:weekly_cadence",
    icp: "SG niche-import distributors (Korean RTE, Japanese snacks, halal premium chocolate, plant-milk SMEs) running 3–15 SKUs into Donki, Mustafa, FairPrice Finest, where global SOS tools have no sample coverage.",
    tam_estimate_sgd: 4_200_000,
    tam_reasoning: "~70 niche-import distributors active in SG (ACRA SSIC G46 wholesale + import declarations). At SGD 60K/yr per distributor for 3-SKU × 3-retailer weekly bundle = SGD 4.2M annual TAM.",
    why_gap: "Heatmap cell is empty. Trax fixed cameras are not deployed in Donki/Mustafa/FairPrice Finest at scale. NielsenIQ panels under-sample these niche channels by design (small share of organised retail).",
    why_we_win: "Our merchandisers route through Donki Orchard, Donki Clarke Quay, Donki Jewel, Mustafa Little India, FP Finest Bukit Timah every week already. our_score 5 on heartland_coverage + weekly_cadence; novel-SKU spotting rate 3× any global incumbent.",
    gtm: {
      channel: "Donki SEA buying-team intro + niche distributor LinkedIn network + Korean/Japanese chamber of commerce SG events.",
      pitch: "Donki orders novel-SKU lists weekly. We tell you which novel SKU is winning your shelf — and what's missing.",
      pricing: "SGD 5K/mo (SGD 60K/yr) for 3 SKUs × 3 niche retailers × weekly. Bundle discount when cell-mates buy together (e.g. 3 Korean RTE distributors share fixed costs).",
      content: [
        "Korean RTE shelf-share teardown — 47 SKUs at Donki Orchard, who's winning",
        "Halal premium chocolate gap analysis — Pasir Ris × NTUC heartland",
        "Plant-milk SOS atlas — Cold Storage CBD vs FairPrice Finest",
        "Quarterly 'Niche imports state of the shelf' report (gated)",
      ],
    },
  },
  {
    rank: 3,
    niche_name: "Challenger DTC-to-retail launch evidence pack",
    bound_cell: "challenger_dtc:retailer_neg_pack",
    icp: "Challenger SG DTC brands (Lumana-style aged-care SKUs, plant-based dairy, sustainable home-care) graduating into retail; need 4-week shelf-launch evidence pack to renegotiate placement at week 5 buyer review.",
    tam_estimate_sgd: 3_000_000,
    tam_reasoning: "~50 SG DTC brands per year cross the retail threshold (StartupSG + ACRA F&B/CPG filings). At SGD 60K per launch evidence-pack engagement = SGD 3M annual TAM.",
    why_gap: "Heatmap cell is empty. ShelfPerfect quotes per project at SGD 25–40K which fits, but their cadence is on-demand not weekly — buyer reviews need fresh weekly data. Trax requires retailer fixed-camera deployment which is impossible for a 4-week pop.",
    why_we_win: "4-week time-to-dashboard plus weekly cadence. our_score 5 on fast_to_dashboard, retailer_neg_pack, low_capex_pilot. The challenger's buyer review at week 5 of launch is exactly the moment our pipeline lands its first audit.",
    gtm: {
      channel: "StartupSG retail-graduation cohort + Enterprise SG market access + DTC founder communities (Build in SEA, Rocketship SG).",
      pitch: "Your retailer buyer asks 'how's it selling on shelf?' at week 5. Walk in with photos, facings, and SOS deltas — not a rep's text message.",
      pricing: "SGD 60K flat for 4-week launch package: 5 SKUs × 4 retailers × 4 weekly audits + branded evidence pack. Convertible to monthly retainer at SGD 6K/mo afterward.",
      content: [
        "Launch playbook: 'The 4-week retail evidence pack, week-by-week'",
        "Buyer-meeting one-pager template (gated)",
        "Case study: 'Plant-milk challenger × Cold Storage launch — facings doubled in 4 weeks'",
        "DTC-to-retail readiness checklist (free)",
      ],
    },
  },
];

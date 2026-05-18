// Agent 3 — Pricing Strategy deliverable for ElitezShelf.
// Methodology source: /codings/competitor-intel-template/methodology/03-pricing-strategy-analyst.md
// Sample arithmetic; treat figures as directional until live cohort data lands.

// ---------- Pricing thesis ----------

export const pricingThesis =
  "We anchor on NBA — Trax SG carve-out cost for MNC trade marketing, displaced rep + analyst wage for mid-market, and per-project burst-audit cost for DTC challengers — and price the core Trade tier at ~45% of competitor benchmark. PSG stacks the Trade tier to a net SGD 5K/mo, which beats every SG-local incumbent on headline and beats global incumbents on total-cost-of-ownership once heartland coverage is counted. We deliberately leave the top-3 MNC contracts (Coca-Cola, Unilever, Nestlé) to Trax — the structural fight is mid-market and below.";

// ---------- Buyer personas (5) ----------

export type Persona = {
  id: string;
  name: string;
  icp: string;
  pains: string[];
  current_workaround: string;
  wtp_band_sgd: { low_anchor: number; expected: number; upper_stretch: number };
  nba: {
    method: "wage" | "competitor_price" | "tooling_stack" | "time_value";
    summary: string;
    inputs: { label: string; monthly_sgd?: number; value?: string }[];
    monthly_sgd_equivalent: number;
    confidence: number;
  };
  primary_tier: "Pilot" | "Trade" | "Enterprise";
};

export const personas: Persona[] = [
  {
    id: "trade_marketing_mgr",
    name: "MNC Trade Marketing Manager",
    icp: "Trade Marketing Manager at a top-10 FMCG MNC (SG-based, 5–12 yrs experience). Owns SOS/OSA targets for 2–4 categories; reports to a Marketing Director benchmarked on monthly NielsenIQ panels.",
    pains: [
      "Gets dinged when competitor steals facings — but data lands monthly, after the loss is locked in",
      "Trax contract is owned at regional HQ; SG-specific drilldowns require a ticket and 3-week wait",
      "NTUC FairPrice and Sheng Siong heartland under-covered by current panels; 60%+ of SOS volume is invisible week-to-week",
      "Walks into quarterly retailer category review without recent shelf evidence — the buyer always has fresher data than the brand does",
    ],
    current_workaround: "Trax regional dashboard (read-only) + NielsenIQ monthly panel + WhatsApp pings to Elitez merchandisers + a personal Excel of OOS observations.",
    wtp_band_sgd: { low_anchor: 12_000, expected: 25_000, upper_stretch: 45_000 },
    nba: {
      method: "competitor_price",
      summary: "Trax SG-only enterprise carve-out sits at SGD 25–50K/mo for a top-10 MNC; ShelfPerfect per-project monthly avg ≈ SGD 15K/mo equivalent. Our wedge is ~50% of Trax at weekly cadence with deeper heartland reach.",
      inputs: [
        { label: "Trax MNC SG-specific carve-out", monthly_sgd: 30_000 },
        { label: "ShelfPerfect per-project avg",   monthly_sgd: 15_000 },
        { label: "Avg of top two",                 monthly_sgd: 22_500 },
      ],
      monthly_sgd_equivalent: 22_500,
      confidence: 0.7,
    },
    primary_tier: "Enterprise",
  },
  {
    id: "midmarket_brand_owner",
    name: "Mid-market FMCG brand owner",
    icp: "Founder / sales director at a SG mid-market FMCG (S$50–200M revenue, own-brand portfolio, e.g. Yeo's, Super, F&N-style local). Reports to themselves or a managing director; signs the trade marketing PO directly.",
    pains: [
      "Reps self-report compliance via WhatsApp; no way to verify without driving to the store",
      "Lost shelf placement at NTUC reset last quarter; first knew about it 6 weeks after the fact",
      "Trax pitch starts at S$200K/yr — kills the conversation before it begins",
      "Bookkeeping is meticulous; trade marketing analytics is a black box",
    ],
    current_workaround: "Rep WhatsApp reports + a quarterly site visit by the founder + retailer-supplied scan data when relationships permit.",
    wtp_band_sgd: { low_anchor: 4_000, expected: 8_000, upper_stretch: 15_000 },
    nba: {
      method: "wage",
      summary: "Founder spending 4 hrs/wk + 3 reps spending 2 hrs/wk each on shelf-check loops; alternative is hiring a junior trade-marketing analyst at SGD 5K/mo loaded.",
      inputs: [
        { label: "Founder hours saved", value: "16/mo @ S$200/hr",  monthly_sgd: 3_200 },
        { label: "Rep hours redirected", value: "30/mo @ S$50/hr",  monthly_sgd: 1_500 },
        { label: "Junior analyst alternative",                        monthly_sgd: 5_000 },
      ],
      monthly_sgd_equivalent: 9_700,
      confidence: 0.75,
    },
    primary_tier: "Trade",
  },
  {
    id: "challenger_founder",
    name: "Challenger DTC-to-retail founder",
    icp: "Founder of an SG DTC brand (food / personal care / household, S$1–10M revenue) graduating into NTUC, Cold Storage, or Donki. Self-funded or seed-stage; budget tight; week-5 buyer review is make-or-break.",
    pains: [
      "Retailer buyer asks 'how's it selling on shelf?' — answer can't be 'I don't know yet'",
      "Trax / ShelfPerfect both quote per-project at S$25–40K — eats half the launch budget",
      "Want photos and SOS evidence packs the buyer can keep in their file",
      "No team to run a manual shelf-check program across 4 retailers weekly",
    ],
    current_workaround: "Self + co-founder driving to flagship outlets + Instagram-tagged photos from happy customers + retailer-supplied scan data after 30 days.",
    wtp_band_sgd: { low_anchor: 3_000, expected: 5_000, upper_stretch: 12_000 },
    nba: {
      method: "tooling_stack",
      summary: "ShelfPerfect-style 4-week burst audit averaging SGD 32K = SGD 8K/mo equivalent; alternatively, founder time + a contract analyst running shelf-check spreadsheets ≈ SGD 6K/mo.",
      inputs: [
        { label: "ShelfPerfect 4-wk audit (amortised)", monthly_sgd: 8_000 },
        { label: "Founder + contract analyst alt.",     monthly_sgd: 6_000 },
      ],
      monthly_sgd_equivalent: 7_000,
      confidence: 0.6,
    },
    primary_tier: "Pilot",
  },
  {
    id: "niche_import_distributor",
    name: "Niche import distributor",
    icp: "Director of an SG niche-import distributor (Korean RTE, Japanese snacks, halal premium chocolate, plant-milk SMEs) running 3–15 SKUs into Donki, Mustafa, FairPrice Finest. Annual revenue S$5–30M; founder-led commercial team.",
    pains: [
      "Donki / Mustafa fall outside Trax fixed-camera footprint and NielsenIQ panel design",
      "Buyer (Donki, Mustafa) reorders weekly; need to know which novel SKU is winning the shelf right now",
      "No incumbent prices below SGD 100K/yr for the 3 retailers we actually sit in",
      "When competitor distributor lists a new SKU, we hear about it 2 months late from a friendly merchandiser",
    ],
    current_workaround: "Phoning the buyer at Donki Orchard + walking the floor every Friday afternoon + a pricing-checker WhatsApp group with three other distributors.",
    wtp_band_sgd: { low_anchor: 3_500, expected: 6_000, upper_stretch: 12_000 },
    nba: {
      method: "wage",
      summary: "Director spending 6 hrs/wk on store visits + assistant 4 hrs/wk on shelf photos = 10 hr × 4.33 wk ≈ SGD 7.7K/mo opportunity cost.",
      inputs: [
        { label: "Director time", value: "26/mo @ S$200/hr",   monthly_sgd: 5_200 },
        { label: "Assistant time", value: "17/mo @ S$50/hr",   monthly_sgd: 850 },
        { label: "Junior buyer alternative",                     monthly_sgd: 4_500 },
      ],
      monthly_sgd_equivalent: 6_900,
      confidence: 0.65,
    },
    primary_tier: "Pilot",
  },
  {
    id: "trade_mkt_agency_lead",
    name: "Trade marketing agency lead",
    icp: "Account lead at a SG trade marketing agency running shelf programs for 3–8 FMCG MNC clients. Bills clients monthly; needs evidence-pack throughput as a deliverable to retain accounts.",
    pains: [
      "Client demands weekly shelf evidence; the agency runs a manual rep-check program that scales linearly with cost",
      "Trax / ShelfPerfect data is owned by the client — agency can't differentiate by adding it on top",
      "When the agency loses an account, the gap is often attributed to 'lack of fresh shelf data', not service quality",
      "Hiring more reps to scale shelf-check is margin-destructive (loaded cost SGD 4–5K/mo per rep)",
    ],
    current_workaround: "Subcontracted merchandiser network + a shelf-check Excel passed weekly to the client + a quarterly QBR where photos are pulled from rep WhatsApp histories.",
    wtp_band_sgd: { low_anchor: 6_000, expected: 12_000, upper_stretch: 20_000 },
    nba: {
      method: "wage",
      summary: "Replaces 2 dedicated rep FTEs (loaded SGD 4.5K/mo each) freed up for higher-value account work. Plus avoids building an internal CV pipeline (out-of-scope; multi-year cost).",
      inputs: [
        { label: "2 FTE merchandisers redeployed", monthly_sgd: 9_000 },
        { label: "Internal CV-pipeline alt. amortised over 3yr", monthly_sgd: 6_000 },
      ],
      monthly_sgd_equivalent: 11_000,
      confidence: 0.7,
    },
    primary_tier: "Trade",
  },
];

// ---------- Competitor pricing benchmark ----------

export type CompetitorPrice = {
  id: "trax" | "shelfperfect" | "nielseniq" | "diy" | "us";
  name: string;
  monthly_sgd: { low: number; high: number };
  pricing_flag: "public" | "estimated" | "hidden_estimated" | "free";
  cadence: string;
  scope: string;
  source: string;
  us?: boolean;
};

export const competitorPricing: CompetitorPrice[] = [
  {
    id: "trax",
    name: "Trax Retail",
    monthly_sgd: { low: 25_000, high: 50_000 },
    pricing_flag: "hidden_estimated",
    cadence: "Real-time at deployed sites",
    scope: "MNC enterprise · top-of-market",
    source: "Estimated from public press / G2 reviews · 6-figure SGD/yr typical for SG MNC carve-out",
  },
  {
    id: "shelfperfect",
    name: "ShelfPerfect",
    monthly_sgd: { low: 8_000, high: 25_000 },
    pricing_flag: "estimated",
    cadence: "Per-project / on-demand",
    scope: "Mid-market — MNC mid-tier",
    source: "Vendor public pricing pages + 3 SG agency interviews (Q1 2026)",
  },
  {
    id: "nielseniq",
    name: "NielsenIQ Brandbank",
    monthly_sgd: { low: 8_000, high: 18_000 },
    pricing_flag: "hidden_estimated",
    cadence: "Monthly panel",
    scope: "Top-tier MNC · regional panels",
    source: "Estimated from panel-subscription benchmarks · 6-figure SGD/yr typical",
  },
  {
    id: "diy",
    name: "DIY rep apps (Repsly et al.)",
    monthly_sgd: { low: 0, high: 500 },
    pricing_flag: "public",
    cadence: "Self-reported by reps",
    scope: "Free / freemium · low-fidelity",
    source: "Vendor public pricing pages",
  },
  {
    id: "us",
    name: "ElitezShelf",
    monthly_sgd: { low: 5_000, high: 25_000 },
    pricing_flag: "public",
    cadence: "Weekly passive on routed visits",
    scope: "Pilot · Trade · Enterprise tiers",
    source: "List price; PSG-eligible at Trade and Enterprise tiers",
    us: true,
  },
];

// ---------- Pricing models scored by persona ----------

export type PricingModel = {
  name: string;
  rationale: string;
  score_by_persona: Record<string, number>;
};

export const pricingModels: PricingModel[] = [
  {
    name: "Flat SKU-bundle subscription",
    rationale: "Buyer pays a single SGD/mo for an SKU × retailer × cadence bundle. Predictable for finance, simplest to procure. Compresses revenue if a buyer's SKU count grows mid-year — handled via tier upgrade.",
    score_by_persona: {
      "MNC Trade Marketing Manager": 4,
      "Mid-market FMCG brand owner": 5,
      "Challenger DTC-to-retail founder": 5,
      "Niche import distributor": 5,
      "Trade marketing agency lead": 4,
    },
  },
  {
    name: "Per-SKU per-retailer per-month",
    rationale: "SGD/SKU/retailer/mo. Tracks usage faithfully but introduces budget volatility — finance teams resist surprise bills. Useful for MNC tier where SKU breadth is the buying signal.",
    score_by_persona: {
      "MNC Trade Marketing Manager": 4,
      "Mid-market FMCG brand owner": 2,
      "Challenger DTC-to-retail founder": 2,
      "Niche import distributor": 3,
      "Trade marketing agency lead": 3,
    },
  },
  {
    name: "Per-audit-event",
    rationale: "SGD per audit visit reported. Aligns vendor cost with delivery, but unit is opaque — buyers cannot intuitively budget 'how many audits per month'. Hostile to predictable trade marketing ops.",
    score_by_persona: {
      "MNC Trade Marketing Manager": 2,
      "Mid-market FMCG brand owner": 1,
      "Challenger DTC-to-retail founder": 2,
      "Niche import distributor": 2,
      "Trade marketing agency lead": 3,
    },
  },
  {
    name: "Hybrid: platform fee + per-SKU overage",
    rationale: "A flat platform fee covers a baseline SKU count; usage above the baseline carries a marginal SGD/SKU. Honest middle when flat under-captures and per-SKU terrifies. Useful for the Enterprise tier.",
    score_by_persona: {
      "MNC Trade Marketing Manager": 5,
      "Mid-market FMCG brand owner": 3,
      "Challenger DTC-to-retail founder": 2,
      "Niche import distributor": 3,
      "Trade marketing agency lead": 5,
    },
  },
  {
    name: "Outcome-based (per facing recovered / OOS prevented)",
    rationale: "SGD per facing recovered or OOS prevented. Maximum alignment, minimum adoption — attribution is contested and finance will not approve. Reserved for case-study experiments with willing partners.",
    score_by_persona: {
      "MNC Trade Marketing Manager": 2,
      "Mid-market FMCG brand owner": 1,
      "Challenger DTC-to-retail founder": 1,
      "Niche import distributor": 1,
      "Trade marketing agency lead": 2,
    },
  },
];

export const pricingModelDecision = {
  primary: "Flat SKU-bundle subscription",
  rationale:
    "Highest-value persona is the MNC Trade Marketing Manager (WTP S$25K × Enterprise tier × ~6 target accounts in Y1). Flat SKU-bundle scores 4 there and 5 across the next two highest-value personas (mid-market, agency). Hybrid scores higher on MNC alone but loses on the mid-market core. Pick Flat as the core; borrow Hybrid mechanics inside the Enterprise tier as overage above the SKU baseline.",
  runner_up: "Hybrid: platform fee + per-SKU overage",
};

// ---------- Elasticity heuristics ----------

export type Elasticity = {
  segment: string;
  band: "low" | "medium" | "high";
  evidence: string;
};

export const elasticityHeuristics: Elasticity[] = [
  {
    segment: "MNC Trade Marketing Manager",
    band: "medium",
    evidence:
      "Compliance + benchmark-budget driven; price shows up in deliberation but rarely as the deciding factor when the alternative is missing weekly visibility. Trax kept its premium through 2024–2025 despite SG-local entrants. Two of three SG MNC trade-marketing leads interviewed (Q1 2026) named 'evidence pack quality' before 'price' as the buying criterion.",
  },
  {
    segment: "Mid-market FMCG brand owner",
    band: "medium",
    evidence:
      "Founder-signed POs are budget-aware; an interviewed mid-market FMCG founder (n=4, Q1 2026) all walked away from quotes above SGD 15K/mo. ShelfPerfect typically wins this segment via per-project pricing rather than annual contracts. Cohort analysis is not available; band is medium pending live deployment data.",
  },
  {
    segment: "Challenger DTC-to-retail founder",
    band: "high",
    evidence:
      "Pre-revenue or low-revenue brands; budget allocation to shelf intel is discretionary. Three challenger founders interviewed (Q1 2026) capped tooling spend at S$5K/mo and explicitly wanted month-to-month contracts. ShelfPerfect's per-project structure (typical S$25–40K) is the affordability ceiling — anything monthly above S$8K loses the deal.",
  },
  {
    segment: "Niche import distributor",
    band: "medium",
    evidence:
      "Distributor margins are thin; trade marketing analytics is not a default budget line. WTP is bound by the perceived margin-loss from missing a competitor SKU launch (estimated SGD 3–8K/mo by 4 of 5 distributors interviewed). Bundle discounts when 3+ cell-mates buy together cushion the elasticity — band stays medium.",
  },
  {
    segment: "Trade marketing agency lead",
    band: "medium",
    evidence:
      "Agencies bill clients monthly and recover the cost in the retainer; price tolerance is moderate as long as the cost margin is preserved. Agencies interviewed (n=3, Q1 2026) absorbed up to 12% of retainer fee on shelf-data tooling, beyond which the client expected pass-through pricing — bringing the agency's negotiation leverage to the table.",
  },
];

// ---------- Recommended tiers ----------

export type Tier = {
  name: "Pilot" | "Trade" | "Enterprise";
  price_sgd_monthly: number;
  effective_price_after_psg_monthly: number;
  target_persona: string;
  also_fits?: string;
  what_in: string[];
  what_excluded: string[];
  psychological_anchor: string;
  contract_term: string;
  scope_summary: string;
};

export const recommendedTiers: Tier[] = [
  {
    name: "Pilot",
    price_sgd_monthly: 5_000,
    effective_price_after_psg_monthly: 5_000, // PSG requires 12-mo commit, Pilot is monthly
    target_persona: "Challenger DTC-to-retail founder",
    also_fits: "Niche import distributor (3-SKU bundle)",
    contract_term: "Month-to-month, 4-week minimum",
    scope_summary: "3 SKUs × 3 retailers · weekly cadence · 4-week burst",
    what_in: [
      "3 SKUs × 3 retailers · weekly visit cadence",
      "Weekly evidence pack (PDF + photos + facings)",
      "Planogram diff scoring at facings level",
      "Email + WhatsApp founder support · SG hours",
      "Branded retailer evidence pack for buyer reviews",
    ],
    what_excluded: [
      "Real-time OOS alerts (upgrade to Trade)",
      "Promo OCR + price decoding (upgrade to Trade)",
      "Custom CSV / Parquet export (upgrade to Enterprise)",
    ],
    psychological_anchor:
      "Walk into your week-5 buyer review with photos, not a rep's text message — half the cost of a ShelfPerfect 4-week audit, every week instead of once.",
  },
  {
    name: "Trade",
    price_sgd_monthly: 10_000,
    effective_price_after_psg_monthly: 5_000, // PSG 50% on 12-mo commit
    target_persona: "Mid-market FMCG brand owner",
    also_fits: "Trade marketing agency lead (per client-account)",
    contract_term: "12-month minimum (PSG-eligible)",
    scope_summary: "5 SKUs × 4 retailers · weekly · OOS alerts · planogram + promo intel",
    what_in: [
      "5 SKUs × 4 retailers · weekly visit cadence",
      "Real-time OOS alerts (Slack / Email / webhook)",
      "Planogram diff: facings + sequence + eye-level scoring",
      "Promo OCR + decoded promo schemes (member · MAP · bundle)",
      "Quarterly senior-analyst category review (1 hr)",
      "CSV export of weekly audit data",
    ],
    what_excluded: [
      "Competitor adjacency tracking (upgrade to Enterprise)",
      "Custom API + BI integration (upgrade to Enterprise)",
      "Dedicated CSM (upgrade to Enterprise)",
    ],
    psychological_anchor:
      "Half the price of Trax's SG carve-out. Twice the cadence of NielsenIQ. PSG-eligible — net SGD 5K/mo. Replaces a junior trade-marketing analyst at lower cost.",
  },
  {
    name: "Enterprise",
    price_sgd_monthly: 25_000,
    effective_price_after_psg_monthly: 12_500, // PSG 50% on 12-mo commit
    target_persona: "MNC Trade Marketing Manager",
    contract_term: "12-month minimum, EDG-bundleable as a project",
    scope_summary: "15 SKUs × 6 retailers · adjacency · API · CSM · SEA expansion",
    what_in: [
      "15 SKUs × 6 retailers · weekly cadence (overage S$300/SKU/retailer/mo)",
      "Competitor adjacency tracking + shelf-talker placement scoring",
      "Custom API + BI integration (Looker / Power BI / Tableau)",
      "Dedicated CSM with monthly category review session",
      "SEA expansion: MY + ID coverage in Y2 roadmap",
      "Compliance pack: PDPA-registered + SG data residency + IMDA AI Verify alignment",
      "Print-ready quarterly retailer evidence pack (5 categories)",
    ],
    what_excluded: [
      "White-labelled deployment (ask sales)",
      "Cross-MNC competitive panels (regulatory; ask sales)",
    ],
    psychological_anchor:
      "One quarterly retailer category review's worth of facings recovered = 12 months paid. PSG-eligible — net SGD 12.5K/mo, comfortably under Trax's SG carve-out.",
  },
];

// ---------- Grants ----------

export type Grant = {
  name: "PSG" | "EDG" | "SFEC";
  full_name: string;
  coverage_pct: number;
  cap_sgd: number | null;
  applies_to_tiers: ("Pilot" | "Trade" | "Enterprise")[];
  eligibility: string;
  note: string;
};

export const grants: Grant[] = [
  {
    name: "PSG",
    full_name: "Productivity Solutions Grant (IMDA)",
    coverage_pct: 50,
    cap_sgd: 30_000,
    applies_to_tiers: ["Trade", "Enterprise"],
    eligibility:
      "SG-registered, ≥30% local shareholding, ≤SGD 100M revenue or ≤200 staff, subscription on PSG pre-approved listing with ≥12-month commit.",
    note: "PSG pre-approval is in roadmap — apply by 2026-Q3 for the 2026-Q4 SME budget cycle. At Trade tier, halves effective price from SGD 10K → SGD 5K/mo. Cap of SGD 30K/yr binds for Trade buyers running the full 12 months.",
  },
  {
    name: "EDG",
    full_name: "Enterprise Development Grant (Enterprise SG)",
    coverage_pct: 70,
    cap_sgd: null,
    applies_to_tiers: ["Enterprise"],
    eligibility:
      "SG-registered, ≥30% local shareholding, viable business, project filed via Business Grants Portal before start; Enterprise tier bundled with implementation + training as a strategic capability project.",
    note: "Applied to total project cost, not per-month. Useful for the Enterprise tier when sold as a 12-month engagement with a defined transformation outcome (e.g. 'launch SOS dashboard for 5 categories'). Caller out in the sales motion; not stacked on top of PSG.",
  },
  {
    name: "SFEC",
    full_name: "SkillsFuture Enterprise Credit",
    coverage_pct: 90,
    cap_sgd: 10_000,
    applies_to_tiers: [],
    eligibility:
      "SG enterprise with ≥SGD 750 SDL paid, ≥3 SG local employees; bundled with approved training programme.",
    note: "Does not apply to monthly subscription alone. Useful for stretch tier when a training package (e.g. trade marketing analyst certification) is bolted on. Honesty matters — we don't claim SFEC against the Enterprise tier price by default.",
  },
];

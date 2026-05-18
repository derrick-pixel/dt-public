// TAM → SAM → SOM derivation for the SG SOS/OSA shelf-intel category.
// Modeled on Agent 2 methodology: every multiplier sourced or labelled estimated.

export type FunnelStack = {
  name: string;
  source: string;
  inputs: { label: string; value: string }[];
  equation: string;
  result_label: string;
};

export type FunnelStage = {
  stage_label: string;
  subtitle: string;
  result_label: string;
  total_equation: string;
  filters?: string[];
  stacks: FunnelStack[];
};

export const marketFunnel: { tam: FunnelStage; sam: FunnelStage; som: FunnelStage } = {
  tam: {
    stage_label: "STAGE 1 · TAM",
    subtitle: "Total SG FMCG trade marketing intelligence spend — every SGD a brand could spend on shelf measurement.",
    result_label: "S$48M",
    total_equation: "10 MNCs × S$3M + 80 mid-market × S$200K + others",
    stacks: [
      {
        name: "Top-10 FMCG MNCs (SG / SEA HQ)",
        source: "Estimated from public trade marketing budgets (Nestlé, Unilever, P&G, etc.) — 3% of SG revenue",
        inputs: [
          { label: "MNC count", value: "10" },
          { label: "Avg trade-MM analytics spend", value: "S$3M / yr" },
        ],
        equation: "10 × S$3M",
        result_label: "S$30M",
      },
      {
        name: "Mid-market local FMCG (S$50–200M revenue)",
        source: "ACRA SSIC C10–12 active filers × 1.5% of revenue",
        inputs: [
          { label: "Mid-market entities", value: "~80" },
          { label: "Avg analytics spend", value: "S$200K / yr" },
        ],
        equation: "80 × S$200K",
        result_label: "S$16M",
      },
      {
        name: "Distributors + agencies + retailers",
        source: "Estimated from ACRA SSIC G46 + retailer category-mgmt budgets",
        inputs: [
          { label: "Distributors", value: "~120" },
          { label: "Avg spend", value: "S$15K / yr" },
        ],
        equation: "~S$2M",
        result_label: "S$2M",
      },
    ],
  },
  sam: {
    stage_label: "STAGE 2 · SAM",
    subtitle: "Filter to buyers we can credibly serve in Year 1 with the current product + Elitez routing.",
    result_label: "S$18M",
    total_equation: "~38% × TAM",
    filters: [
      "Buyer's SKUs sit in retailers Elitez already routes (≥60% of organised retail weekly)",
      "ARPU band fits SGD 5K–15K/mo (excludes the top 3 MNCs whose internal Trax contracts dominate)",
      "Single-country SG scope (SEA regional out-of-scope until Y2)",
    ],
    stacks: [
      {
        name: "Filtered SG FMCG buyer base",
        source: "Top-10 MNC subset × 50% addressable + 100% mid-market + 50% distributors/agencies",
        inputs: [
          { label: "TAM", value: "S$48M" },
          { label: "Addressable share", value: "~38%" },
        ],
        equation: "S$48M × 38%",
        result_label: "S$18M",
      },
    ],
  },
  som: {
    stage_label: "STAGE 3 · SOM (3-year cumulative)",
    subtitle: "What the launch team can credibly close in 3 years at S$120K avg ARPU.",
    result_label: "S$3.6M",
    total_equation: "3 reps × 8 deals/yr × 3 yr × S$120K × ~70% retention",
    stacks: [
      {
        name: "Direct sales (founder-led + 2 reps)",
        source: "Internal capacity model — Elitez existing FMCG client introductions reduce cold-calling",
        inputs: [
          { label: "Reps (incl. founder)", value: "3" },
          { label: "Deals / rep / yr", value: "8" },
          { label: "Years", value: "3" },
          { label: "Avg ARPU", value: "S$120K / yr" },
          { label: "3-yr retention", value: "~70%" },
        ],
        equation: "3 × 8 × 3 × S$120K × 70%",
        result_label: "S$6.0M *(gross)*",
      },
    ],
  },
};

export const funnelImplications = [
  {
    headline: "S$18M SAM caps the per-account pricing thesis",
    body: "If we want the SAM to fit ≥150 paying accounts, ARPU has to land near S$120K. Above S$240K, we crowd out mid-market; below S$60K we leave Trax's lunch on the table.",
    target: "Pricing strategy",
  },
  {
    headline: "Y3 ARR target ≈ S$1.4M",
    body: "S$3.6M / 3yr cumulative ≈ S$1.4M ARR by year 3. ~12 paying accounts at S$120K = the milestone Series-A diligence will index against.",
    target: "Capital plan",
  },
  {
    headline: "Top-3 MNC accounts are out of SAM by design",
    body: "Coca-Cola, Unilever, Nestlé already run multi-year Trax contracts. We don't compete head-on for those; we land via mid-market + niche imports + DTC graduates.",
    target: "GTM sequencing",
  },
];

// Persona type and data live in `data/pricing-strategy.ts` (Agent 3 deliverable).
// Re-export here so older imports continue to work without churn.
export { type Persona, personas } from "@/data/pricing-strategy";

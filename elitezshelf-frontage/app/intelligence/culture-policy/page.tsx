import { Section, SectionHeading, Card } from "@/components/ui/card";
import { IntelTabs } from "@/components/intel/IntelTabs";
import { ShelfHeatmap } from "@/components/shelf/ShelfHeatmap";

export const metadata = {
  title: "Culture & policy",
  description: "Nutri-Grade, HCS, Halal, festival regulatory windows, sustainability, and SEA cross-border policy notes.",
};

const subsections = [
  {
    id: "nutri-grade",
    label: "Nutri-Grade (HPB)",
    title: "Nutri-Grade labelling has rewritten the chiller. Quietly.",
    body: [
      "Mandatory grades for pre-packaged beverages, with advertising prohibition for Grade D. Enforced from 30 December 2023, extended to freshly-prepared beverages from December 2023.",
      "Implications for shelf placement: Grade D is losing eye-level facings even where shopper indexes lean indulgent (Donki, FairPrice Hyper). Retailer category managers are pre-emptively rebalancing planograms to avoid carrying Grade D ad volume risk.",
      "Implication for promo: Grade D promo intensity has declined ~40% YoY. The promo dollars are flowing into Grade B reformulations and Grade A flank brands.",
    ],
  },
  {
    id: "hcs",
    label: "Healthier Choice Symbol (HCS)",
    title: "HCS is voluntary. Shoppers know it anyway.",
    body: [
      "Voluntary HPB symbol granted to ~5,000 product variants. Shopper recognition exceeds 95% in our intercept data — particularly with parents.",
      "Brand strategies splitting: incumbents reformulate (e.g., Milo's reduced-sugar variants); challenger brands launch HCS-first (e.g., new local plant-milk SKUs).",
      "Shelf signal: HCS-marked SKUs cluster at eye-level even when category planogram doesn't require it. We track this as the 'HCS lift' — typically +1.5 facings in the chiller and snacks aisle.",
    ],
  },
  {
    id: "halal",
    label: "Halal certification (MUIS)",
    title: "Halal is a hard constraint, not a marketing claim.",
    body: [
      "Halal-certified by MUIS — non-negotiable for ~15% of the population, and an adjacency rule for retailers serving heartland Malay communities.",
      "Adjacency: alcohol cannot be next to halal staples in some retailers (notably NTUC FairPrice Hyper at Aljunied / Tampines and FairPrice Finest at Bukit Timah). We track adjacency violations as compliance signal.",
      "Whitespace: halal-certified premium chocolate is the standout under-indexed category — current top-3 SOS at 4.2% versus SG average of 11.7% in equivalent retailers.",
    ],
  },
  {
    id: "festivals",
    label: "Festival regulatory windows",
    title: "CNY food imports, Hari Raya manpower, and other timing bombs.",
    body: [
      "CNY food imports: SFA (Singapore Food Agency) inspections tighten in the 4-week pre-CNY window. Mandarin orange and gift-pack SKUs face holds at the border. Build cushion 2 weeks earlier than standard CNY planogram start.",
      "Hari Raya MOM workforce schedules: merchandiser availability dips in the week before Hari Raya. Plan for a one-week hold on planogram resets in heartland retailers.",
      "Deepavali / Christmas: relatively unconstrained, but customs clearance and SFA inspection still applies for sweets and alcohol respectively.",
    ],
  },
  {
    id: "sustainability",
    label: "Sustainability & packaging",
    title: "Singapore Mandatory Reporting + EPR are coming.",
    body: [
      "Mandatory packaging reporting under MEWR is in force; full Extended Producer Responsibility (EPR) for packaging is signalled for 2026–2027.",
      "Implications for SOS: lighter packs, refill formats, on-shelf eco-labelling. Refill home-care formats are the most under-indexed shelf segment versus shopper preference data.",
      "Brand strategy: cleartext eco labelling on shelf-talker copy is becoming a planogram input. We track 'eco-claim density' on shelf-talkers as a leading indicator of category direction.",
    ],
  },
  {
    id: "sea",
    label: "Cross-border SEA notes",
    title: "Indonesian halal certification is the pivot point for regional rollout.",
    body: [
      "Indonesia: BPJPH halal certification (transferred from MUI in 2024) is a hard prerequisite for shelf placement in Hypermart, Super Indo, Indomaret. Lead time 6–9 months — bake this into your launch plan.",
      "Malaysia: JAKIM halal mainline; KKM (MOH) labelling for sugar-content claims. Less stringent than Singapore Nutri-Grade, but converging.",
      "Thailand: Thai FDA labelling rules for imported FMCG; sugar tax escalation has reshaped beverage SKUs since 2017. Plant-milk segment is structurally under-served at the shelf.",
      "Philippines: BFAD/FDA label compliance; tax stamps on alcohol. Sari-sari channel doesn't show in any global SOS tool — and we have a roadmap there in Year 2.",
      "Vietnam: VFA registration; emerging modern trade. Convenience store chains (Circle K, GS25) are the fast-moving shelf to track.",
    ],
  },
];

export default function CulturePolicyPage() {
  return (
    <>
      <Section className="!pb-4">
        <SectionHeading
          eyebrow="Culture & policy"
          title="The non-shelf inputs that decide what's on the shelf."
          description="Six regulatory and cultural axes that shape Singaporean retail. Each section is short — but each is the kind of context that distinguishes a competent trade marketer from one who's just reading dashboards."
        />
        <IntelTabs />
      </Section>

      {subsections.map((s, i) => (
        <Section key={s.id} id={s.id} className={`!py-8 ${i > 0 ? "border-t border-border/60" : ""}`}>
          <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:gap-12">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-primary font-mono">{s.label}</p>
              <h3 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">
                {s.title}
              </h3>
            </div>
            <div className="space-y-4 text-base text-text-muted leading-relaxed">
              {s.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
              {s.id === "nutri-grade" && (
                <Card className="!p-4 mt-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted/70 font-mono mb-2">Chiller mix · synthetic, 18 months</p>
                  <ShelfHeatmap rows={3} cols={18} palette="teal" />
                </Card>
              )}
            </div>
          </div>
        </Section>
      ))}
    </>
  );
}

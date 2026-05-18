import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { asset } from "@/lib/utils";
import { Section, SectionHeading, Card } from "@/components/ui/card";
import { KpiTile } from "@/components/shelf/KpiTile";
import { ChartTile } from "@/components/intel/ChartTile";
import { RetailerDonut } from "@/components/intel/RetailerDonut";
import { CategoryGrowthBar } from "@/components/intel/CategoryGrowthBar";
import { SosMoversBar } from "@/components/intel/SosMoversBar";
import { ShelfHeatmap } from "@/components/shelf/ShelfHeatmap";
import { PriceElasticityScatter } from "@/components/intel/PriceElasticityScatter";
import { CoverageMap } from "@/components/intel/CoverageMap";
import { MarketFunnel } from "@/components/intel/MarketFunnel";
import { PersonaNbaCard } from "@/components/intel/PersonaNbaCard";
import { IntelTabs } from "@/components/intel/IntelTabs";
import { Button } from "@/components/ui/button";
import { funnelImplications, personas } from "@/data/market-funnel";

export const metadata = {
  title: "Intelligence",
  description: "TAM/SAM/SOM funnel for SG SOS/OSA intel, buyer personas with NBA arithmetic, market dashboards, and 6 sub-routes.",
};

export default function IntelligencePage() {
  return (
    <>
      <Section className="!pb-4">
        <SectionHeading
          eyebrow="Executive summary"
          title="The Singapore SOS / OSA intelligence market, sized."
          description="Five frameworks. TAM → SAM → SOM funnel. Buyer personas with structured Next-Best-Alternative arithmetic. Strategy canvas + segment×need heatmap. The shelf-side dashboards are downstream of this."
        />
        <IntelTabs />
      </Section>

      <Section className="!pt-0">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiTile label="SG packaged FMCG market" prefix="SGD " value={5.2} suffix="B" decimals={1} helper="annualised, 2025E · synthetic" />
          <KpiTile label="NTUC FairPrice outlets covered" value={230} helper="weekly merchandiser visits" />
          <KpiTile label="Weekly coverage of organised retail" value={62.4} suffix="%" decimals={1} delta={2.1} helper="vs 60.3% rolling 4w" />
          <KpiTile label="SKUs in reference library" value={18400} helper="Y1 target · sub-variant level" />
        </div>
      </Section>

      {/* TAM/SAM/SOM funnel */}
      <Section className="!py-8">
        <SectionHeading
          eyebrow="Artefact 01 · Market sizing funnel"
          title="TAM → SAM → SOM, with every multiplier audited."
          description="The SG SOS / OSA intelligence category. Top-down market estimate × Elitez routing reach × Year-3 sales capacity. Numbers are directional — replace with verified figures before launch."
        />
        <figure className="mt-10 grid gap-6 lg:grid-cols-[1fr_minmax(0,360px)] lg:items-start">
          <div className="rounded-3xl border-2 border-primary/15 bg-bg-elevated p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted/80 mb-3">— Funnel illustration —</p>
            <p className="text-sm text-kopi/80 leading-relaxed max-w-prose">
              The funnel below renders the same shape as our framework: total market at the top,
              addressable filter in the middle, obtainable subset at the base. Auditable
              breakdowns sit underneath in the calculation panels.
            </p>
          </div>
          <Image
            src={asset("/img/w04.jpg")}
            alt="Hand-drawn TAM / SAM / SOM funnel illustration with three stacked rounded rectangles in papaya, mint, and pink"
            width={900}
            height={1200}
            className="block w-full h-auto rounded-3xl border-2 border-primary/15 bg-bg-elevated"
          />
        </figure>
        <div className="mt-8">
          <MarketFunnel />
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {funnelImplications.map((i) => (
            <Card key={i.headline} className="space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">→ {i.target}</p>
              <h4 className="text-base font-semibold text-text leading-snug">{i.headline}</h4>
              <p className="text-sm text-text-muted leading-relaxed">{i.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Personas + NBA */}
      <Section className="!py-8">
        <SectionHeading
          eyebrow="Artefact 02 · Buyer personas · NBA arithmetic"
          title="Three personas. Every WTP band tied to verifiable arithmetic."
          description="Next-Best-Alternative method per persona — competitor price, displaced wage, or tooling-stack stack-up. wtp_band.expected must sit between 0.4× and 1.2× nba.monthly_sgd_equivalent or the persona is flagged as exploratory."
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {personas.map((p) => (
            <PersonaNbaCard key={p.id} p={p} />
          ))}
        </div>
      </Section>

      <Section className="!pt-12 !pb-2">
        <SectionHeading
          eyebrow="Sample shelf-intel dashboards"
          title="What the live deployment renders for your buyer."
          description="The frameworks above sit upstream. These six tiles are the downstream artefact — what shows up in your trade-marketing weekly review."
        />
      </Section>

      <Section className="!py-8 grid gap-6 lg:grid-cols-2">
        <ChartTile
          title="Market share by retailer"
          subtitle="Donut · share of organised retail SKU sales"
          footer={
            <>NTUC dominates volume. DFI (Cold Storage + Giant) holds premium and value flank. Donki and Mustafa over-index for niche imports.</>
          }
        >
          <RetailerDonut />
          <table className="sr-only">
            <caption>Market share by retailer</caption>
            <thead><tr><th>Retailer</th><th>Share %</th><th>Outlets</th></tr></thead>
          </table>
        </ChartTile>
        <ChartTile
          title="Category growth (YoY)"
          subtitle="Health & wellness, frozen, beverages outpace household and alcohol"
          footer={<>Health &amp; wellness (+8.7%) and frozen (+6.3%) lead. Alcohol (-2.1%) and household (-0.8%) lag.</>}
        >
          <CategoryGrowthBar />
        </ChartTile>
      </Section>

      <Section className="!py-8 grid gap-6 lg:grid-cols-2">
        <ChartTile
          title="Top SOS movers — last 4 weeks"
          subtitle="Brand-level share-on-shelf delta in pp"
          footer={<>Pocari Sweat (+2.4pp) and Pantene (+2.1pp) are the meaningful movers; Pepsi and Lay's are losing facings to value alternatives.</>}
        >
          <SosMoversBar />
        </ChartTile>
        <ChartTile
          title="OOS heatmap · retailer × category"
          subtitle="Stoplight palette: green = healthy, red = systemic OOS"
          footer={<>Frozen and ice cream show the most volatile OOS. Personal care is the most consistent.</>}
        >
          <ShelfHeatmap
            rows={8}
            cols={12}
            palette="stoplight"
            rowLabels={["NTUC", "Sheng Siong", "Cold Storage", "Giant", "Prime", "Donki", "FP Finest", "Mustafa"]}
            colLabels={["CSD", "Sn", "Cf", "Da", "Fz", "PC", "Hh", "Al", "AsD", "Ck", "Hl", "Pt"]}
          />
        </ChartTile>
      </Section>

      <Section className="!py-8 grid gap-6 lg:grid-cols-[1.05fr_1fr]">
        <ChartTile
          title="Price elasticity"
          subtitle="Promo depth × volume uplift, top 100 SKUs"
          footer={<>Snacks and confectionery clear the steepest elasticity slopes. CSD and isotonic are inelastic — promo depth past 15% buys little uplift.</>}
        >
          <PriceElasticityScatter />
        </ChartTile>
        <ChartTile
          title="Coverage map"
          subtitle="Stylised SG · weekly merchandiser visits per district"
          footer={<>~370 visits/week. Heartland ring is dense; CBD has lower visit count but higher per-store revenue weight.</>}
        >
          <CoverageMap />
        </ChartTile>
      </Section>

      <Section className="!py-12">
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-bg-elevated p-8 sm:p-10">
          <p className="text-base text-text-muted max-w-3xl">
            This is sample data. Your dashboard, populated weekly with your SKUs across your retailers,
            takes <span className="text-primary font-mono">four weeks</span> to stand up.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link href="/demo">
              Book a walkthrough <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Section>
    </>
  );
}

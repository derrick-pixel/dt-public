import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Section, SectionHeading, Card } from "@/components/ui/card";
import { IntelTabs } from "@/components/intel/IntelTabs";
import { StrategyCanvasRadar } from "@/components/intel/StrategyCanvasRadar";
import { WhitespaceHeatmap } from "@/components/intel/WhitespaceHeatmap";
import { AttackPlanGrid } from "@/components/intel/AttackPlanCard";
import { Button } from "@/components/ui/button";
import { headlineThesis, canvasDimensions } from "@/data/whitespace-framework";
import { asset } from "@/lib/utils";

export const metadata = {
  title: "Whitespace + attack",
  description: "Strategy canvas (radar) + segment×need heatmap + 3 ranked attack plans for ElitezShelf vs Trax / ShelfPerfect / NielsenIQ / DIY apps.",
};

export default function WhitespacePage() {
  return (
    <>
      <Section className="!pb-4">
        <SectionHeading
          eyebrow="Whitespace · strategy canvas + heatmap + attack plans"
          title="Where the category is open. Where we win first."
          description="Three artefacts work together. The strategy-canvas radar plots ElitezShelf against Trax, ShelfPerfect, NielsenIQ, and DIY rep apps on the dimensions FMCG buyers actually evaluate. The segment × need heatmap counts how many competitors genuinely serve each pair. The three ranked attack plans translate green cells into go-to-market specs."
        />
        <IntelTabs />
      </Section>

      {/* Headline thesis */}
      <Section className="!py-8">
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-bg-elevated p-7 sm:p-9">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary mb-3">Headline thesis</p>
          <p className="text-xl sm:text-2xl text-text leading-snug max-w-4xl">
            "{headlineThesis}"
          </p>
        </div>
      </Section>

      {/* Competitive landscape illustration */}
      <Section className="!py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          <div className="space-y-4 max-w-prose">
            <p className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-accent font-mono font-semibold">— The competitive plot —</p>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-primary leading-tight">
              The category, plotted on the only two axes that decide the deal.
            </h3>
            <p className="text-kopi/80 leading-relaxed">
              Audit cadence × coverage cost. Trax and ShelfPerfect are stuck in the high-cost
              upper-right; NielsenIQ trades cadence for breadth in the bottom-left. The
              underserved corner — high cadence at low coverage cost — is the one no
              incumbent can reach without re-routing field manpower they don't have.
            </p>
          </div>
          <figure className="overflow-hidden rounded-3xl border-2 border-primary/15 bg-bg-elevated">
            <Image
              src={asset("/img/w03.jpg")}
              alt="Hand-drawn 2×2 quadrant on cream paper plotting Audit cadence vs Coverage cost. ElitezShelf occupies the upper-right corner as a bold papaya circle"
              width={1200}
              height={900}
              className="block w-full h-auto"
            />
          </figure>
        </div>
      </Section>

      {/* Strategy canvas */}
      <Section className="!py-8">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          <div className="rounded-xl border border-border bg-bg-elevated/60 p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted/70 mb-1">
              Artefact 01 · Strategy canvas
            </p>
            <h3 className="text-lg font-semibold text-text">8 dimensions × 5 actors · 0–5 scoring</h3>
            <p className="mt-2 text-xs text-text-muted leading-relaxed max-w-prose">
              Customer evaluation axes — not feature checklists. The cluster reveals where incumbents converge.
              Our line breaks the cluster on three axes, deliberately concedes one (image-AI maturity).
            </p>
            <div className="mt-3">
              <StrategyCanvasRadar />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-bg-elevated/60 p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted/70 mb-3">
              Scoring rubric
            </p>
            <ul className="space-y-3 text-xs">
              {canvasDimensions.map((d) => (
                <li key={d.key}>
                  <p className="font-medium text-text">{d.label}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-text-muted/70 leading-snug">
                    {d.rubric}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Heatmap */}
      <Section className="!py-8">
        <div className="mb-5 max-w-3xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted/70 mb-1">
            Artefact 02 · Segment × Need heatmap
          </p>
          <h3 className="text-2xl font-semibold tracking-tight text-text">
            Each cell counts competitors scoring ≥ 3 on that pair.
          </h3>
          <p className="mt-2 text-sm text-text-muted leading-relaxed">
            Click any cell to inspect the competitor breakdown and pair-specific specialisation. Cells with{" "}
            <span className="font-mono text-primary">our_score ≥ 4</span> are flagged as attack candidates.
          </p>
        </div>
        <WhitespaceHeatmap />
      </Section>

      {/* Attack plans */}
      <Section className="!py-8">
        <div className="mb-6 max-w-3xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted/70 mb-1">
            Artefact 03 · Attack plans · top 3
          </p>
          <h3 className="text-2xl font-semibold tracking-tight text-text">
            Three plans. Ranked by TAM × inverse(competitor_count) × our_advantage.
          </h3>
          <p className="mt-2 text-sm text-text-muted leading-relaxed">
            Every plan binds to a green cell on the heatmap with our_score ≥ 4.
            ICP, TAM with reasoning, why-the-gap, why-we-win, and a 4-line GTM (channel · pitch · pricing · content).
          </p>
        </div>
        <AttackPlanGrid />
      </Section>

      {/* Honest caveats */}
      <Section className="!py-8">
        <SectionHeading eyebrow="Caveats" title="Where we deliberately concede." />
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <Card className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">image_ai_maturity = 2/5</p>
            <p className="text-sm text-text-muted leading-relaxed">
              Trax holds 13+ years of training data; we will not match its sub-variant accuracy in Year 1
              outside core categories. We backfill via human-in-the-loop tagging within 48h per new SKU.
            </p>
          </Card>
          <Card className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">regional_panel = NielsenIQ</p>
            <p className="text-sm text-text-muted leading-relaxed">
              NielsenIQ Brandbank's purchase-side panels are not ours. We are a complement, not a replacement,
              for monthly panel data — and we will say so to the CFO.
            </p>
          </Card>
          <Card className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">attack #1 only · MNCs</p>
            <p className="text-sm text-text-muted leading-relaxed">
              The top-3 MNCs (Coca-Cola, Unilever, Nestlé) already run multi-year Trax contracts.
              We do not lead with them; we land via mid-market, niche imports, and DTC graduates.
            </p>
          </Card>
        </div>
      </Section>

      {/* Sample shelf gallery */}
      <Section className="!py-8">
        <SectionHeading
          eyebrow="Sample shelf captures"
          title="What the live feed actually looks like."
          description="Three retailer environments where the underlying body-cam pipeline is already routed weekly."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { src: "/img/h02.jpg", alt: "Sheng Siong Bedok snacks aisle live capture", caption: "Sheng Siong Bedok · snacks" },
            { src: "/img/h03.jpg", alt: "Cold Storage Marina premium chiller live capture", caption: "Cold Storage Marina · chiller" },
            { src: "/img/h04.jpg", alt: "Don Don Donki Orchard niche imports live capture", caption: "Donki Orchard · imports" },
          ].map((g) => (
            <figure key={g.src} className="group relative overflow-hidden rounded-xl border border-border bg-bg-elevated">
              <Image
                src={asset(g.src)}
                alt={g.alt}
                width={1600}
                height={1200}
                sizes="(max-width: 768px) 100vw, 33vw"
                className="block aspect-[4/3] w-full object-cover transition-transform group-hover:scale-[1.02]"
              />
              <figcaption className="border-t border-border/60 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                ● REC · {g.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* Closing CTA */}
      <Section className="!py-12">
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-bg-elevated p-8 sm:p-12 text-center">
          <h3 className="text-2xl sm:text-4xl font-semibold tracking-tight max-w-3xl mx-auto leading-tight">
            We will run this canvas + heatmap on your category — for free — in your demo.
          </h3>
          <p className="mt-4 max-w-2xl mx-auto text-text-muted">
            Three named whitespace cells in your SKUs. You decide whether they're worth more than our annual fee.
          </p>
          <Button asChild size="lg" className="mt-7">
            <Link href="/demo">
              Run it on my category <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Section>
    </>
  );
}

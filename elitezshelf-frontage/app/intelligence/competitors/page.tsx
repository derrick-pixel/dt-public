import Link from "next/link";
import { ArrowRight, ScaleIcon } from "lucide-react";
import { Section, SectionHeading, Card } from "@/components/ui/card";
import { IntelTabs } from "@/components/intel/IntelTabs";
import { CompetitorMatrix } from "@/components/intel/CompetitorMatrix";
import { CompetitorQuadrant } from "@/components/intel/CompetitorQuadrant";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Competitor analytics",
  description: "ElitezShelf vs Trax Retail, ShelfPerfect, NielsenIQ Brandbank, DIY rep apps — a structural argument.",
};

export default function CompetitorsPage() {
  return (
    <>
      <Section className="!pb-4">
        <SectionHeading
          eyebrow="Competitor analytics"
          title="The retail intelligence landscape, plotted honestly."
          description="There are four ways FMCG MNCs measure shelves today. None of them are bad. All of them have a structural ceiling we don't."
        />
        <IntelTabs />
      </Section>

      <Section className="!py-8 grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <CompetitorQuadrant />
        <div>
          <h3 className="text-2xl font-semibold tracking-tight">Where we sit, and why.</h3>
          <p className="mt-3 text-text-muted leading-relaxed">
            Trax goes top-left: real-time, but expensive — fixed cameras and dedicated auditors.
            NielsenIQ Brandbank lives bottom-left: monthly cadence, asset-light, but data-light.
            DIY rep apps cluster top-right at low quality. ElitezShelf occupies the upper-right corner that
            no incumbent can reach without re-routing field manpower they don't have.
          </p>
        </div>
      </Section>

      <Section className="!py-8">
        <SectionHeading eyebrow="Capability matrix" title="Feature-for-feature, head-to-head." />
        <CompetitorMatrix className="mt-8" />
      </Section>

      <Section className="!py-8">
        <SectionHeading eyebrow="The structural argument" title="Why the unit economics decide this." />
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-xl border border-border bg-bg-elevated/60 p-7 prose-invert prose-sm max-w-none">
            <p className="text-text leading-relaxed">
              A Trax-style deployment in Singapore requires roughly{" "}
              <span className="font-mono text-primary">~150 fixed cameras at S$2,000 CapEx + S$200/mo SaaS each</span>,
              or roughly{" "}
              <span className="font-mono text-primary">~30 dedicated auditors at S$3,500/mo loaded cost.</span>
              Either path runs into six figures annually before the first dashboard renders.
            </p>
            <p className="mt-4 text-text-muted leading-relaxed">
              ElitezShelf rides on existing routed merchandisers — staff who are already in those stores
              every week, walking those aisles, with retailer relationships intact at the chain level.
              Marginal cost: a S$280 body-cam and 4 minutes of upload time per visit.
            </p>
            <p className="mt-4 text-text-muted leading-relaxed">
              That difference is not a margin advantage. It's a different business model. Until an
              incumbent finds 350 merchandisers that are already routed, they cannot reproduce it.
            </p>
          </div>
          <div className="space-y-4">
            <CostCard
              variant="trax"
              label="Trax-style fixed-camera"
              cost="S$300K+ CapEx · S$30K+ /mo"
              note="150 cameras × S$2K CapEx + S$200/mo SaaS each. National coverage requires retailer permission and infrastructure work."
            />
            <CostCard
              variant="trax"
              label="Trax-style auditor model"
              cost="S$1.26M /yr"
              note="30 dedicated auditors × S$3,500/mo loaded. Per-visit cost stays flat regardless of category breadth."
            />
            <CostCard
              variant="elitezshelf"
              label="ElitezShelf"
              cost="~S$0 CapEx · marginal /visit"
              note="Reuse existing merchandiser rotation. S$280 body-cam (one-off). Cost scales with categories observed, not visits performed."
            />
          </div>
        </div>
      </Section>

      <Section className="!py-8">
        <SectionHeading eyebrow="Where they're better" title="Honesty as differentiation." />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Card className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted/70 font-mono">Trax</p>
            <p className="font-medium text-text">13+ years of model training data.</p>
            <p className="text-sm text-text-muted leading-relaxed">
              On day one, Trax has more SKU variety in its computer vision library than we will
              for our first two quarters. We catch up faster than they think — but not faster than they had a head start.
            </p>
          </Card>
          <Card className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted/70 font-mono">NielsenIQ</p>
            <p className="font-medium text-text">Owns the purchase-side panel.</p>
            <p className="text-sm text-text-muted leading-relaxed">
              Household panels and POS data are not ours. NielsenIQ tells you who bought.
              We tell you what was on the shelf when they didn't. They are complementary,
              not competing — and we will say so to your CFO.
            </p>
          </Card>
          <Card className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted/70 font-mono">ShelfPerfect</p>
            <p className="font-medium text-text">Mature execution playbook.</p>
            <p className="text-sm text-text-muted leading-relaxed">
              ShelfPerfect knows how to run a 4-week project. We are still learning the
              elegance of their on-demand workflow. That is on our roadmap.
            </p>
          </Card>
        </div>
      </Section>

      <Section className="!py-12">
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-bg-elevated p-8 sm:p-10 grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <ScaleIcon className="h-6 w-6 text-primary mb-3" />
            <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Run us alongside Trax for one quarter and compare.
            </h3>
            <p className="mt-3 text-text-muted">
              Most of our pilot conversations end here. We are not asking you to rip out
              what works. We are asking for the gap that monthly panels and CapEx cameras
              physically cannot fill.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/demo">Start the comparison <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </Section>
    </>
  );
}

function CostCard({
  label, cost, note, variant,
}: Readonly<{ label: string; cost: string; note: string; variant: "trax" | "elitezshelf" }>) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        variant === "elitezshelf"
          ? "border-primary/40 bg-primary/5"
          : "border-border bg-bg-elevated/60"
      }`}
    >
      <p className={`text-[10px] uppercase tracking-[0.18em] font-mono ${variant === "elitezshelf" ? "text-primary" : "text-text-muted/70"}`}>{label}</p>
      <p className="mt-1 font-mono text-lg font-semibold text-text">{cost}</p>
      <p className="mt-2 text-xs text-text-muted leading-relaxed">{note}</p>
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Section, SectionHeading, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { asset } from "@/lib/utils";
import { CompetitorPriceBenchmark } from "@/components/intel/CompetitorPriceBenchmark";
import { PersonaNbaCard } from "@/components/intel/PersonaNbaCard";
import { PricingModelMatrix } from "@/components/intel/PricingModelMatrix";
import { ElasticityTable } from "@/components/intel/ElasticityTable";
import { TierLadder } from "@/components/intel/TierLadder";
import { GrantsTable } from "@/components/intel/GrantsTable";
import { personas, pricingThesis } from "@/data/pricing-strategy";

export const metadata = {
  title: "Pricing",
  description:
    "ElitezShelf pricing strategy: 3 tiers (Pilot · Trade · Enterprise), 5 buyer personas with NBA arithmetic, competitor pricing benchmark, elasticity, PSG/EDG/SFEC grant math.",
};

export default function PricingPage() {
  return (
    <>
      {/* Pricing thesis */}
      <Section className="!pb-8">
        <SectionHeading
          eyebrow="Pricing strategy"
          title="Three tiers. NBA-anchored. PSG-stacked."
          description="The pricing playbook produced by Agent 3 of the competitor-intel methodology — five buyer personas with structured Next-Best-Alternative arithmetic, competitor pricing benchmark, elasticity by segment, three recommended tiers, and the SG grant stack."
        />
        <div className="mt-8 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-bg-elevated p-7 sm:p-9">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary mb-3">
            Pricing thesis · ≤ 100 words
          </p>
          <p className="text-base sm:text-lg text-text leading-relaxed max-w-4xl">
            {pricingThesis}
          </p>
        </div>
      </Section>

      {/* Tier ladder — lead with the answer */}
      <Section className="!py-8">
        <SectionHeading
          eyebrow="Pillar D · Recommended tiers"
          title="Pilot. Trade. Enterprise."
          description="Each tier targets exactly one persona. PSG halves the Trade and Enterprise effective price for SG buyers on a 12-month commit."
        />
        <div className="mt-10">
          <TierLadder />
        </div>
        <div className="mt-8 grid gap-3 md:grid-cols-3 text-sm">
          <PriceCallout
            label="Trade list"
            value="S$10,000 / mo"
            sub="vs. Trax ~S$30K · half the headline"
          />
          <PriceCallout
            label="Trade after PSG"
            value="S$5,000 / mo"
            sub="50% IMDA grant · 12-mo commit"
            highlight
          />
          <PriceCallout
            label="Enterprise after PSG"
            value="S$12,500 / mo"
            sub="vs. Trax SG carve-out S$25–50K"
          />
        </div>
      </Section>

      {/* Competitor pricing benchmark */}
      <Section className="!py-8">
        <SectionHeading
          eyebrow="Anchor 01 · Competitor pricing"
          title="What the incumbents charge."
          description="Most figures are estimated — Trax and NielsenIQ pricing is not public. Bands reflect SG-specific contract benchmarks from agency interviews and G2 / vendor public pricing pages where available."
        />
        <div className="mt-8">
          <CompetitorPriceBenchmark />
        </div>
      </Section>

      {/* Buyer personas with NBA */}
      <Section className="!py-8">
        <SectionHeading
          eyebrow="Pillar A · Buyer personas · 5"
          title="Five archetypes. Each with a verifiable NBA."
          description="Every persona's WTP band must sit between 0.4× and 1.2× of nba.monthly_sgd_equivalent. Outside that band, the persona is flagged exploratory. Confidence reflects how grounded the NBA arithmetic is — not how confident we are in the persona."
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {personas.slice(0, 3).map((p) => (
            <PersonaNbaCard key={p.id} p={p} />
          ))}
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {personas.slice(3).map((p) => (
            <PersonaNbaCard key={p.id} p={p} />
          ))}
        </div>
      </Section>

      {/* Pricing model matrix */}
      <Section className="!py-8">
        <SectionHeading
          eyebrow="Pillar B · Pricing models scored by persona"
          title="Five candidate models. Flat SKU-bundle wins."
          description="Each model scored 1–5 against each persona. Pick the model that scores highest at the highest-value persona — not highest on average. Keep the runner-up in your back pocket; it shows up inside the Enterprise tier as the per-SKU overage mechanic."
        />
        <div className="mt-8">
          <PricingModelMatrix />
        </div>
      </Section>

      {/* Elasticity */}
      <Section className="!py-8">
        <SectionHeading
          eyebrow="Pillar C · Elasticity per segment"
          title="Default = medium. Override only with evidence."
          description="SG SME markets are mostly medium-elastic. We override to 'high' only for the Challenger DTC segment, where cohort interviews show explicit price walks above S$8K/mo monthly."
        />
        <div className="mt-8">
          <ElasticityTable />
        </div>
      </Section>

      {/* What Enterprise actually delivers */}
      <Section className="!py-8">
        <SectionHeading
          eyebrow="What Enterprise delivers"
          title="The retailer evidence pack is the Enterprise asset."
          description="Quarterly print-ready PDF assembled from 12 weeks of weekly captures across the contract retailers. The artefact a Trade Marketing Manager walks into a Category Manager review with."
        />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_minmax(0,520px)] lg:items-center">
          <div className="space-y-4 text-text-muted leading-relaxed max-w-prose">
            <p>
              Every Enterprise account gets a quarterly retailer evidence pack — one PDF per
              retailer × category, photo grid of shelf states across 12 weeks, facings-count
              timeline, and OOS-frequency annotations.
            </p>
            <p>
              All photos are timestamped and GPS-tagged. PDPA-compliant capture means
              incidental persons are blurred at the camera before footage leaves the
              merchandiser's body-cam.
            </p>
            <p>
              The pack is the asset that makes the Q-on-Q retailer review productive — buyers
              respond to fresh weekly evidence, not to monthly panel summaries.
            </p>
          </div>
          <figure className="relative overflow-hidden rounded-xl border border-border bg-bg-elevated">
            <Image
              src={asset("/img/u03.jpg")}
              alt="Retailer evidence pack — printed PDF mockup with NTUC FairPrice header, 12-week facings count chart, and 4-photo capture grid"
              width={1200}
              height={1500}
              sizes="(max-width: 1024px) 100vw, 520px"
              className="block w-full h-auto"
            />
            <figcaption className="border-t border-border/60 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
              ● Quarterly retailer evidence pack · sample
            </figcaption>
          </figure>
        </div>
      </Section>

      {/* Grants */}
      <Section className="!py-8">
        <SectionHeading
          eyebrow="SG grant stack"
          title="PSG halves the Trade tier. EDG bundles the Enterprise project."
          description="The single highest-leverage move on this pricing page is PSG pre-approval. We file by 2026-Q3 to access the SME budget cycle in Q4."
        />
        <div className="mt-8">
          <GrantsTable />
        </div>
      </Section>

      {/* Honest caveats */}
      <Section className="!py-8">
        <SectionHeading
          eyebrow="Caveats"
          title="Things this page does not yet do."
        />
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <Card className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">cohort data · pending</p>
            <p className="text-sm text-text-muted leading-relaxed">
              Elasticity bands are interview-anchored, not cohort-proven. Every band moves to 'medium-confidence'
              once we have 6 months of paid-customer cohort data.
            </p>
          </Card>
          <Card className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">PSG · in roadmap</p>
            <p className="text-sm text-text-muted leading-relaxed">
              PSG pre-approval listing application is filed in 2026-Q3. Until it lands, the
              effective_price_after_psg figures are conditional. Enterprise EDG-bundled pricing is bespoke per project.
            </p>
          </Card>
          <Card className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">competitor figures · estimated</p>
            <p className="text-sm text-text-muted leading-relaxed">
              Trax and NielsenIQ contract pricing is hidden by NDA. Bands reflect interviews with three SG
              FMCG agencies and public benchmarks; treat as directional within ±25%.
            </p>
          </Card>
        </div>
      </Section>

      <Section className="!py-12">
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-bg-elevated p-8 sm:p-10 grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Run the math against your category.
            </h3>
            <p className="mt-3 text-text-muted">
              We'll model your buyer's NBA against your trade-marketing ops cost in your demo.
              You decide whether the Trade tier post-PSG fits your budget.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/demo">Book a 15-min walkthrough <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </Section>
    </>
  );
}

function PriceCallout({
  label, value, sub, highlight,
}: Readonly<{ label: string; value: string; sub: string; highlight?: boolean }>) {
  return (
    <div className={highlight
      ? "rounded-xl border border-primary/40 bg-primary/10 p-4"
      : "rounded-xl border border-border bg-bg-elevated/60 p-4"}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted/70">{label}</p>
      <p className={highlight ? "mt-1 font-mono text-2xl font-semibold text-primary" : "mt-1 font-mono text-2xl font-semibold text-text"}>
        {value}
      </p>
      <p className="mt-1 text-xs text-text-muted">{sub}</p>
    </div>
  );
}

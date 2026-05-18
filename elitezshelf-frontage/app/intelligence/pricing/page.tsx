import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Section, SectionHeading, Card } from "@/components/ui/card";
import { IntelTabs } from "@/components/intel/IntelTabs";
import { PriceSpreadStrip } from "@/components/intel/PriceSpreadStrip";
import { PromoCalendarHeatmap } from "@/components/intel/PromoCalendarHeatmap";
import { promoDepthBuckets, priceLadders } from "@/data/pricing";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Pricing analytics",
  description: "Cross-retailer price spread, promo depth distribution, festival calendar, and price ladder integrity.",
};

export default function PricingPage() {
  return (
    <>
      <Section className="!pb-4">
        <SectionHeading
          eyebrow="Pricing analytics"
          title="What it actually costs on every shelf, every week."
          description="Cross-retailer spread visualisation, promo-depth distribution, festival calendar, and price-ladder integrity. The four questions trade marketing asks before negotiating."
        />
        <IntelTabs />
      </Section>

      <Section className="!py-8">
        <SectionHeading eyebrow="Cross-retailer spread" title="Pick a SKU. Watch the price band." />
        <div className="mt-8">
          <PriceSpreadStrip />
        </div>
      </Section>

      <Section className="!py-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <PromoCalendarHeatmap />
        <Card className="space-y-4">
          <h3 className="text-lg font-semibold text-text">Promo depth distribution</h3>
          <p className="text-sm text-text-muted leading-relaxed">
            Top 100 SKUs · last 12 weeks. Most promos cluster in the 0–15% band — tactical, not desperate.
            Festival blowouts (15–35%) and clearance (&gt;35%) are rare but signal stock pressure.
          </p>
          <ul className="space-y-3">
            {promoDepthBuckets.map((b) => {
              const max = Math.max(...promoDepthBuckets.map((x) => x.count));
              const pct = (b.count / max) * 100;
              return (
                <li key={b.bucket} className="space-y-1">
                  <div className="flex items-baseline justify-between text-xs font-mono">
                    <span className="text-text">{b.bucket} · <span className="text-text-muted">{b.label}</span></span>
                    <span className="text-text-muted">{b.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface overflow-hidden">
                    <div className="h-full bg-primary/80" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </Section>

      <Section className="!py-8">
        <SectionHeading
          eyebrow="Price ladder integrity"
          title="A disrupted ladder is a pricing leak."
        />
        <p className="mt-3 text-text-muted max-w-3xl">
          For each brand, the per-millilitre price should fall as pack size grows. When it doesn't, the
          retailer or distributor is leaking margin — or the channel mix is fragmenting your pricing strategy.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {priceLadders.map((l) => (
            <div
              key={l.brand}
              className={`rounded-xl border p-5 ${
                l.integrity === "intact"
                  ? "border-success/30 bg-success/5"
                  : "border-danger/30 bg-danger/5"
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-text">{l.brand}</h4>
                <span className={`font-mono text-[10px] uppercase tracking-wider ${
                  l.integrity === "intact" ? "text-success" : "text-danger"
                }`}>
                  {l.integrity}
                </span>
              </div>
              <ul className="mt-3 space-y-2 font-mono text-xs">
                {l.sizes.map((s, i) => {
                  const prev = l.sizes[i - 1];
                  const broke = prev && s.perMl > prev.perMl;
                  return (
                    <li key={s.size} className={`flex items-center justify-between ${broke ? "text-danger" : "text-text-muted"}`}>
                      <span>{s.size}</span>
                      <span className="tabular-nums">S${s.perMl.toFixed(2)}/100ml</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section className="!py-8">
        <SectionHeading eyebrow="Editorial takeaways" title="What the data actually says." />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <InsightCard
            n="01"
            title="CSD elasticity is dead past 15%."
            body="Coca-Cola and Pepsi see linear uplift up to 15% promo depth. Anything deeper buys ego, not volume. Trade marketing should redirect that budget into facings, not blowouts."
          />
          <InsightCard
            n="02"
            title="Donki is its own category."
            body="Korean ready-meals and Japanese imports show up to S$2 spread vs the same SKU at NTUC. Donki shoppers are not price-checking — they're browsing. Premium packs win."
          />
          <InsightCard
            n="03"
            title="Festival promo bunching costs share."
            body="During CNY weeks 4–6, three-quarters of confectionery brands are on promo simultaneously. A counter-cyclical full-margin strategy in week 3 captures unsubsidised volume."
          />
        </div>
      </Section>

      <Section className="!py-12">
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-bg-elevated p-8 sm:p-10 grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <Sparkles className="h-6 w-6 text-primary mb-3" />
            <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Your pricing dashboard. Your SKUs. Your retailers.
            </h3>
            <p className="mt-3 text-text-muted">
              Four weeks to stand up. Weekly evidence pack. CSV/Parquet export. API for your BI stack.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/demo">Book a walkthrough <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </Section>
    </>
  );
}

function InsightCard({ n, title, body }: Readonly<{ n: string; title: string; body: string }>) {
  return (
    <Card className="space-y-3">
      <span className="font-mono text-xs text-primary">{n}</span>
      <h4 className="text-lg font-semibold text-text">{title}</h4>
      <p className="text-sm text-text-muted leading-relaxed">{body}</p>
    </Card>
  );
}

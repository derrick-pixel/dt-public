import { Section, SectionHeading, Card } from "@/components/ui/card";
import { IntelTabs } from "@/components/intel/IntelTabs";
import { ShelfHeatmap } from "@/components/shelf/ShelfHeatmap";

export const metadata = {
  title: "Consumer behaviour",
  description: "Singapore shopper mosaic, festival surge map, Nutri-Grade effect, premiumisation paradox, and the Asian-heartland niche.",
};

const ethnic = [
  { group: "Chinese", pct: 74 },
  { group: "Malay", pct: 13 },
  { group: "Indian", pct: 9 },
  { group: "Others", pct: 4 },
];

const channels = [
  { channel: "NTUC FairPrice", pct: 62 },
  { channel: "Sheng Siong", pct: 41 },
  { channel: "Cold Storage / Giant", pct: 38 },
  { channel: "Don Don Donki", pct: 22 },
  { channel: "Mustafa", pct: 8 },
  { channel: "Wet markets", pct: 28 },
];

const festivals = [
  { f: "CNY", weeks: "Wks 4–6",   spike: ["Mandarin oranges +220%", "Bak kwa +180%", "Yu sheng +90%"] },
  { f: "Hari Raya", weeks: "Wks 17–22", spike: ["Cookies +160%", "Syrups +140%", "Halal premium chocolate +60%"] },
  { f: "Deepavali", weeks: "Wk 41", spike: ["Indian sweets +210%", "Ghee +90%", "Diyas / decor +180%"] },
  { f: "Christmas", weeks: "Wks 50–52", spike: ["Confectionery +120%", "Wine +80%", "Hampers +200%"] },
];

export default function ConsumerPage() {
  return (
    <>
      <Section className="!pb-4">
        <SectionHeading
          eyebrow="Consumer behaviour"
          title="The Singapore shopper, mapped to the shelf."
          description="Less data-heavy, more strategic. Five questions about who walks the aisles, when, and why — answered with the cadence shelf-cam gives us."
        />
        <IntelTabs />
      </Section>

      <Section className="!py-8 grid gap-6 lg:grid-cols-2">
        <Card className="space-y-5">
          <h3 className="text-lg font-semibold text-text">Singapore shopper mosaic</h3>
          <p className="text-sm text-text-muted leading-relaxed">
            Composite of Singstat 2024 census and proprietary observations. Channel preference is the
            strongest behavioural variable — stronger than ethnicity, age, or income.
          </p>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted/70 font-mono mb-2">By ethnicity</p>
            <div className="space-y-2">
              {ethnic.map((e) => (
                <Bar key={e.group} label={e.group} value={e.pct} suffix="%" />
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted/70 font-mono mb-2">By channel preference (multi-select)</p>
            <div className="space-y-2">
              {channels.map((c) => (
                <Bar key={c.channel} label={c.channel} value={c.pct} suffix="%" />
              ))}
            </div>
          </div>
        </Card>
        <Card className="space-y-5">
          <h3 className="text-lg font-semibold text-text">The festival surge map</h3>
          <p className="text-sm text-text-muted leading-relaxed">
            Weekly cadence catches festival shelf changes 2–3 weeks ahead of POS data —
            because POS lags shelf reality, and shelf reality lags planogram changes by another week.
          </p>
          <ul className="space-y-3">
            {festivals.map((f) => (
              <li key={f.f} className="rounded-md border border-border/80 bg-surface/40 p-3">
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold text-text">{f.f}</span>
                  <span className="font-mono text-[11px] text-accent">{f.weeks}</span>
                </div>
                <ul className="mt-2 space-y-1 text-xs text-text-muted">
                  {f.spike.map((s) => (
                    <li key={s}>• {s}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </Card>
      </Section>

      <Section className="!py-8">
        <SectionHeading
          eyebrow="Nutri-Grade effect"
          title="The chiller is rewriting itself in front of us."
        />
        <p className="mt-3 max-w-3xl text-text-muted">
          Mandatory Grade A/B/C/D labelling on pre-packaged beverages (HPB, fully enforced 2023).
          Our weekly cadence has tracked the chiller mix shifting toward Grade A/B over 18 months —
          with three identifiable inflection points.
        </p>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <ShelfHeatmap rows={4} cols={18} caption="Beverage chiller — Grade A+B vs C+D facings, 18 months" />
          <div className="space-y-3 text-sm text-text-muted leading-relaxed">
            <p>
              <span className="text-text font-semibold">Inflection 1 · 2024 Q2:</span>{" "}
              Coca-Cola No Sugar moves from a single-facing experiment to 4-facing standard at NTUC. Pepsi follows two months later.
            </p>
            <p>
              <span className="text-text font-semibold">Inflection 2 · 2024 Q4:</span>{" "}
              Pocari Sweat low-sugar variant overtakes the standard SKU in NTUC heartland stores —
              not in the CBD. Heartland shopper is the Nutri-Grade adopter, not the affluent one.
            </p>
            <p>
              <span className="text-text font-semibold">Inflection 3 · 2025 Q3:</span>{" "}
              Grade D drinks losing eye-level facings to Grade A even in Donki — where shopper indexes
              are <i>against</i> health-consciousness. Retailer planogram pressure, not shopper pressure.
            </p>
          </div>
        </div>
      </Section>

      <Section className="!py-8 grid gap-6 lg:grid-cols-2">
        <Card className="space-y-3">
          <h3 className="text-lg font-semibold text-text">The premiumisation paradox</h3>
          <p className="text-sm text-text-muted leading-relaxed">
            SGD-rich shoppers are trading up at Cold Storage and Donki — premium chocolate, single-origin
            coffee, imported snacks. Value shoppers are consolidating at Sheng Siong — fewer trips, larger baskets.
            The squeezed middle is everywhere else.
          </p>
          <p className="text-sm text-text-muted leading-relaxed">
            Implication for trade marketing: a brand that lives in NTUC standard needs a separate playbook
            for Cold Storage and Donki. Your facings strategy at NTUC will lose money at Cold Storage —
            and win money you didn't know you had.
          </p>
        </Card>
        <Card className="space-y-3">
          <h3 className="text-lg font-semibold text-text">The "Asian heartland" niche</h3>
          <p className="text-sm text-text-muted leading-relaxed">
            Mustafa, NTUC Hyper, and Prime are under-indexed by global SOS tools and over-indexed by
            ElitezShelf coverage. These are the stores where regional product launches actually get
            stress-tested before national rollouts.
          </p>
          <p className="text-sm text-text-muted leading-relaxed">
            We track novel SKU entries in these stores at 3× the rate Trax-style fixed cameras can —
            because we walk past them weekly anyway.
          </p>
        </Card>
      </Section>
    </>
  );
}

function Bar({ label, value, suffix }: Readonly<{ label: string; value: number; suffix?: string }>) {
  return (
    <div className="grid grid-cols-[120px_1fr_50px] items-center gap-3 text-xs">
      <span className="text-text-muted">{label}</span>
      <div className="h-2 rounded-full bg-surface overflow-hidden">
        <div className="h-full bg-primary/80" style={{ width: `${value}%` }} />
      </div>
      <span className="text-text font-mono text-right tabular-nums">{value}{suffix}</span>
    </div>
  );
}

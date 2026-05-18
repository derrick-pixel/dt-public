import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Camera, ClipboardList, Eye, MapPin } from "lucide-react";
import { asset } from "@/lib/utils";
import { Hero } from "@/components/marketing/Hero";
import { TrustStrip } from "@/components/marketing/TrustStrip";
import { FeatureTabs } from "@/components/marketing/FeatureTabs";
import { LiveTicker } from "@/components/shelf/LiveTicker";
import { PricingCTA } from "@/components/marketing/PricingCTA";
import { FAQ } from "@/components/marketing/FAQ";
import { Section, SectionHeading, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CompetitorQuadrant } from "@/components/intel/CompetitorQuadrant";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustStrip />

      {/* The asymmetry */}
      <Section>
        <SectionHeading
          eyebrow="The asymmetry"
          title="A retail intelligence network that already exists."
          description="The 350-strong Elitez field force already walks your shelves every week. ElitezShelf is what happens when you point that network at the question your CMO has been asking for a decade — what is actually on the shelf, right now, in every store that matters."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {[
            { n: "60%", label: "of Singapore supermarkets covered weekly", sub: "NTUC, Sheng Siong, Cold Storage, Giant, Donki, Prime, Mustafa, FairPrice Finest.", tone: "mint", tilt: "-rotate-1" },
            { n: "80%", label: "of leading FMCG client revenue inside our footprint", sub: "Top-10 MNCs already deploy field manpower with us.", tone: "papaya", tilt: "rotate-1" },
            { n: "0",   label: "new headcount required to begin", sub: "A S$280 body-cam and 4 minutes of upload per visit. That's it.", tone: "pink", tilt: "-rotate-1" },
          ].map((s) => (
            <div
              key={s.n}
              className={`rounded-3xl border-2 border-primary/25 p-8 transform ${s.tilt} hover:rotate-0 transition-transform ${
                s.tone === "papaya" ? "bg-accent text-accent-fg" :
                s.tone === "pink"   ? "bg-pink/70" :
                                      "bg-primary-soft"
              }`}
            >
              <div className={`font-display text-7xl font-bold tracking-tight leading-none ${s.tone === "papaya" ? "text-primary" : "text-primary"}`}>{s.n}</div>
              <p className={`mt-5 font-display text-lg font-semibold leading-snug ${s.tone === "papaya" ? "text-primary" : "text-primary"}`}>{s.label}</p>
              <p className={`mt-2 text-sm leading-relaxed ${s.tone === "papaya" ? "text-primary/85" : "text-kopi/80"}`}>{s.sub}</p>
            </div>
          ))}
        </div>
      </Section>

      <div className="tile-band" />

      {/* How we differ */}
      <Section className="border-t border-border/60">
        <SectionHeading
          eyebrow="vs incumbents"
          title="The structural difference."
          description="We are not pretending to be the next Trax. We are the model that Trax can't be — because the manpower is already routed, and the cadence is already weekly."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DiffCard
            vs="Trax"
            line="They ship cameras."
            us="We ship people who already shop your shelves."
          />
          <DiffCard
            vs="ShelfPerfect"
            line="They audit on demand."
            us="We audit on rotation."
          />
          <DiffCard
            vs="NielsenIQ"
            line="They report monthly."
            us="We report weekly."
          />
          <DiffCard
            vs="DIY rep apps"
            line="Your reps fake compliance."
            us="Ours wear cameras."
          />
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <CompetitorQuadrant />
          <div>
            <p className="text-base text-text-muted leading-relaxed">
              Trax has 13+ years of model training data and we will not pretend otherwise.
              NielsenIQ owns purchase-side panels we cannot match. We are a complement,
              not a replacement, for monthly panel data — and a structural challenger to
              the camera-CapEx model.
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/intelligence/competitors">
                Read the full competitor brief <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Section>

      <LiveTicker className="my-4" />

      {/* What we measure */}
      <Section>
        <SectionHeading
          eyebrow="What we measure"
          title="Field-grade data, decoded by AI."
          description="Every shelf is a question. We answer seven of them on every audit."
        />
        <div className="mt-10">
          <FeatureTabs />
        </div>
      </Section>

      {/* Sample intelligence preview */}
      <Section id="sample-intel" className="border-t border-border/60">
        <SectionHeading
          eyebrow="Sample intelligence"
          title="Three pages your team will actually open."
          description="The intelligence hub previews are below. Live deployments populate with your SKUs and your retailers."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <PreviewCard
            href="/intelligence"
            icon={Eye}
            title="Live BI dashboard"
            tag="KPIs · donut · SOS movers · OOS heatmap"
            body="The trade-marketing weekly dashboard. KPI tiles up top, retailer mix in the middle, OOS heatmap on the right."
            image={{ src: "/img/u01.jpg", alt: "ElitezShelf BI dashboard preview" }}
          />
          <PreviewCard
            href="/intelligence/whitespace"
            icon={MapPin}
            title="Whitespace + attack"
            tag="canvas · heatmap · 3 attack plans"
            body="Strategy canvas radar, segment×need heatmap, and 3 ranked attack plans bound to green cells."
            image={{ src: "/img/b02.jpg", alt: "Regional footprint atlas preview" }}
          />
          <PreviewCard
            href="/intelligence/pricing"
            icon={ClipboardList}
            title="Pricing analytics"
            tag="30 SKUs × 6 retailers · 52 wks"
            body="Cross-retailer spread, promo depth distribution, festival calendar, ladder integrity."
            image={{ src: "/img/h06.jpg", alt: "Macro shelf-talker price OCR preview" }}
          />
        </div>
      </Section>

      {/* Pilot CTA */}
      <Section className="!py-12">
        <PricingCTA />
      </Section>

      {/* FAQ */}
      <Section className="border-t border-border/60">
        <SectionHeading
          eyebrow="Frequently asked"
          title="The eight questions trade marketing always asks first."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
          <FAQ />
          <div className="rounded-xl border border-border bg-bg-elevated/60 p-6">
            <Camera className="h-5 w-5 text-primary" />
            <p className="mt-3 text-sm font-semibold text-text">
              The shelf is the only thing the camera is allowed to see.
            </p>
            <p className="mt-2 text-sm text-text-muted leading-relaxed">
              On-device blurring of incidental persons. Audio off. Encrypted in transit and at rest.
              PDPA-registered. We follow IMDA's AI Verify framework principles.
            </p>
            <Link
              href="/solution#privacy"
              className="mt-4 inline-flex items-center gap-1 text-xs font-mono text-primary hover:underline"
            >
              Read our privacy posture <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}

function DiffCard({ vs, line, us }: Readonly<{ vs: string; line: string; us: string }>) {
  return (
    <Card className="space-y-3">
      <p className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-accent font-mono font-semibold">vs {vs}</p>
      <p className="text-sm text-kopi/75 italic">{line}</p>
      <p className="font-display text-lg font-semibold text-primary leading-snug">{us}</p>
    </Card>
  );
}

function PreviewCard({
  href, icon: Icon, title, tag, body, image,
}: Readonly<{
  href: string;
  icon: React.ElementType;
  title: string;
  tag: string;
  body: string;
  image: { src: string; alt: string };
}>) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-4 rounded-xl border border-border bg-bg-elevated/60 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40"
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-xs font-mono text-text-muted">{tag}</span>
      </div>
      <h3 className="text-lg font-semibold text-text">{title}</h3>
      <p className="text-sm text-text-muted leading-relaxed">{body}</p>
      <div className="relative mt-auto aspect-[16/10] overflow-hidden rounded-md border border-border/60">
        <Image
          src={asset(image.src)}
          alt={image.alt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
      </div>
      <span className="inline-flex items-center gap-1 text-xs font-mono text-primary group-hover:underline">
        Open intelligence <ArrowRight className="h-3 w-3" />
      </span>
    </Link>
  );
}

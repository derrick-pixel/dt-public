import Link from "next/link";
import Image from "next/image";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { asset } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:px-8 py-20 lg:py-28 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        <div className="relative z-10">
          <div className="mb-7 inline-flex items-center gap-2.5 rounded-full bg-primary-soft px-3.5 py-1.5 text-xs font-mono font-medium text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-primary animate-pulse-soft" />
              <span className="relative h-2 w-2 rounded-full bg-primary" />
            </span>
            Live · weekly cadence · NTUC, Sheng Siong, Cold Storage, Donki
          </div>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.98] text-primary">
            Every shelf,<br />
            every week,<br />
            <span className="wavy-underline italic font-medium text-accent">watched.</span>
          </h1>
          <p className="mt-7 max-w-xl text-base sm:text-lg text-kopi/85 leading-relaxed">
            ElitezShelf turns the <strong className="text-primary font-semibold">60% of Singapore's supermarkets we already cover</strong> into the world's most efficient retail intelligence network. SOS, OSA, planogram compliance — captured by your own boots on the ground, decoded by AI. Made in Singapore.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/demo">
                Book a 15-min walkthrough <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#sample-intel">
                See sample intelligence <ArrowDown className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-6 max-w-lg">
            <Stat n="60%" label="of SG supermarkets covered weekly" />
            <Stat n="80%" label="of leading FMCG client revenue inside our footprint" />
            <Stat n="0" label="new headcount required to begin" />
          </div>
        </div>

        <div className="relative" style={{ transform: "rotate(-2deg)" }}>
          <span
            className="absolute -top-4 left-8 z-10 rounded-2xl bg-bg px-4 py-2 text-[11px] font-mono uppercase tracking-[0.12em] text-primary shadow-papaya"
            style={{ transform: "rotate(2deg)" }}
          >
            ● REC · NTUC AMK Hub · 09:22 SGT
          </span>
          <div
            className="relative overflow-hidden rounded-[2rem] bg-primary p-3"
            style={{ boxShadow: "18px 22px 0 -8px hsl(var(--accent))" }}
          >
            <Image
              src={asset("/img/h01.jpg")}
              alt="ElitezShelf live feed dashboard with bounding-box overlays on an NTUC FairPrice beverage aisle, body-cam POV"
              width={1600}
              height={1200}
              priority
              className="block h-auto w-full rounded-[1.5rem]"
            />
          </div>
          <span
            className="absolute -bottom-5 right-6 z-10 rounded-3xl bg-accent px-5 py-3 font-display text-xl font-bold text-accent-fg"
            style={{ transform: "rotate(4deg)", boxShadow: "0 6px 0 -1px hsl(var(--primary))" }}
          >
            + 60% covered weekly
          </span>
        </div>
      </div>
    </section>
  );
}

function Stat({ n, label }: Readonly<{ n: string; label: string }>) {
  return (
    <div>
      <div className="font-display text-4xl font-bold text-accent tracking-tight leading-none">{n}</div>
      <p className="mt-2 text-xs text-kopi/75 leading-snug">{label}</p>
    </div>
  );
}

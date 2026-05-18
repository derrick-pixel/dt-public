import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PricingCTA({ className }: Readonly<{ className?: string }>) {
  return (
    <div className={cn("relative overflow-hidden rounded-[2rem] bg-primary text-primary-fg p-8 sm:p-12", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-accent/45 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -bottom-32 h-72 w-72 rounded-full bg-pink/30 blur-3xl"
      />
      <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent/20 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-accent font-mono font-medium">
            ● The pilot offer
          </p>
          <h3 className="font-display text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
            Pick three SKUs.<br />Pick three retailers.<br />
            <span className="text-accent">We deliver four weeks of evidence.</span>
          </h3>
          <p className="mt-5 text-primary-fg/75 max-w-prose">
            No camera CapEx. No software contract. PSG-eligible at the Trade tier — net S$5,000/mo for the SG SME buyer. Either it changes how you negotiate your next planogram, or you don't pay.
          </p>
        </div>
        <div className="rounded-[1.5rem] bg-bg text-text p-7 space-y-4" style={{ transform: "rotate(2deg)" }}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-accent font-mono">— Pilot offer —</p>
          <h4 className="font-display text-xl font-bold text-primary">4-week launch package</h4>
          <ul className="space-y-2 text-sm text-kopi/85">
            <li className="flex items-start gap-2.5"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" /><span>3 SKUs · 3 retailers · weekly cadence</span></li>
            <li className="flex items-start gap-2.5"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" /><span>Weekly evidence pack + dashboard</span></li>
            <li className="flex items-start gap-2.5"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" /><span>Three free whitespace cells in your category</span></li>
            <li className="flex items-start gap-2.5"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" /><span>Convertible monthly retainer</span></li>
          </ul>
          <Button asChild size="lg" className="w-full">
            <Link href="/demo">
              Start the pilot conversation <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";

const fmcgs = [
  "Nestlé", "Unilever", "P&G", "Suntory", "Coca-Cola",
  "Mondelez", "Danone", "PepsiCo", "Kao", "Ferrero",
];

export function TrustStrip({ className }: Readonly<{ className?: string }>) {
  return (
    <div className={cn("bg-bg-elevated", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-center text-[11px] uppercase tracking-[0.22em] text-primary/70 font-mono font-medium">
          — Elitez deploys field manpower for the top 10 FMCG MNCs in Singapore —
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {fmcgs.map((f) => (
            <span
              key={f}
              className="font-display text-lg sm:text-xl font-semibold text-primary/70 hover:text-primary transition-colors"
            >
              {f}
            </span>
          ))}
        </div>
        <p className="mt-3 text-center text-[10px] font-mono text-text-muted/60">
          (Logos shown when client clearance is in place. Default to anonymised typography.)
        </p>
      </div>
    </div>
  );
}

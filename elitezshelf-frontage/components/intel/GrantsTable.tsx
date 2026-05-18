import { grants } from "@/data/pricing-strategy";
import { cn } from "@/lib/utils";

export function GrantsTable() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {grants.map((g) => (
        <article key={g.name} className="rounded-xl border border-border bg-bg-elevated/60 p-5">
          <header className="flex items-baseline justify-between mb-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">{g.name}</p>
              <p className="text-sm font-medium text-text mt-0.5">{g.full_name}</p>
            </div>
            <span className="font-mono text-2xl font-semibold text-primary tracking-tight">
              {g.coverage_pct}%
            </span>
          </header>

          <div className="space-y-2 text-xs">
            <Row k="Cap" v={g.cap_sgd ? `S$${g.cap_sgd.toLocaleString()}/yr` : "no fixed cap"} />
            <Row
              k="Applies"
              v={
                g.applies_to_tiers.length === 0
                  ? <span className="text-text-muted/60 italic">not stacked on monthly tier</span>
                  : g.applies_to_tiers.join(" · ")
              }
              highlight={g.applies_to_tiers.length > 0}
            />
            <div className="pt-2 border-t border-border/40">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted/70 mb-1">Eligibility</p>
              <p className="text-text-muted leading-relaxed">{g.eligibility}</p>
            </div>
            <div className="pt-2 border-t border-border/40">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted/70 mb-1">Sales note</p>
              <p className="text-text-muted leading-relaxed italic">{g.note}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function Row({ k, v, highlight }: Readonly<{ k: string; v: React.ReactNode; highlight?: boolean }>) {
  return (
    <div className="grid grid-cols-[80px_1fr] gap-3">
      <span className="text-text-muted/70">{k}</span>
      <span className={cn(highlight ? "text-primary font-mono" : "text-text font-mono")}>{v}</span>
    </div>
  );
}

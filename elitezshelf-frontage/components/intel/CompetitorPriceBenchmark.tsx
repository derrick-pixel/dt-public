import { competitorPricing } from "@/data/pricing-strategy";
import { cn } from "@/lib/utils";

const fmtSGD = (n: number) =>
  n === 0 ? "free" : new Intl.NumberFormat("en-SG", { maximumFractionDigits: 0 }).format(n);

export function CompetitorPriceBenchmark() {
  const max = Math.max(...competitorPricing.map((c) => c.monthly_sgd.high));

  return (
    <div className="space-y-3">
      {competitorPricing.map((c) => {
        const lowPct = (c.monthly_sgd.low / max) * 100;
        const highPct = (c.monthly_sgd.high / max) * 100;
        const span = highPct - lowPct;
        return (
          <div
            key={c.id}
            className={cn(
              "rounded-xl border p-4",
              c.us ? "border-primary/40 bg-primary/5" : "border-border bg-bg-elevated/40",
            )}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
              <div className="flex items-baseline gap-2">
                <h4 className={cn("font-semibold", c.us ? "text-primary" : "text-text")}>
                  {c.name}
                </h4>
                <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted/70">
                  {c.scope}
                </span>
              </div>
              <span className={cn(
                "rounded px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
                c.pricing_flag === "public" ? "bg-success/20 text-success" :
                c.pricing_flag === "estimated" ? "bg-accent/20 text-accent" :
                c.pricing_flag === "hidden_estimated" ? "bg-danger/20 text-danger" :
                "bg-surface text-text-muted",
              )}>
                {c.pricing_flag.replace("_", " ")}
              </span>
            </div>

            <div className="relative h-7 rounded-md bg-surface/40">
              <div
                className={cn(
                  "absolute inset-y-1 rounded",
                  c.us ? "bg-primary/40 ring-1 ring-primary" : "bg-text-muted/30",
                )}
                style={{ left: `${lowPct}%`, width: `${Math.max(span, 1)}%` }}
              />
              <span
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 font-mono text-[10px]",
                  c.us ? "text-primary" : "text-text",
                )}
                style={{ left: `${lowPct}%` }}
              >
                S${fmtSGD(c.monthly_sgd.low)}
              </span>
              {c.monthly_sgd.high !== c.monthly_sgd.low && (
                <span
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 font-mono text-[10px]",
                    c.us ? "text-primary" : "text-text",
                  )}
                  style={{ left: `${highPct}%` }}
                >
                  S${fmtSGD(c.monthly_sgd.high)}
                </span>
              )}
            </div>

            <div className="mt-3 grid gap-1 text-xs sm:grid-cols-[140px_1fr]">
              <span className="text-text-muted">Cadence</span>
              <span className="text-text">{c.cadence}</span>
              <span className="text-text-muted">Source</span>
              <span className="text-text-muted/80 italic">{c.source}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

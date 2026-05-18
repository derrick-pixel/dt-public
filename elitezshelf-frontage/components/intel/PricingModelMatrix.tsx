import { pricingModels, personas, pricingModelDecision } from "@/data/pricing-strategy";
import { cn } from "@/lib/utils";

function scoreClass(s: number) {
  if (s >= 5) return "bg-primary text-primary-fg";
  if (s >= 4) return "bg-primary/60 text-primary-fg";
  if (s >= 3) return "bg-primary/25 text-text";
  if (s >= 2) return "bg-surface text-text-muted";
  return "bg-bg-elevated text-text-muted/50";
}

export function PricingModelMatrix() {
  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-xl border border-border bg-bg-elevated/60">
        <table className="w-full min-w-[760px] border-separate border-spacing-0 text-xs">
          <thead>
            <tr className="bg-bg-elevated/60">
              <th className="border-b border-border px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted/70">
                Pricing model
              </th>
              {personas.map((p) => (
                <th
                  key={p.id}
                  className="border-b border-border px-3 py-3 text-center font-mono text-[10px] uppercase tracking-wider text-text-muted/80 align-bottom"
                  style={{ minWidth: 96 }}
                >
                  <div className="space-y-0.5 leading-tight">
                    {p.name.split(" ").map((w) => <div key={w}>{w}</div>)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pricingModels.map((m, i) => {
              const isPrimary = m.name === pricingModelDecision.primary;
              const isRunnerUp = m.name === pricingModelDecision.runner_up;
              return (
                <tr key={m.name} className={cn(i % 2 === 1 && "bg-bg/30")}>
                  <td className="border-b border-border/40 px-4 py-3 align-top">
                    <p className={cn(
                      "font-medium",
                      isPrimary ? "text-primary" : "text-text",
                    )}>
                      {m.name}
                      {isPrimary && (
                        <span className="ml-2 rounded bg-primary px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-primary-fg">
                          PICKED
                        </span>
                      )}
                      {isRunnerUp && (
                        <span className="ml-2 rounded bg-accent/30 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-accent">
                          runner-up
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-text-muted leading-relaxed">{m.rationale}</p>
                  </td>
                  {personas.map((p) => {
                    const s = m.score_by_persona[p.name] ?? 0;
                    return (
                      <td key={p.id} className="border-b border-border/40 px-2 py-3 text-center">
                        <span className={cn(
                          "inline-flex h-7 w-7 items-center justify-center rounded font-mono text-xs font-semibold",
                          scoreClass(s),
                        )}>
                          {s}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary mb-2">Decision rationale</p>
        <p className="text-sm text-text-muted leading-relaxed">{pricingModelDecision.rationale}</p>
      </div>
    </div>
  );
}

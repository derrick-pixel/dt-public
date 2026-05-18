import { ArrowDown } from "lucide-react";
import { marketFunnel, type FunnelStage } from "@/data/market-funnel";

const stages: FunnelStage[] = [marketFunnel.tam, marketFunnel.sam, marketFunnel.som];

export function MarketFunnel() {
  return (
    <div className="grid gap-3 lg:gap-4">
      {stages.map((stage, i) => (
        <div key={stage.stage_label}>
          <div
            className="rounded-xl border border-border bg-bg-elevated/60 p-5 lg:p-7"
            style={{
              maxWidth: `${100 - i * 18}%`,
              marginLeft: `${i * 9}%`,
            }}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">{stage.stage_label}</p>
                <p className="mt-1 text-sm text-text-muted max-w-prose leading-snug">{stage.subtitle}</p>
              </div>
              <div className="text-right">
                <span className="font-mono text-3xl sm:text-4xl font-semibold tracking-tight text-text">
                  {stage.result_label}
                </span>
                <p className="mt-1 font-mono text-[10px] text-text-muted/70">{stage.total_equation}</p>
              </div>
            </div>
            {stage.filters && (
              <div className="mt-4 flex flex-wrap gap-2">
                {stage.filters.map((f) => (
                  <span key={f} className="rounded-full border border-border px-2.5 py-1 text-[11px] font-mono text-text-muted">
                    filter · {f}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {stage.stacks.map((stack) => (
                <div key={stack.name} className="rounded-md border border-border/60 bg-bg/40 p-3">
                  <p className="text-xs font-medium text-text">{stack.name}</p>
                  <p className="mt-1 font-mono text-[10px] text-text-muted/70 leading-snug">{stack.source}</p>
                  <ul className="mt-2 space-y-1 text-[11px] font-mono">
                    {stack.inputs.map((inp) => (
                      <li key={inp.label} className="flex items-baseline justify-between gap-2 text-text-muted">
                        <span>{inp.label}</span>
                        <span className="text-text">{inp.value}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 flex items-baseline justify-between border-t border-border/40 pt-2 font-mono text-xs">
                    <span className="text-text-muted/70">{stack.equation}</span>
                    <span className="text-primary font-semibold">{stack.result_label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {i < stages.length - 1 && (
            <div className="flex justify-center py-1 text-text-muted/50">
              <ArrowDown className="h-4 w-4" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

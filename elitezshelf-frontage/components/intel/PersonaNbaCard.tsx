import { type Persona } from "@/data/pricing-strategy";
import { cn } from "@/lib/utils";

const fmtSGD = (n: number) =>
  new Intl.NumberFormat("en-SG", { maximumFractionDigits: 0 }).format(n);

export function PersonaNbaCard({ p }: Readonly<{ p: Persona }>) {
  const expectedRatio = p.wtp_band_sgd.expected / p.nba.monthly_sgd_equivalent;
  const inBand = expectedRatio >= 0.4 && expectedRatio <= 1.2;

  return (
    <article className="rounded-xl border border-border bg-bg-elevated/60 p-6 flex flex-col">
      <header className="mb-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">{p.id}</p>
        <h3 className="mt-1 text-lg font-semibold text-text leading-snug">{p.name}</h3>
        <p className="mt-2 text-sm text-text-muted leading-relaxed">{p.icp}</p>
      </header>

      <div className="mt-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted/70 mb-2">Pains</p>
        <ul className="space-y-1.5 text-xs text-text-muted">
          {p.pains.map((pain) => (
            <li key={pain} className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-text-muted/60" />
              <span>{pain}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted/70 mb-1">Workaround today</p>
        <p className="text-xs text-text-muted leading-relaxed italic">{p.current_workaround}</p>
      </div>

      <div className="mt-5 rounded-md border border-border/60 bg-bg/40 p-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted/70">
            NBA · {p.nba.method.replace("_", " ")}
          </p>
          <span className="font-mono text-[10px] text-text-muted/60">
            confidence {p.nba.confidence.toFixed(2)}
          </span>
        </div>
        <p className="mt-2 text-xs text-text-muted leading-relaxed">{p.nba.summary}</p>
        <ul className="mt-3 space-y-1 text-[11px] font-mono">
          {p.nba.inputs.map((i) => (
            <li key={i.label} className="flex items-baseline justify-between gap-2">
              <span className="text-text-muted">
                {i.label}
                {i.value ? <span className="text-text-muted/60"> · {i.value}</span> : null}
              </span>
              {i.monthly_sgd !== undefined && (
                <span className="text-text">S${fmtSGD(i.monthly_sgd)}/mo</span>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-baseline justify-between border-t border-border/50 pt-2 font-mono text-xs">
          <span className="text-text-muted">monthly_sgd_equivalent</span>
          <span className="text-primary font-semibold">S${fmtSGD(p.nba.monthly_sgd_equivalent)}</span>
        </div>
      </div>

      <div className="mt-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted/70 mb-2">
          WTP band · S$/mo
        </p>
        <WTPBar
          low={p.wtp_band_sgd.low_anchor}
          expected={p.wtp_band_sgd.expected}
          stretch={p.wtp_band_sgd.upper_stretch}
          nba={p.nba.monthly_sgd_equivalent}
        />
        <p className={cn(
          "mt-2 font-mono text-[10px]",
          inBand ? "text-success" : "text-accent",
        )}>
          expected / NBA = {expectedRatio.toFixed(2)} · {inBand ? "within 0.4–1.2× band ✓" : "outside band — flagged exploratory"}
        </p>
      </div>
    </article>
  );
}

function WTPBar({
  low, expected, stretch, nba,
}: Readonly<{ low: number; expected: number; stretch: number; nba: number }>) {
  const max = Math.max(stretch, nba) * 1.05;
  const pct = (n: number) => (n / max) * 100;
  return (
    <div className="space-y-1.5">
      <div className="relative h-3 rounded-full bg-surface/60">
        <div
          className="absolute inset-y-0 rounded-full bg-primary/30"
          style={{ left: `${pct(low)}%`, width: `${pct(stretch) - pct(low)}%` }}
        />
        <div
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-bg bg-primary"
          style={{ left: `${pct(expected)}%` }}
          title={`expected S$${fmtSGD(expected)}/mo`}
        />
        <div
          className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-accent"
          style={{ left: `${pct(nba)}%` }}
          title={`NBA S$${fmtSGD(nba)}/mo`}
        />
      </div>
      <div className="flex justify-between font-mono text-[10px] text-text-muted">
        <span>S${fmtSGD(low)}</span>
        <span className="text-primary">expected · S${fmtSGD(expected)}</span>
        <span>S${fmtSGD(stretch)}</span>
      </div>
      <div className="flex justify-between font-mono text-[10px] text-accent/80">
        <span></span>
        <span>NBA · S${fmtSGD(nba)}</span>
      </div>
    </div>
  );
}

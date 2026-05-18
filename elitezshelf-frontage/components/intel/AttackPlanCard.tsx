import { Crosshair } from "lucide-react";
import { cn } from "@/lib/utils";
import { attackPlans, segments, needs } from "@/data/whitespace-framework";

export function AttackPlanGrid() {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {attackPlans.map((p) => {
        const [segId, needId] = p.bound_cell.split(":");
        const seg = segments.find((s) => s.id === segId);
        const need = needs.find((n) => n.id === needId);
        return (
          <article
            key={p.rank}
            className={cn(
              "flex flex-col rounded-xl border bg-bg-elevated/60 p-6",
              p.rank === 1 ? "border-primary/40 ring-1 ring-primary/20" : "border-border",
            )}
          >
            <header className="mb-4">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                  Rank {p.rank} · attack
                </span>
                <span className="font-mono text-[10px] text-text-muted/70">
                  TAM S${(p.tam_estimate_sgd / 1_000_000).toFixed(1)}M
                </span>
              </div>
              <h3 className="mt-2 text-lg font-semibold text-text leading-snug">{p.niche_name}</h3>
              <p className="mt-1 font-mono text-[10px] text-text-muted/60">
                cell · {seg?.name} × {need?.name}
              </p>
            </header>

            <Block label="ICP">{p.icp}</Block>
            <Block label="TAM reasoning">{p.tam_reasoning}</Block>
            <Block label="Why the gap">{p.why_gap}</Block>
            <Block label="Why we win">{p.why_we_win}</Block>

            <div className="mt-4 rounded-md border border-border/60 bg-bg/50 p-4 space-y-3 text-xs">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted/70">GTM</p>
              <Row k="Channel" v={p.gtm.channel} />
              <Row k="Pitch" v={<em className="text-text">{p.gtm.pitch}</em>} mono={false} />
              <Row k="Pricing" v={p.gtm.pricing} mono />
              <div>
                <p className="text-text-muted">Content</p>
                <ul className="mt-1.5 space-y-1 text-text">
                  {p.gtm.content.map((c) => (
                    <li key={c} className="flex items-start gap-2">
                      <Crosshair className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function Block({ label, children }: Readonly<{ label: string; children: React.ReactNode }>) {
  return (
    <div className="mt-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted/70 mb-1">{label}</p>
      <p className="text-sm text-text-muted leading-relaxed">{children}</p>
    </div>
  );
}

function Row({ k, v, mono }: Readonly<{ k: string; v: React.ReactNode; mono?: boolean }>) {
  return (
    <div className="grid grid-cols-[64px_1fr] gap-3">
      <span className="text-text-muted">{k}</span>
      <span className={mono ? "font-mono text-text" : "text-text leading-relaxed"}>{v}</span>
    </div>
  );
}

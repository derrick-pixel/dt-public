import { competitorPlots } from "@/data/competitors";
import { cn } from "@/lib/utils";

const palette: Record<string, string> = {
  trax: "hsl(0 65% 60%)",          // pink-red
  shelfperfect: "hsl(40 80% 50%)", // amber
  nielseniq: "hsl(26 30% 50%)",    // kopi
  diy: "hsl(175 30% 50%)",         // muted teal
  elitezshelf: "hsl(22 100% 58%)", // papaya
};

export function CompetitorQuadrant({ className }: Readonly<{ className?: string }>) {
  return (
    <div className={cn("relative aspect-[5/4] w-full rounded-3xl border-2 border-primary/15 bg-bg-elevated p-6", className)}>
      <div className="absolute left-6 right-6 top-6 bottom-6 rounded-2xl border-2 border-primary/15">
        {/* axes */}
        <div className="absolute left-0 right-0 top-1/2 h-px bg-primary/30" />
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-primary/30" />

        {/* quadrant labels */}
        <div className="absolute right-3 top-3 text-[10px] font-mono text-kopi/60 max-w-[40%] text-right uppercase tracking-[0.12em]">
          Real-time<br />CapEx-heavy
        </div>
        <div className="absolute left-3 top-3 text-[10px] font-mono text-kopi/60 max-w-[40%] uppercase tracking-[0.12em]">
          Monthly<br />Asset-light
        </div>
        <div className="absolute left-3 bottom-3 text-[10px] font-mono text-kopi/60 max-w-[40%] uppercase tracking-[0.12em]">
          Monthly<br />Self-reported
        </div>
        <div className="absolute right-3 bottom-3 text-[10px] font-mono text-kopi/60 max-w-[40%] text-right uppercase tracking-[0.12em]">
          Real-time<br />Asset-light
        </div>

        {/* dots */}
        {competitorPlots.map((p) => {
          const isUs = p.id === "elitezshelf";
          const color = palette[p.id] ?? p.color;
          return (
            <div
              key={p.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${p.x * 100}%`, top: `${(1 - p.y) * 100}%` }}
            >
              <div
                className={cn(
                  "relative grid place-items-center rounded-full",
                  isUs ? "h-7 w-7 text-accent-fg shadow-[0_0_28px_hsl(22_100%_58%/0.7)] ring-2 ring-bg" : "h-3.5 w-3.5",
                )}
                style={{ background: color }}
              >
                {isUs && <span className="font-mono text-[10px] font-bold">ES</span>}
              </div>
              <span
                className={cn(
                  "absolute left-7 top-1/2 -translate-y-1/2 text-[11px] font-mono whitespace-nowrap",
                  isUs ? "text-accent font-bold" : "text-kopi/80",
                )}
              >
                {p.name}
              </span>
            </div>
          );
        })}
      </div>
      {/* axis titles */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[11px] font-mono text-kopi/70 uppercase tracking-[0.12em]">
        Audit cadence →
      </div>
      <div className="absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 text-[11px] font-mono text-kopi/70 whitespace-nowrap uppercase tracking-[0.12em]">
        Coverage cost →
      </div>
    </div>
  );
}

import { coverageDots } from "@/data/whitespace";
import { cn } from "@/lib/utils";

// Stylised SG outline on a warm tropical background.
export function CoverageMap({ className }: Readonly<{ className?: string }>) {
  return (
    <div className={cn("relative aspect-[16/10] w-full overflow-hidden rounded-3xl border-2 border-primary/15 bg-primary", className)}>
      <svg viewBox="0 0 100 80" className="absolute inset-0 h-full w-full">
        {/* SG silhouette stylised */}
        <defs>
          <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(175 60% 26%)" />
            <stop offset="100%" stopColor="hsl(175 70% 14%)" />
          </linearGradient>
          <radialGradient id="dotG" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(22 100% 70%)" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(22 100% 58%)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path
          d="M 8 30 Q 14 12 30 12 L 60 8 Q 78 8 86 18 Q 94 26 92 38 Q 92 52 80 58 L 70 64 Q 50 70 30 66 Q 12 60 8 50 Z"
          fill="url(#land)"
          stroke="hsl(22 100% 64% / 0.4)"
          strokeWidth="0.5"
        />
        {/* lat/lng grid */}
        {[20, 35, 50, 65].map((y) => (
          <line key={y} x1="6" x2="96" y1={y} y2={y} stroke="hsl(35 80% 93% / 0.08)" strokeWidth="0.15" strokeDasharray="0.6 1" />
        ))}
        {[20, 40, 60, 80].map((x) => (
          <line key={x} x1={x} x2={x} y1="6" y2="72" stroke="hsl(35 80% 93% / 0.08)" strokeWidth="0.15" strokeDasharray="0.6 1" />
        ))}
        {/* visit dots */}
        {coverageDots.map((d) => {
          const r = 0.6 + (d.visits / 24) * 1.4;
          return (
            <g key={d.district}>
              <circle cx={d.x} cy={d.y} r={r * 2.4} fill="url(#dotG)" />
              <circle cx={d.x} cy={d.y} r={r} fill="hsl(22 100% 64%)" />
            </g>
          );
        })}
        {/* labels for big dots */}
        {coverageDots
          .filter((d) => d.visits >= 18)
          .map((d) => (
            <text
              key={`l-${d.district}`}
              x={d.x + 2}
              y={d.y - 1.5}
              fontSize="2.2"
              fill="hsl(35 80% 95%)"
              fontFamily="var(--font-mono)"
            >
              {d.district}
            </text>
          ))}
      </svg>
      <div className="absolute left-3 top-3 rounded-full bg-bg/90 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.12em] text-primary backdrop-blur">
        ● COVERAGE · weekly merchandiser visits
      </div>
      <div className="absolute right-3 bottom-3 rounded-full bg-accent px-3 py-1 text-[10px] font-mono uppercase tracking-[0.12em] text-accent-fg font-semibold">
        SG · {coverageDots.reduce((s, d) => s + d.visits, 0)} visits/wk
      </div>
    </div>
  );
}

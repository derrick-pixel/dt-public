import { promoCalendar } from "@/data/pricing";
import { cn } from "@/lib/utils";

const festivals = [
  { weeks: [4, 5, 6], label: "CNY" },
  { weeks: [24, 25, 26], label: "GSS" },
  { weeks: [33], label: "Nat'l Day" },
  { weeks: [41], label: "Deepavali" },
  { weeks: [50, 51], label: "Christmas" },
];

export function PromoCalendarHeatmap({ className }: Readonly<{ className?: string }>) {
  return (
    <div className={cn("rounded-3xl border-2 border-primary/15 bg-bg-elevated p-5 overflow-x-auto", className)}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.16em] text-text-muted/80 font-mono font-medium">
          Promo intensity · 52 weeks × 12 categories
        </p>
        <p className="text-[10px] font-mono text-kopi/60">2025 · synthetic</p>
      </div>
      <div className="min-w-[820px]">
        {/* festival labels */}
        <div className="mb-1 grid gap-[3px]" style={{ gridTemplateColumns: "120px repeat(52, minmax(0, 1fr))" }}>
          <span />
          {Array.from({ length: 52 }, (_, w) => {
            const f = festivals.find((x) => x.weeks[0] === w);
            return (
              <span key={w} className="text-[8px] font-mono text-accent text-center truncate font-semibold">
                {f?.label ?? ""}
              </span>
            );
          })}
        </div>
        {promoCalendar.map((row) => (
          <div
            key={row.category}
            className="grid items-center gap-[3px]"
            style={{ gridTemplateColumns: "120px repeat(52, minmax(0, 1fr))" }}
          >
            <span className="pr-2 text-[11px] text-kopi/85 font-mono truncate">{row.category}</span>
            {row.weeks.map((v, w) => (
              <div
                key={w}
                className="aspect-square rounded-md"
                style={{
                  background: `hsl(175 70% ${22 + (v / 100) * 24}% / ${0.15 + (v / 100) * 0.85})`,
                  borderTop: festivals.some((f) => f.weeks.includes(w)) ? "2px solid hsl(22 100% 58%)" : undefined,
                }}
                title={`Wk ${w + 1}: ${v}%`}
              />
            ))}
          </div>
        ))}
        <div className="mt-3 grid gap-[3px] text-[8px] font-mono text-text-muted/60" style={{ gridTemplateColumns: "120px repeat(52, minmax(0, 1fr))" }}>
          <span />
          {Array.from({ length: 52 }, (_, w) => (
            <span key={w} className="text-center">{(w + 1) % 4 === 0 ? `W${w + 1}` : ""}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

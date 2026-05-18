import { tickerLines } from "@/data/ticker";
import { cn } from "@/lib/utils";

export function LiveTicker({ className }: Readonly<{ className?: string }>) {
  const lines = [...tickerLines, ...tickerLines]; // double for seamless loop
  return (
    <div className={cn("relative overflow-hidden bg-primary text-primary-fg", className)}>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-primary to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-primary to-transparent" />
      <div className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-accent px-3 py-1 text-[10px] font-mono uppercase tracking-[0.16em] text-accent-fg font-semibold">
        ● LIVE FEED
      </div>
      <div className="flex whitespace-nowrap py-3.5 animate-ticker pl-44">
        {lines.map((l, i) => (
          <div key={i} className="flex items-center gap-2 px-5 text-xs font-mono text-primary-fg/80">
            <span className="text-primary-fg font-semibold">{l.store}</span>
            <span className="opacity-50">·</span>
            <span>{l.aisle}</span>
            <span className="opacity-50">·</span>
            <span className="text-primary-fg">{l.brand}</span>
            <span className={l.delta.startsWith("+") ? "text-success font-semibold" : "text-accent font-semibold"}>
              {l.metric} ({l.delta})
            </span>
            <span className="opacity-50">·</span>
            <span>{l.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

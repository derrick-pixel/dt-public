import { elasticityHeuristics } from "@/data/pricing-strategy";
import { cn } from "@/lib/utils";

const bandStyle: Record<string, string> = {
  low: "bg-success/15 text-success border-success/40",
  medium: "bg-accent/15 text-accent border-accent/40",
  high: "bg-danger/15 text-danger border-danger/40",
};

export function ElasticityTable() {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-bg-elevated/60">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border bg-bg-elevated">
            <th className="p-4 text-left font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted/70 w-56">
              Segment
            </th>
            <th className="p-4 text-left font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted/70 w-32">
              Band
            </th>
            <th className="p-4 text-left font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted/70">
              Evidence
            </th>
          </tr>
        </thead>
        <tbody>
          {elasticityHeuristics.map((row, i) => (
            <tr key={row.segment} className={cn(i % 2 === 1 && "bg-bg/40")}>
              <td className="p-4 align-top text-text font-medium">{row.segment}</td>
              <td className="p-4 align-top">
                <span className={cn(
                  "inline-flex items-center rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider",
                  bandStyle[row.band],
                )}>
                  {row.band}
                </span>
              </td>
              <td className="p-4 align-top text-xs text-text-muted leading-relaxed">{row.evidence}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

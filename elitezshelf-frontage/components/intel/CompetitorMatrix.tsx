import { competitorMatrix } from "@/data/competitors";
import { cn } from "@/lib/utils";

type Col = {
  key: "elitezshelf" | "trax" | "shelfperfect" | "nielseniq" | "diy";
  label: string;
  accent?: boolean;
};

const cols: Col[] = [
  { key: "elitezshelf",  label: "ElitezShelf",     accent: true },
  { key: "trax",         label: "Trax Retail" },
  { key: "shelfperfect", label: "ShelfPerfect" },
  { key: "nielseniq",    label: "NielsenIQ" },
  { key: "diy",          label: "DIY rep app" },
];

export function CompetitorMatrix({ className }: Readonly<{ className?: string }>) {
  return (
    <div className={cn("overflow-x-auto rounded-xl border border-border bg-bg-elevated/60", className)}>
      <table className="w-full min-w-[760px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-bg-elevated">
            <th className="w-56 p-4 text-left text-[11px] uppercase tracking-[0.18em] text-text-muted/70 font-mono">
              Capability
            </th>
            {cols.map((c) => (
              <th
                key={c.key}
                className={cn(
                  "p-4 text-left text-xs font-semibold tracking-wide",
                  c.accent ? "text-primary" : "text-text",
                )}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {competitorMatrix.map((row, i) => (
            <tr key={row.feature} className={cn("border-b border-border/40", i % 2 === 1 && "bg-bg/40")}>
              <td className="p-4 align-top text-text font-medium">{row.feature}</td>
              {cols.map((c) => (
                <td
                  key={c.key}
                  className={cn(
                    "p-4 align-top text-xs leading-relaxed",
                    c.accent ? "text-text" : "text-text-muted",
                  )}
                >
                  {row[c.key as keyof typeof row]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { segments, needs, cells } from "@/data/whitespace-framework";
import { cn } from "@/lib/utils";

type Verdict = "white" | "green" | "amber" | "red";

function verdictFor(competitorScores: number[]): Verdict {
  const count = competitorScores.filter((s) => s >= 3).length;
  if (count === 0) return "white";
  if (count <= 1) return "green";
  if (count <= 3) return "amber";
  return "red";
}

const verdictStyle: Record<Verdict, { bg: string; ring: string; label: string }> = {
  white: { bg: "bg-bg-elevated", ring: "ring-primary/15", label: "no-data" },
  green: { bg: "bg-success/15", ring: "ring-success/40", label: "WHITESPACE · ATTACK" },
  amber: { bg: "bg-accent/20", ring: "ring-accent/50", label: "CONTESTED · CHOOSE WISELY" },
  red:   { bg: "bg-danger/15", ring: "ring-danger/40", label: "CROWDED · AVOID" },
};

export function WhitespaceHeatmap() {
  const [active, setActive] = useState<string | null>("mid_market_local:heartland_coverage");

  const grid = useMemo(() => {
    return segments.map((seg) => {
      return needs.map((need) => {
        const key = `${seg.id}:${need.id}`;
        const cell = cells[key];
        if (!cell) return { key, segId: seg.id, needId: need.id, our_score: 0, count: 0, verdict: "white" as Verdict, hasData: false };
        const scores = cell.competitors.map((c) => c.score);
        const v = verdictFor(scores);
        return { key, segId: seg.id, needId: need.id, our_score: cell.our_score, count: scores.filter((s) => s >= 3).length, verdict: v, hasData: true };
      });
    });
  }, []);

  const activeCell = active ? cells[active] : undefined;
  const activeSeg = active ? segments.find((s) => s.id === active.split(":")[0]) : undefined;
  const activeNeed = active ? needs.find((n) => n.id === active.split(":")[1]) : undefined;

  return (
    <div className="space-y-5">
      <div className="overflow-x-auto rounded-3xl border-2 border-primary/15 bg-bg-elevated p-4">
        <table className="w-full min-w-[760px] border-separate border-spacing-1 text-xs">
          <thead>
            <tr>
              <th className="text-left font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted/70 pr-2 pb-2 font-medium">
                segment ↓ · need →
              </th>
              {needs.map((n) => (
                <th
                  key={n.id}
                  className="text-center font-mono text-[10px] text-kopi/70 pb-2 align-bottom"
                  style={{ minWidth: 56 }}
                >
                  <div className="rotate-[-45deg] origin-left translate-y-1 whitespace-nowrap">{n.short}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {segments.map((seg, ri) => (
              <tr key={seg.id}>
                <td className="pr-2 align-middle text-kopi/85 text-[11px] font-mono whitespace-nowrap">
                  {seg.name}
                </td>
                {grid[ri].map((cell) => {
                  const v = verdictStyle[cell.verdict];
                  const isActive = active === cell.key;
                  return (
                    <td key={cell.key} className="p-0">
                      <button
                        type="button"
                        onClick={() => cell.hasData && setActive(cell.key)}
                        disabled={!cell.hasData}
                        className={cn(
                          "relative flex h-9 w-full items-center justify-center rounded-md font-mono text-[11px] transition-all",
                          v.bg,
                          "ring-1",
                          v.ring,
                          cell.hasData ? "cursor-pointer hover:scale-105 hover:z-10" : "cursor-not-allowed opacity-40",
                          isActive && "ring-2 ring-accent scale-105 shadow-[0_0_0_2px_hsl(22_100%_58%/0.35)]",
                        )}
                        title={cell.hasData ? `${seg.name} × ${needs.find((n) => n.id === cell.needId)?.name} · ${cell.count} competitor${cell.count === 1 ? "" : "s"} ≥3` : "no data"}
                      >
                        <span className={cn("font-semibold", cell.our_score >= 4 ? "text-primary" : "text-text-muted")}>
                          {cell.hasData ? cell.count : "·"}
                        </span>
                        {cell.hasData && cell.our_score >= 4 && (
                          <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-accent" />
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 px-1 text-[10px] font-mono text-kopi/75">
          <Legend swatch="bg-success/15 ring-success/40" label="0–1 · whitespace" />
          <Legend swatch="bg-accent/20 ring-accent/50" label="2–3 · contested" />
          <Legend swatch="bg-danger/15 ring-danger/40" label="4+ · crowded" />
          <Legend swatch="bg-bg-elevated ring-primary/15" label="no data scored" />
          <span className="ml-auto inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> our_score ≥ 4
          </span>
        </div>
      </div>

      {/* detail panel */}
      <div className="rounded-3xl border-2 border-primary/15 bg-bg-elevated p-6 min-h-[180px]">
        {!activeCell ? (
          <p className="text-sm text-kopi/75">Click any cell to inspect the competitor breakdown.</p>
        ) : (
          <div>
            <div className="mb-3 flex flex-wrap items-baseline gap-2">
              <span className={cn(
                "rounded-full px-3 py-0.5 font-mono text-[10px] uppercase tracking-wider font-semibold",
                activeCell.competitors.filter((c) => c.score >= 3).length === 0 ? "bg-success/20 text-success" :
                activeCell.competitors.filter((c) => c.score >= 3).length <= 1 ? "bg-success/20 text-success" :
                activeCell.competitors.filter((c) => c.score >= 3).length <= 3 ? "bg-accent/30 text-accent-fg" :
                "bg-danger/20 text-danger",
              )}>
                {verdictStyle[
                  verdictFor(activeCell.competitors.map((c) => c.score))
                ].label}
              </span>
              <h4 className="font-display text-base font-bold text-primary">
                {activeSeg?.name} × {activeNeed?.name}
              </h4>
              <span className="ml-auto font-mono text-xs text-accent font-semibold">
                our_score: {activeCell.our_score} / 5
              </span>
            </div>
            <p className="text-xs text-kopi/70 mb-4 italic">{activeSeg?.descriptor}</p>
            {activeCell.competitors.length === 0 ? (
              <p className="text-sm text-kopi/85">
                No competitor scored ≥ 3 on this pair. The cell is genuinely empty — a candidate for the attack-plan ranking below.
              </p>
            ) : (
              <ul className="space-y-3">
                {activeCell.competitors
                  .slice()
                  .sort((a, b) => b.score - a.score)
                  .map((c) => (
                    <li key={c.id} className="border-l-2 border-primary/30 pl-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-medium text-primary">{c.name}</span>
                        <span className="font-mono text-xs text-kopi/70">score: {c.score}</span>
                      </div>
                      <p className="mt-1 text-xs text-kopi/85 leading-relaxed">{c.specialisation_for_cell}</p>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Legend({ swatch, label }: Readonly<{ swatch: string; label: string }>) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("h-3 w-3 rounded-md ring-1", swatch)} />
      {label}
    </span>
  );
}

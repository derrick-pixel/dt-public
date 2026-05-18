import { cn } from "@/lib/utils";

type Props = Readonly<{
  rows?: number;
  cols?: number;
  rowLabels?: string[];
  colLabels?: string[];
  data?: number[][]; // 0..1
  className?: string;
  palette?: "teal" | "stoplight";
  caption?: string;
}>;

function syntheticGrid(rows: number, cols: number) {
  const grid: number[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: number[] = [];
    for (let c = 0; c < cols; c++) {
      const v =
        0.45 +
        Math.sin((r + 1) / 2) * 0.18 +
        Math.cos((c + 2) / 3) * 0.18 +
        ((r * 7 + c * 11) % 13) / 130;
      row.push(Math.max(0, Math.min(1, v)));
    }
    grid.push(row);
  }
  return grid;
}

function tealColor(v: number) {
  // tropical teal → mint gradient on cream
  const a = 0.12 + v * 0.85;
  return `hsl(175 70% ${24 + v * 28}% / ${a})`;
}

function stoplightColor(v: number) {
  // 0=papaya/red, 0.5=accent amber, 1=mint green
  const hue = 22 + v * 110; // 22°=papaya, 132°=success
  return `hsl(${hue} 70% 48% / ${0.30 + v * 0.55})`;
}

export function ShelfHeatmap({
  rows = 8, cols = 12, data, rowLabels, colLabels,
  className, palette = "teal", caption,
}: Props) {
  const grid = data ?? syntheticGrid(rows, cols);
  const colorFn = palette === "teal" ? tealColor : stoplightColor;
  return (
    <div className={cn("rounded-3xl border-2 border-primary/15 bg-bg-elevated p-5", className)}>
      {caption && (
        <p className="mb-3 text-[11px] uppercase tracking-[0.16em] text-text-muted/80 font-mono font-medium">{caption}</p>
      )}
      <div className="flex">
        {rowLabels && (
          <div className="flex flex-col justify-around mr-3 text-[10px] text-kopi/70 font-mono">
            {rowLabels.map((l) => <span key={l}>{l}</span>)}
          </div>
        )}
        <div className="flex-1 grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {grid.flat().map((v, i) => (
            <div
              key={i}
              className="aspect-square rounded-md border border-primary/10"
              style={{ background: colorFn(v) }}
              title={`${(v * 100).toFixed(0)}%`}
            />
          ))}
        </div>
      </div>
      {colLabels && (
        <div className="mt-2 grid gap-[3px] text-[9px] font-mono text-text-muted/70" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {colLabels.map((l) => <span key={l} className="text-center">{l}</span>)}
        </div>
      )}
    </div>
  );
}

"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { canvasDimensions, canvasScores, actors } from "@/data/whitespace-framework";

type Row = { dim: string; [actor: string]: string | number };

const data: Row[] = canvasDimensions.map((d) => {
  const row: Row = { dim: d.label };
  for (const a of actors) row[a.id] = canvasScores[a.id][d.key];
  return row;
});

const palette: Record<string, string> = {
  us: "hsl(22 100% 58%)",          // papaya — our line should pop
  trax: "hsl(175 70% 22%)",        // primary teal
  shelfperfect: "hsl(0 65% 60%)",  // pink-red
  nielseniq: "hsl(40 80% 50%)",    // amber gold
  diy: "hsl(26 30% 50%)",          // kopi mid
};

export function StrategyCanvasRadar() {
  return (
    <div className="h-[480px] w-full">
      <ResponsiveContainer>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
          <PolarGrid stroke="hsl(175 30% 30% / 0.2)" />
          <PolarAngleAxis
            dataKey="dim"
            tick={{ fill: "hsl(175 70% 18%)", fontSize: 11, fontFamily: "var(--font-sans)", fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 5]}
            tick={{ fill: "hsl(28 30% 35%)", fontSize: 10, fontFamily: "var(--font-mono)" }}
            tickCount={6}
            stroke="hsl(175 30% 30% / 0.2)"
          />
          {actors.map((a) => (
            <Radar
              key={a.id}
              name={a.name}
              dataKey={a.id}
              stroke={palette[a.id]}
              strokeWidth={a.us ? 3 : 1.4}
              fill={palette[a.id]}
              fillOpacity={a.us ? 0.22 : 0.06}
              dot={a.us ? { r: 4, stroke: palette[a.id], fill: "hsl(35 80% 93%)", strokeWidth: 2 } : false}
            />
          ))}
          <Tooltip
            contentStyle={{
              background: "hsl(35 80% 93%)",
              border: "2px solid hsl(175 70% 16% / 0.25)",
              borderRadius: 16,
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "hsl(30 60% 8%)",
              boxShadow: "0 8px 24px -8px hsl(175 70% 16% / 0.18)",
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, fontFamily: "var(--font-mono)", paddingTop: 12 }}
            formatter={(value) => <span className="text-kopi/85">{value}</span>}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

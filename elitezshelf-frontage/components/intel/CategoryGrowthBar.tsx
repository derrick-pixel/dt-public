"use client";

import { categoryGrowthYoY } from "@/data/retailers";
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";

export function CategoryGrowthBar() {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer>
        <BarChart data={categoryGrowthYoY} layout="vertical" margin={{ top: 5, right: 16, left: 8, bottom: 5 }}>
          <XAxis type="number" stroke="hsl(175 30% 30% / 0.4)" tick={{ fill: "hsl(28 30% 28%)", fontSize: 11, fontFamily: "var(--font-mono)" }} unit="%" />
          <YAxis type="category" dataKey="category" stroke="hsl(175 30% 30% / 0.4)" tick={{ fill: "hsl(175 70% 22%)", fontSize: 11, fontFamily: "var(--font-sans)" }} width={120} />
          <ReferenceLine x={0} stroke="hsl(175 30% 30% / 0.4)" />
          <Tooltip
            cursor={{ fill: "hsl(175 70% 16% / 0.06)" }}
            contentStyle={{
              background: "hsl(35 80% 93%)",
              border: "2px solid hsl(175 70% 16% / 0.25)",
              borderRadius: 16,
              fontSize: 12,
              fontFamily: "var(--font-mono)",
              color: "hsl(30 60% 8%)",
              boxShadow: "0 8px 24px -8px hsl(175 70% 16% / 0.18)",
            }}
            formatter={(v) => [`${Number(v).toFixed(1)}%`, "YoY"]}
          />
          <Bar dataKey="yoy" radius={[0, 8, 8, 0]}>
            {categoryGrowthYoY.map((d, i) => (
              <Cell key={i} fill={d.yoy >= 0 ? "hsl(175 70% 22%)" : "hsl(22 100% 56%)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import { topSosMovers } from "@/data/sos-movers";
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

export function SosMoversBar() {
  const sorted = [...topSosMovers].sort((a, b) => b.deltaPp - a.deltaPp);
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer>
        <BarChart data={sorted} layout="vertical" margin={{ top: 5, right: 16, left: 8, bottom: 5 }}>
          <XAxis type="number" stroke="hsl(175 30% 30% / 0.4)" tick={{ fill: "hsl(28 30% 28%)", fontSize: 11, fontFamily: "var(--font-mono)" }} unit="pp" domain={[-3, 3]} />
          <YAxis type="category" dataKey="brand" stroke="hsl(175 30% 30% / 0.4)" tick={{ fill: "hsl(175 70% 22%)", fontSize: 11, fontFamily: "var(--font-sans)" }} width={88} />
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
            formatter={(_v, _n, p) => {
              const d = p.payload as (typeof topSosMovers)[number];
              return [`SOS ${d.sosPct.toFixed(1)}% · ${d.deltaPp >= 0 ? "+" : ""}${d.deltaPp}pp`, d.category];
            }}
          />
          <Bar dataKey="deltaPp" radius={[0, 8, 8, 0]}>
            {sorted.map((d, i) => (
              <Cell key={i} fill={d.deltaPp >= 0 ? "hsl(175 70% 22%)" : "hsl(22 100% 56%)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

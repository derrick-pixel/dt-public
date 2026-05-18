"use client";

import { sgRetailerShare } from "@/data/retailers";
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";

const palette = [
  "hsl(175 70% 22%)", // primary teal
  "hsl(175 50% 38%)", // teal-2
  "hsl(22 100% 64%)", // papaya
  "hsl(22 80% 50%)",  // papaya deep
  "hsl(0 70% 70%)",   // pink
  "hsl(165 45% 55%)", // mint deep
  "hsl(40 90% 60%)",  // amber gold
  "hsl(26 30% 50%)",  // kopi mid
];

export function RetailerDonut() {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={sgRetailerShare}
            dataKey="sharePct"
            nameKey="short"
            innerRadius={60}
            outerRadius={100}
            stroke="hsl(35 80% 93%)"
            strokeWidth={3}
            paddingAngle={2}
          >
            {sgRetailerShare.map((_, i) => (
              <Cell key={i} fill={palette[i % palette.length]} />
            ))}
          </Pie>
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
            formatter={(v, _n, p) => {
              const payload = p.payload as { outlets: number; short: string };
              return [`${Number(v)}% · ${payload.outlets} outlets`, payload.short];
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import { Scatter, ScatterChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ZAxis, ReferenceLine } from "recharts";

const data = [
  { promo: 5,  uplift: 8,   sku: "Coca-Cola 1.5L", cat: "CSD" },
  { promo: 10, uplift: 22,  sku: "Milo 1kg", cat: "Beverages" },
  { promo: 12, uplift: 18,  sku: "Pantene 480ml", cat: "Haircare" },
  { promo: 15, uplift: 36,  sku: "Magnum 4pk", cat: "Ice Cream" },
  { promo: 18, uplift: 42,  sku: "Pocari 500ml", cat: "Isotonic" },
  { promo: 22, uplift: 58,  sku: "Yeo's 6pk", cat: "Asian Drinks" },
  { promo: 25, uplift: 52,  sku: "KitKat 8F", cat: "Confectionery" },
  { promo: 30, uplift: 88,  sku: "Lay's 184g", cat: "Snacks" },
  { promo: 32, uplift: 78,  sku: "Oreo 10pk", cat: "Confectionery" },
  { promo: 35, uplift: 95,  sku: "Maggi 5pk", cat: "Instant" },
  { promo: 8,  uplift: 6,   sku: "Pepsi 1.5L", cat: "CSD" },
  { promo: 14, uplift: 12,  sku: "100Plus 6pk", cat: "Isotonic" },
  { promo: 20, uplift: 26,  sku: "Twix 4pk", cat: "Confectionery" },
  { promo: 28, uplift: 64,  sku: "Mr Bean", cat: "Asian Drinks" },
];

export function PriceElasticityScatter() {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer>
        <ScatterChart margin={{ top: 8, right: 16, left: 8, bottom: 28 }}>
          <XAxis
            dataKey="promo"
            type="number"
            stroke="hsl(175 30% 30% / 0.4)"
            tick={{ fill: "hsl(28 30% 28%)", fontSize: 11, fontFamily: "var(--font-mono)" }}
            label={{ value: "Promo depth %", position: "insideBottom", offset: -8, fill: "hsl(28 30% 28%)", fontSize: 11 }}
            domain={[0, 40]}
          />
          <YAxis
            dataKey="uplift"
            type="number"
            stroke="hsl(175 30% 30% / 0.4)"
            tick={{ fill: "hsl(28 30% 28%)", fontSize: 11, fontFamily: "var(--font-mono)" }}
            label={{ value: "Uplift %", angle: -90, position: "insideLeft", fill: "hsl(28 30% 28%)", fontSize: 11 }}
            domain={[0, 100]}
          />
          <ZAxis range={[60, 60]} />
          <ReferenceLine
            segment={[{ x: 0, y: 0 }, { x: 40, y: 100 }]}
            stroke="hsl(22 100% 56% / 0.5)"
            strokeDasharray="3 3"
          />
          <Tooltip
            cursor={{ stroke: "hsl(175 70% 22%)", strokeWidth: 1, strokeDasharray: "3 3" }}
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
              const d = p.payload as (typeof data)[number];
              return [`${d.uplift}% uplift @ ${d.promo}% off`, `${d.sku} · ${d.cat}`];
            }}
          />
          <Scatter data={data} fill="hsl(175 70% 22%)" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

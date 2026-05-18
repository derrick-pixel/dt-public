"use client";

import { useState } from "react";
import { priceSpreadSamples } from "@/data/pricing";
import { cn } from "@/lib/utils";

export function PriceSpreadStrip({ className }: Readonly<{ className?: string }>) {
  const [skuIdx, setSkuIdx] = useState(0);
  const sample = priceSpreadSamples[skuIdx];
  const min = Math.min(...sample.prices.map((p) => p.price));
  const max = Math.max(...sample.prices.map((p) => p.price));
  const span = max - min || 1;

  return (
    <div className={cn("rounded-xl border border-border bg-bg-elevated/60 p-5", className)}>
      <div className="mb-4 flex flex-wrap gap-2">
        {priceSpreadSamples.map((s, i) => (
          <button
            key={s.sku}
            onClick={() => setSkuIdx(i)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs font-mono transition-colors",
              i === skuIdx
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-text-muted hover:border-text-muted",
            )}
          >
            {s.sku}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {sample.prices.map((p) => {
          const pos = ((p.price - min) / span) * 100;
          const isLow = p.price === min;
          const isHigh = p.price === max;
          return (
            <div key={p.retailer} className="grid grid-cols-[110px_1fr_140px] gap-3 items-center">
              <span className="text-xs text-text-muted font-mono">{p.retailer}</span>
              <div className="relative h-7 rounded-md bg-surface/60">
                <div className="absolute inset-y-0 left-0 right-0 rounded-md bg-gradient-to-r from-success/20 via-accent/15 to-danger/20" />
                <div
                  className={cn(
                    "absolute top-1/2 h-5 w-5 -translate-y-1/2 -translate-x-1/2 rounded-full border-2",
                    isLow ? "bg-success border-success" : isHigh ? "bg-danger border-danger" : "bg-primary border-primary",
                  )}
                  style={{ left: `${pos}%` }}
                />
              </div>
              <div className="flex items-center gap-2 justify-end">
                <span className="font-mono tabular-nums text-text">S${p.price.toFixed(2)}</span>
                {p.promo && (
                  <span className="rounded bg-accent/20 px-1.5 py-0.5 font-mono text-[10px] text-accent">
                    {p.promo}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border/60 pt-4 text-xs font-mono">
        <Stat label="Spread" value={`S$${(max - min).toFixed(2)}`} />
        <Stat label="Cheapest" value={sample.prices.find((p) => p.price === min)!.retailer} />
        <Stat label="Most expensive" value={sample.prices.find((p) => p.price === max)!.retailer} />
      </div>
    </div>
  );
}

function Stat({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted/70">{label}</p>
      <p className="text-text">{value}</p>
    </div>
  );
}

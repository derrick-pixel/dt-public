"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = Readonly<{
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  delta?: number;
  helper?: string;
  format?: "number" | "currency" | "compact";
  className?: string;
}>;

export function KpiTile({
  label, value, prefix, suffix, decimals = 0, delta, helper, format = "number", className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1200;
    let frame = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(value * eased);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);

  const formatted =
    format === "compact"
      ? new Intl.NumberFormat("en-SG", { notation: "compact", maximumFractionDigits: 1 }).format(n)
      : new Intl.NumberFormat("en-SG", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "rounded-3xl border-2 border-primary/15 bg-bg-elevated p-6 transition-colors hover:border-primary/40",
        className,
      )}
    >
      <p className="text-[11px] uppercase tracking-[0.16em] text-text-muted/80 font-mono font-medium">{label}</p>
      <div className="mt-2.5 flex items-baseline gap-1">
        {prefix && <span className="text-text-muted text-lg font-mono">{prefix}</span>}
        <span className="font-display text-4xl sm:text-5xl font-bold tracking-tight tabular-nums text-primary">
          {formatted}
        </span>
        {suffix && <span className="text-text-muted text-lg font-mono">{suffix}</span>}
      </div>
      {(delta !== undefined || helper) && (
        <div className="mt-2.5 flex items-center gap-2 text-xs">
          {delta !== undefined && (
            <span
              className={cn(
                "font-mono font-semibold",
                delta > 0 ? "text-success" : delta < 0 ? "text-danger" : "text-text-muted",
              )}
            >
              {delta > 0 ? "▲" : delta < 0 ? "▼" : "■"} {Math.abs(delta).toFixed(1)}
            </span>
          )}
          {helper && <span className="text-kopi/70">{helper}</span>}
        </div>
      )}
    </motion.div>
  );
}

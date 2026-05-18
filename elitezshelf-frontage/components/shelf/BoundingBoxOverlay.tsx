"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Box = {
  x: number; // percent
  y: number;
  w: number;
  h: number;
  label: string;
  meta?: string;
  variant?: "primary" | "danger" | "accent" | "muted";
};

const variantClass: Record<NonNullable<Box["variant"]>, { stroke: string; fill: string; chip: string }> = {
  primary: { stroke: "stroke-accent", fill: "fill-accent/15", chip: "bg-accent text-accent-fg" },
  danger:  { stroke: "stroke-danger",  fill: "fill-danger/15",  chip: "bg-danger text-bg" },
  accent:  { stroke: "stroke-pink",  fill: "fill-pink/15",  chip: "bg-pink text-primary" },
  muted:   { stroke: "stroke-primary", fill: "fill-primary/10", chip: "bg-bg-elevated text-primary border-2 border-primary/30" },
};

export function BoundingBoxOverlay({
  boxes,
  cornerLabel,
  className,
  children,
}: Readonly<{
  boxes: Box[];
  cornerLabel?: string;
  className?: string;
  children?: React.ReactNode;
}>) {
  return (
    <div className={cn("relative overflow-hidden rounded-3xl border-2 border-primary/20 bg-primary", className)}>
      {children}
      {cornerLabel && (
        <div className="absolute left-3 top-3 z-10 rounded-full bg-bg/90 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.12em] text-primary backdrop-blur">
          ● REC · {cornerLabel}
        </div>
      )}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {boxes.map((b, i) => {
          const v = variantClass[b.variant ?? "primary"];
          return (
            <motion.g
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 * i, duration: 0.5 }}
            >
              <rect
                x={b.x} y={b.y} width={b.w} height={b.h}
                className={cn(v.stroke, v.fill)}
                strokeWidth={0.5}
                strokeDasharray="1.2 1"
                vectorEffect="non-scaling-stroke"
                rx={1.2}
              />
            </motion.g>
          );
        })}
      </svg>
      {boxes.map((b, i) => {
        const v = variantClass[b.variant ?? "primary"];
        return (
          <motion.div
            key={`${i}-label`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 * i + 0.2, duration: 0.4 }}
            className={cn(
              "absolute pointer-events-none rounded-full px-2 py-0.5 text-[10px] font-mono font-medium whitespace-nowrap",
              v.chip,
            )}
            style={{ left: `${b.x}%`, top: `calc(${b.y}% - 18px)` }}
          >
            <span className="font-semibold">{b.label}</span>
            {b.meta && <span className="opacity-80"> · {b.meta}</span>}
          </motion.div>
        );
      })}
    </div>
  );
}

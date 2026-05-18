"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { useState } from "react";
import {
  Boxes, Tag, BarChart3, AlertTriangle, ScanLine, ChartBar, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    id: "category",
    icon: Layers,
    label: "Shelf category",
    title: "Category classification, end-to-end aisle.",
    body: "Snacks, beverages, dairy, personal care, frozen, alcohol — every shelf segmented by category with confidence scoring per frame.",
    stat: ">95%",
    statLabel: "category accuracy in core aisles",
  },
  {
    id: "sku",
    icon: ScanLine,
    label: "Brand & SKU",
    title: "Down to the sub-variant.",
    body: "Two-stage detection (brand → variant) against an 18,400+ SKU image library tuned to Singapore retail. New SKUs flagged for human-in-the-loop within 48h.",
    stat: "88%",
    statLabel: "sub-variant accuracy at launch",
  },
  {
    id: "facing",
    icon: Boxes,
    label: "Facing count",
    title: "Facings counted, not estimated.",
    body: "Count facings per SKU per shelf. Detect 'reset' events (planogram changes) automatically.",
    stat: "+/- 1",
    statLabel: "facing accuracy in benchmarks",
  },
  {
    id: "price",
    icon: Tag,
    label: "Price OCR",
    title: "Local price tags, decoded.",
    body: "Tuned OCR for NTUC / Sheng Siong / Cold Storage / Donki tag formats. Promo decoder parses '2 for $5', '20% off', 'Member price' into structured records.",
    stat: "Member · Promo · MAP",
    statLabel: "promo schemes decoded",
  },
  {
    id: "compliance",
    icon: ChartBar,
    label: "Planogram",
    title: "Compliance, not theatre.",
    body: "Upload your planogram. We diff facings, sequence, eye-level, OOS gaps. Evidence packs print-ready for retailer negotiations.",
    stat: "Weekly",
    statLabel: "compliance cadence per chain",
  },
  {
    id: "oos",
    icon: AlertTriangle,
    label: "OOS alerts",
    title: "Real-time gap detection.",
    body: "OOS gaps trigger alerts via Slack/Email/API the moment a merchandiser uploads. Don't wait for the next panel.",
    stat: "<2h",
    statLabel: "median alert latency",
  },
  {
    id: "adjacency",
    icon: BarChart3,
    label: "Adjacency",
    title: "Who you sit next to matters.",
    body: "Track competitor adjacencies, shelf-talker placement, eye-level dominance. The structural questions trade marketing actually wants answered.",
    stat: "0/1/2 hops",
    statLabel: "competitor adjacency model",
  },
];

export function FeatureTabs({ className }: Readonly<{ className?: string }>) {
  const [active, setActive] = useState(features[0].id);
  return (
    <Tabs.Root value={active} onValueChange={setActive} className={cn("grid gap-6 lg:grid-cols-[280px_1fr]", className)}>
      <Tabs.List className="flex flex-col gap-1.5">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <Tabs.Trigger
              key={f.id}
              value={f.id}
              className={cn(
                "group flex items-center gap-3 rounded-2xl border-2 border-transparent px-4 py-3 text-left text-sm transition-all",
                "data-[state=active]:border-primary/30 data-[state=active]:bg-primary-soft data-[state=active]:text-primary",
                "data-[state=inactive]:text-kopi/75 hover:text-primary hover:bg-primary-soft/50",
              )}
            >
              <Icon className="h-4 w-4 shrink-0 group-data-[state=active]:text-accent" />
              <span className="font-medium">{f.label}</span>
            </Tabs.Trigger>
          );
        })}
      </Tabs.List>
      {features.map((f) => (
        <Tabs.Content key={f.id} value={f.id} className="rounded-3xl border-2 border-primary/15 bg-bg-elevated p-7 lg:p-9">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-accent font-mono font-medium mb-4">{f.label}</p>
              <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-primary">{f.title}</h3>
              <p className="mt-3 text-kopi/80 leading-relaxed max-w-prose">{f.body}</p>
            </div>
            <div className="rounded-2xl bg-primary text-primary-fg p-5 lg:min-w-[180px]">
              <div className="font-display text-3xl font-bold text-accent">{f.stat}</div>
              <p className="mt-1.5 text-xs text-primary-fg/70">{f.statLabel}</p>
            </div>
          </div>
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}

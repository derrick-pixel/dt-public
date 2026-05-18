"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";
import { faq } from "@/data/faq";
import { cn } from "@/lib/utils";

export function FAQ({ className }: Readonly<{ className?: string }>) {
  return (
    <Accordion.Root
      type="single"
      collapsible
      className={cn(
        "divide-y-2 divide-primary/10 rounded-3xl border-2 border-primary/15 bg-bg-elevated overflow-hidden",
        className
      )}
    >
      {faq.map((item, i) => (
        <Accordion.Item key={i} value={`q-${i}`}>
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-sm sm:text-base font-medium text-primary hover:text-accent transition-colors">
              <span className="flex items-start gap-4">
                <span className="font-mono text-xs text-accent font-semibold mt-0.5">Q{i + 1}.</span>
                <span className="font-display text-base sm:text-lg font-medium">{item.q}</span>
              </span>
              <Plus className="h-4 w-4 shrink-0 text-primary transition-transform group-data-[state=open]:rotate-45" />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden">
            <div className="px-6 pb-6 pl-16 text-sm text-kopi/85 leading-relaxed">{item.a}</div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}

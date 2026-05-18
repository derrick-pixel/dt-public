"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/intelligence",                 label: "Market" },
  { href: "/intelligence/competitors",     label: "Competitors" },
  { href: "/intelligence/pricing",         label: "Pricing" },
  { href: "/intelligence/consumer",        label: "Consumer" },
  { href: "/intelligence/culture-policy",  label: "Culture & policy" },
  { href: "/intelligence/whitespace",      label: "Whitespace" },
];

export function IntelTabs() {
  const path = usePathname();
  return (
    <nav className="mt-8 flex flex-wrap gap-2 border-b border-border/60 pb-4">
      {tabs.map((t) => {
        const active = path === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors border",
              active
                ? "bg-primary/10 text-primary border-primary/40"
                : "text-text-muted hover:text-text hover:bg-surface border-transparent",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const intelLinks = [
  { href: "/intelligence", label: "Market overview" },
  { href: "/intelligence/competitors", label: "Competitor analytics" },
  { href: "/intelligence/pricing", label: "Pricing analytics" },
  { href: "/intelligence/consumer", label: "Consumer behaviour" },
  { href: "/intelligence/culture-policy", label: "Culture & policy" },
  { href: "/intelligence/whitespace", label: "Whitespace + attack" },
];

export function TopNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [intelOpen, setIntelOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-primary/15 bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-primary-fg font-display text-base font-bold shadow-papaya">
            ES
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-primary">
            Elitez<span className="text-accent">Shelf</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <Link href="/solution" className="text-primary/80 hover:text-accent transition-colors">
            Solution
          </Link>
          <div
            className="relative"
            onMouseEnter={() => setIntelOpen(true)}
            onMouseLeave={() => setIntelOpen(false)}
          >
            <button
              className="inline-flex items-center gap-1 text-primary/80 hover:text-accent transition-colors"
              onClick={() => setIntelOpen((v) => !v)}
            >
              Intelligence <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {intelOpen && (
              <div className="absolute left-1/2 top-full -translate-x-1/2 pt-2">
                <div className="w-64 rounded-2xl border-2 border-primary/30 bg-bg p-2 shadow-[0_18px_40px_-12px_hsl(var(--primary)/0.25)]">
                  {intelLinks.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="block rounded-xl px-3 py-2 text-sm text-text-muted hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Link href="/pricing" className="text-primary/80 hover:text-accent transition-colors">
            Pricing
          </Link>
          <Link href="/about" className="text-primary/80 hover:text-accent transition-colors">
            About
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/demo"
            className={cn(
              "inline-flex h-10 items-center rounded-full bg-accent px-5 text-sm font-semibold text-accent-fg",
              "shadow-papaya transition-transform hover:-translate-y-0.5"
            )}
          >
            Book a demo →
          </Link>
        </div>

        <button
          className="md:hidden text-primary"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-primary/15 bg-bg-elevated">
          <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col gap-1 text-sm">
            <Link href="/solution" className="px-2 py-2 text-primary/80 hover:text-accent">Solution</Link>
            <div className="px-2 py-1 text-xs uppercase tracking-wider text-text-muted/70 font-mono">Intelligence</div>
            {intelLinks.map((l) => (
              <Link key={l.href} href={l.href} className="px-4 py-2 text-text-muted hover:text-primary">
                {l.label}
              </Link>
            ))}
            <Link href="/pricing" className="px-2 py-2 text-primary/80 hover:text-accent">Pricing</Link>
            <Link href="/about" className="px-2 py-2 text-primary/80 hover:text-accent">About</Link>
            <Link
              href="/demo"
              className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-accent px-4 font-semibold text-accent-fg shadow-papaya"
            >
              Book a demo →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

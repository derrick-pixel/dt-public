import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import { recommendedTiers } from "@/data/pricing-strategy";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const fmtSGD = (n: number) =>
  new Intl.NumberFormat("en-SG", { maximumFractionDigits: 0 }).format(n);

export function TierLadder() {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {recommendedTiers.map((t, i) => {
        const isMid = i === 1;
        const psgApplies = t.effective_price_after_psg_monthly < t.price_sgd_monthly;
        return (
          <article
            key={t.name}
            className={cn(
              "flex flex-col rounded-2xl border p-7",
              isMid
                ? "border-primary/40 bg-gradient-to-b from-primary/10 to-bg-elevated ring-1 ring-primary/20"
                : "border-border bg-bg-elevated/60",
            )}
          >
            <header className="mb-5">
              <div className="flex items-center justify-between">
                <h3 className={cn(
                  "text-2xl font-semibold tracking-tight",
                  isMid ? "text-primary" : "text-text",
                )}>
                  {t.name}
                </h3>
                {isMid && (
                  <span className="rounded bg-primary px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary-fg">
                    most popular
                  </span>
                )}
              </div>
              <p className="mt-1 font-mono text-[11px] text-text-muted/80">{t.scope_summary}</p>

              <div className="mt-5">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-sm text-text-muted">S$</span>
                  <span className="font-mono text-5xl font-semibold tracking-tight text-text">
                    {fmtSGD(t.price_sgd_monthly)}
                  </span>
                  <span className="font-mono text-sm text-text-muted">/mo</span>
                </div>
                {psgApplies ? (
                  <p className="mt-1 text-xs text-success font-mono">
                    PSG-eligible · effective S${fmtSGD(t.effective_price_after_psg_monthly)}/mo
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-text-muted/70 font-mono">
                    {t.contract_term}
                  </p>
                )}
              </div>
            </header>

            <div className="mb-4 rounded-md border border-border/60 bg-bg/40 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted/70">
                Designed for
              </p>
              <p className="mt-1 text-sm font-medium text-text">{t.target_persona}</p>
              {t.also_fits && (
                <p className="mt-1 text-xs text-text-muted">also fits · {t.also_fits}</p>
              )}
            </div>

            <p className="mb-5 text-sm text-text-muted leading-relaxed italic">
              {t.psychological_anchor}
            </p>

            <div className="space-y-3 text-sm">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted/70">Included</p>
              <ul className="space-y-2">
                {t.what_in.map((w) => (
                  <li key={w} className="flex items-start gap-2 text-text">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 space-y-2 text-sm">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted/70">
                Not in this tier
              </p>
              <ul className="space-y-1.5">
                {t.what_excluded.map((w) => (
                  <li key={w} className="flex items-start gap-2 text-text-muted/80">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-text-muted/60" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              asChild
              variant={isMid ? "default" : "outline"}
              className="mt-auto pt-5"
              size="lg"
            >
              <Link href="/demo">
                Pilot {t.name} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <p className="mt-3 text-center font-mono text-[10px] text-text-muted/60">
              {t.contract_term}
            </p>
          </article>
        );
      })}
    </div>
  );
}

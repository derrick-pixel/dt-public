import { cn } from "@/lib/utils";

export function ChartTile({
  title,
  subtitle,
  children,
  className,
  footer,
}: Readonly<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}>) {
  return (
    <div className={cn("rounded-xl border border-border bg-bg-elevated/60 p-5", className)}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-text">{title}</h3>
          {subtitle && (
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-text-muted/70 font-mono">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children}
      {footer && <div className="mt-4 border-t border-border/50 pt-3 text-xs text-text-muted">{footer}</div>}
    </div>
  );
}

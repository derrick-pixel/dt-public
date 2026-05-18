import { cn } from "@/lib/utils";
import * as React from "react";

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-3xl border-2 border-primary/15 bg-bg-elevated p-6 transition-all hover:border-primary/40 hover:-translate-y-0.5",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("font-display font-semibold text-primary", className)} {...props} />
);

export const CardEyebrow = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      "text-[10px] uppercase tracking-[0.18em] text-text-muted/80 font-mono",
      className
    )}
    {...props}
  />
);

export const Section = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) => (
  <section className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20", className)} {...props} />
);

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  align = "left",
}: Readonly<{
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
}>) => (
  <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
    {eyebrow && (
      <div className={cn(
        "mb-4 inline-flex items-center gap-2.5 rounded-full bg-primary-soft px-3.5 py-1.5",
        align === "center" && "mx-auto"
      )}>
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        <span className="text-[11px] uppercase tracking-[0.16em] text-primary font-mono font-medium">
          {eyebrow}
        </span>
      </div>
    )}
    <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-primary leading-[1.05]">
      {title}
    </h2>
    {description && (
      <p className="mt-4 text-base sm:text-lg text-kopi/80 leading-relaxed">{description}</p>
    )}
  </div>
);

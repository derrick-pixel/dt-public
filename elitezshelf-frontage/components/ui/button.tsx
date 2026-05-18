import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all focus-visible:outline-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Papaya pill on teal shadow — primary CTA
        default:
          "bg-accent text-accent-fg shadow-papaya hover:-translate-y-0.5",
        // Deep teal pill — secondary CTA
        primary:
          "bg-primary text-primary-fg shadow-teal hover:-translate-y-0.5",
        // Cream outline with teal text
        outline:
          "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-fg",
        ghost:
          "text-primary/80 hover:text-primary hover:bg-primary/10",
        secondary:
          "bg-bg-elevated text-primary hover:bg-primary-soft border-2 border-primary/20",
        link: "text-accent underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-xs",
        lg: "h-13 px-8 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };

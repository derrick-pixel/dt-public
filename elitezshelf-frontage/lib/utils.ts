import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// next/image with output: "export" does NOT auto-apply basePath to the src
// it renders. Wrap every static-asset path with this helper so the URL
// resolves against the GH Pages project subpath in production.
export function asset(path: string) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${base}${path}`;
}

export function formatNumber(n: number, opts?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat("en-SG", opts).format(n);
}

export function formatPct(n: number, digits = 1) {
  return `${n.toFixed(digits)}%`;
}

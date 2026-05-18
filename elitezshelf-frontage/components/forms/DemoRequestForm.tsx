"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FormSchema = z.object({
  fullName: z.string().min(2, "Please share your full name."),
  workEmail: z
    .email("Use a work email address.")
    .refine((v) => !/(gmail|yahoo|hotmail|outlook|live|icloud|proton)\./i.test(v), {
      message: "Please use a work email address.",
    }),
  company: z.string().min(2, "Company name needed."),
  role: z.string().optional(),
  country: z.string().min(2, "Country needed."),
  categories: z.array(z.string()),
  retailers: z.array(z.string()),
  comments: z.string().max(1200).optional(),
});

type FormValues = z.infer<typeof FormSchema>;
type Errors = Partial<Record<keyof FormValues, string>>;

const categories = [
  "CSD", "Snacks", "Confectionery", "Dairy", "Frozen",
  "Personal Care", "Household", "Alcohol", "Health & Wellness",
  "Asian Drinks", "Cooking",
];

const retailers = [
  "NTUC FairPrice", "Sheng Siong", "Cold Storage", "Giant",
  "Prime", "Don Don Donki", "Mustafa", "FairPrice Finest",
];

export function DemoRequestForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState<{ name: string; email: string } | null>(null);
  const [serverMsg, setServerMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    if (fd.get("hp")) {
      setSuccess({ name: "Friend", email: "" });
      return;
    }

    const raw = {
      fullName: String(fd.get("fullName") ?? ""),
      workEmail: String(fd.get("workEmail") ?? ""),
      company: String(fd.get("company") ?? ""),
      role: String(fd.get("role") ?? "") || undefined,
      country: String(fd.get("country") ?? ""),
      categories: fd.getAll("categories").map(String),
      retailers: fd.getAll("retailers").map(String),
      comments: String(fd.get("comments") ?? "") || undefined,
    };

    const parsed = FormSchema.safeParse(raw);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof FormValues;
        if (k && !next[k]) next[k] = issue.message;
      }
      setErrors(next);
      setServerMsg("Please fix the highlighted fields.");
      return;
    }

    setErrors({});
    setServerMsg(null);
    setPending(true);

    try {
      // Static export — open a mailto draft populated with the structured payload.
      // When the live backend is wired, replace this with a fetch() to the lead-capture endpoint.
      const lines = [
        `Name: ${parsed.data.fullName}`,
        `Email: ${parsed.data.workEmail}`,
        `Company: ${parsed.data.company}`,
        parsed.data.role ? `Role: ${parsed.data.role}` : "",
        `Country: ${parsed.data.country}`,
        parsed.data.categories.length ? `Categories: ${parsed.data.categories.join(", ")}` : "",
        parsed.data.retailers.length ? `Retailers: ${parsed.data.retailers.join(", ")}` : "",
        parsed.data.comments ? `\nComments:\n${parsed.data.comments}` : "",
      ].filter(Boolean).join("\n");

      const body = encodeURIComponent(lines);
      const subject = encodeURIComponent(`ElitezShelf demo request — ${parsed.data.company}`);
      window.location.href = `mailto:hello@elitezshelf.com?subject=${subject}&body=${body}`;

      setSuccess({ name: parsed.data.fullName, email: parsed.data.workEmail });
    } finally {
      setPending(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-xl border border-success/40 bg-success/10 p-8">
        <CheckCircle2 className="h-6 w-6 text-success" />
        <h3 className="mt-3 text-xl font-semibold text-text">Thanks, {success.name}.</h3>
        <p className="mt-2 text-sm text-text-muted leading-relaxed max-w-prose">
          A pre-filled email draft just opened in your mail client. Send it and we'll
          reply within one business day with a calendar link.
        </p>
        <p className="mt-4 text-xs font-mono text-text-muted/70">
          If nothing opened, email{" "}
          <a className="text-primary hover:underline" href="mailto:hello@elitezshelf.com">
            hello@elitezshelf.com
          </a>{" "}
          directly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <input type="text" name="hp" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="fullName" label="Full name" placeholder="Anya Tanaka" error={errors.fullName} required />
        <Field name="workEmail" type="email" label="Work email" placeholder="anya.tanaka@suntory.com" error={errors.workEmail} required />
        <Field name="company" label="Company" placeholder="Suntory APAC" error={errors.company} required />
        <Field name="role" label="Role" placeholder="Trade Marketing Manager" />
        <Field name="country" label="Country" placeholder="Singapore" error={errors.country} required />
      </div>

      <div>
        <Label>Categories of interest</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {categories.map((c) => (
            <Pill key={c} name="categories" value={c} />
          ))}
        </div>
      </div>

      <div>
        <Label>Retailers of interest</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {retailers.map((r) => (
            <Pill key={r} name="retailers" value={r} />
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="comments">Anything we should know</Label>
        <textarea
          id="comments"
          name="comments"
          rows={4}
          maxLength={1200}
          placeholder="Pilot SKUs in mind, retailer pain points, timeline..."
          className="mt-2 w-full rounded-md border border-border bg-bg-elevated/60 px-3 py-2.5 text-sm text-text placeholder:text-text-muted/60 focus:border-primary outline-none"
        />
      </div>

      {serverMsg && (
        <div className="flex items-start gap-2 rounded-md border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          <span>{serverMsg}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-5">
        <p className="text-[11px] text-text-muted/70 font-mono">
          PDPA-compliant · Cloudflare Turnstile + Supabase wire up post-launch
        </p>
        <Button type="submit" disabled={pending} size="lg">
          {pending ? "Sending..." : <>Request walkthrough <ArrowRight className="h-4 w-4" /></>}
        </Button>
      </div>
    </form>
  );
}

function Field({
  name, label, error, type = "text", placeholder, required,
}: Readonly<{ name: string; label: string; type?: string; placeholder?: string; error?: string; required?: boolean }>) {
  return (
    <div>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-primary ml-0.5">*</span>}
      </Label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        aria-invalid={!!error}
        className={cn(
          "mt-2 h-11 w-full rounded-md border bg-bg-elevated/60 px-3 text-sm text-text placeholder:text-text-muted/60 focus:border-primary outline-none",
          error ? "border-danger" : "border-border",
        )}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label {...props} className="text-xs font-mono text-text-muted/80 uppercase tracking-wider" />;
}

function Pill({ name, value }: Readonly<{ name: string; value: string }>) {
  return (
    <label className="group cursor-pointer">
      <input type="checkbox" name={name} value={value} className="peer sr-only" />
      <span className="inline-flex items-center rounded-full border border-border px-3 py-1.5 text-xs font-mono text-text-muted transition-colors peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary">
        {value}
      </span>
    </label>
  );
}

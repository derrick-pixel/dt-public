import { Section, SectionHeading, Card } from "@/components/ui/card";
import { DemoRequestForm } from "@/components/forms/DemoRequestForm";
import { CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Book a demo",
  description: "Three SKUs. Three retailers. Four weeks of intelligence. Book a walkthrough with the ElitezShelf team.",
};

const promises = [
  "We'll show you three whitespace cells in your category — for free",
  "Live sample dashboard populated with your retailers' SKUs",
  "Pilot scope, timeline, and quote within one business day",
  "PDPA-compliant. No mailing list, no marketing automation creep.",
];

export default function DemoPage() {
  return (
    <Section className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-start">
      <div>
        <SectionHeading
          eyebrow="Book a walkthrough"
          title="Tell us what you want measured. We'll do the rest."
          description="A 15-minute video call with someone who's actually walked your category. We come prepared with three free whitespace cells and a sample dashboard for your retailers."
        />

        <ul className="mt-8 space-y-3">
          {promises.map((p) => (
            <li key={p} className="flex items-start gap-3 text-sm text-text-muted">
              <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <span>{p}</span>
            </li>
          ))}
        </ul>

        <Card className="mt-8 space-y-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted/70 font-mono">Direct line</p>
          <p className="text-text-muted">
            If you'd prefer to skip the form,{" "}
            <a href="mailto:hello@elitezshelf.com" className="text-primary hover:underline">
              hello@elitezshelf.com
            </a>{" "}
            reaches the founders.
          </p>
        </Card>
      </div>

      <div className="rounded-2xl border border-border bg-bg-elevated/60 p-6 sm:p-8">
        <DemoRequestForm />
      </div>
    </Section>
  );
}

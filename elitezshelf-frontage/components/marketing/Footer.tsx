import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 bg-primary text-primary-fg relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 600px 320px at 90% 10%,hsl(var(--accent)/.45),transparent 70%),radial-gradient(ellipse 500px 300px at 8% 90%,hsl(var(--pink)/.35),transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-accent text-accent-fg font-display text-base font-bold">
                ES
              </span>
              <span className="font-display text-xl font-bold tracking-tight">
                Elitez<span className="text-accent">Shelf</span>
              </span>
            </div>
            <p className="text-sm text-primary-fg/70 max-w-sm leading-relaxed">
              A venture of Elitez Group Pte. Ltd. — Singapore.
              Built on the network that already walks your shelves.
            </p>
            <p className="text-xs text-primary-fg/50 font-mono">UEN 200410243C · Made in Singapore</p>
          </div>
          <FooterCol title="Product" links={[
            { href: "/solution", label: "Solution" },
            { href: "/intelligence", label: "Intelligence" },
            { href: "/intelligence/whitespace", label: "Whitespace atlas" },
            { href: "/pricing", label: "Pricing" },
            { href: "/demo", label: "Book a demo" },
          ]} />
          <FooterCol title="Company" links={[
            { href: "/about", label: "About" },
            { href: "https://elitez.asia", label: "Elitez Group", external: true },
            { href: "https://altru.asia", label: "Altru.asia", external: true },
            { href: "https://www.linkedin.com/company/elitez-group", label: "LinkedIn", external: true },
          ]} />
          <FooterCol title="Legal" links={[
            { href: "#", label: "PDPA notice" },
            { href: "#", label: "Terms" },
            { href: "mailto:hello@elitezshelf.com", label: "Contact" },
          ]} />
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-primary-fg/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-primary-fg/55">
            © 2026 Elitez Group Pte. Ltd. Sample intelligence — live deployments populate with your SKUs.
          </p>
          <p className="text-xs text-primary-fg/55 font-mono">SGT · weekly cadence</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: Readonly<{ title: string; links: Array<{ href: string; label: string; external?: boolean }> }>) {
  return (
    <div>
      <h4 className="text-xs uppercase tracking-[0.18em] text-accent mb-3 font-mono">{title}</h4>
      <ul className="space-y-2 text-sm">
        {links.map((l) =>
          l.external ? (
            <li key={l.label}>
              <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-primary-fg/80 hover:text-accent transition-colors">
                {l.label}
              </a>
            </li>
          ) : (
            <li key={l.label}>
              <Link href={l.href} className="text-primary-fg/80 hover:text-accent transition-colors">
                {l.label}
              </Link>
            </li>
          )
        )}
      </ul>
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Heart } from "lucide-react";
import { Section, SectionHeading, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { asset } from "@/lib/utils";

export const metadata = {
  title: "About",
  description: "About Elitez Group, the founder note, regional footprint, and the philanthropic tie-in.",
};

const footprint = [
  { country: "Singapore", code: "SG", staff: 350, retail: "60% organised" },
  { country: "Malaysia", code: "MY", staff: 180, retail: "Pilot · KL+JB" },
  { country: "Indonesia", code: "ID", staff: 220, retail: "Pilot · JKT+BDG+SBY" },
  { country: "Vietnam", code: "VN", staff: 95, retail: "Distribution support" },
  { country: "Philippines", code: "PH", staff: 140, retail: "Manpower" },
  { country: "Thailand", code: "TH", staff: 60, retail: "Roadmap" },
];

export default function AboutPage() {
  return (
    <>
      <Section>
        <SectionHeading
          eyebrow="About"
          title="The network that already walks your shelves."
          description="Elitez Group Pte. Ltd. is a Singapore-headquartered HR services group with ~350 employees and field manpower deployed weekly across Southeast Asian retail. ElitezShelf is the venture that points that network at the question every CMO has been asking for a decade."
        />
        <figure className="relative mt-12 overflow-hidden rounded-3xl border-2 border-primary/20 bg-bg-elevated">
          <Image
            src={asset("/img/e01.jpg")}
            alt="Wide shot of a Singapore HDB block at golden hour with NTUC FairPrice signage glowing in the foreground"
            width={1600}
            height={900}
            priority
            className="block w-full h-auto"
          />
          <figcaption className="border-t-2 border-primary/15 bg-bg/70 px-5 py-3 text-xs font-mono text-primary/80">
            ● Heartland establishing shot · HDB + NTUC FairPrice · golden hour
          </figcaption>
        </figure>
        <figure className="relative mt-6 overflow-hidden rounded-3xl border-2 border-primary/15 bg-bg-elevated">
          <Image
            src={asset("/img/b01.jpg")}
            alt="Three Elitez merchandisers in navy polo shirts with body-cams clipped to the collar, gathered outside an NTUC FairPrice in Singapore at the start of a weekly route"
            width={1600}
            height={900}
            className="block w-full h-auto"
          />
          <figcaption className="border-t-2 border-primary/15 bg-bg/70 px-5 py-3 text-xs font-mono text-primary/80">
            ● Field team · NTUC FairPrice morning rotation · documentary capture
          </figcaption>
        </figure>
      </Section>

      <Section className="!py-8 grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-start">
        <Card className="space-y-5">
          <figure className="relative -mx-2 -mt-2 overflow-hidden rounded-2xl border-2 border-primary/15">
            <Image
              src={asset("/img/b03.jpg")}
              alt="The founder seated at a Singapore kopitiam table — marble surface, kopi cup, open laptop showing the ElitezShelf dashboard, HDB blocks visible through the window"
              width={1600}
              height={1000}
              className="block w-full h-auto"
            />
            <figcaption className="border-t-2 border-primary/15 bg-bg/70 px-4 py-2 text-[10px] font-mono uppercase tracking-[0.16em] text-primary/80">
              ● Founder note · written from a kopitiam in Singapore
            </figcaption>
          </figure>
          <p className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-accent font-mono font-semibold">Founder note</p>
          <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-primary">
            "We already had the network. We just needed the cameras."
          </h3>
          <div className="space-y-4 text-kopi/85 leading-relaxed">
            <p>
              I have spent twenty years in regional HR services. Elitez ships people to retail floors —
              promoters, merchandisers, retail associates, store associates — for the ten largest FMCG
              brands in Asia. Every week our people walk the same aisles, scan the same shelves, fix
              the same planograms.
            </p>
            <p>
              Until this year, none of that was data. It was activity. The trade-marketing manager in
              Tokyo or Shanghai or London was paying for monthly panels, or for camera-CapEx
              deployments that never made it to half the heartland stores that matter.
            </p>
            <p>
              ElitezShelf is the simplest possible answer to that gap. A S$280 body-cam. Four minutes
              of upload per visit. An AI pipeline that decodes what the camera saw. And a dashboard
              that is populated weekly with the answer. No new headcount. No new contract.
              No new behaviour for the merchandiser.
            </p>
            <p className="text-primary font-semibold font-display">
              — Derrick Teo, Co-founder &amp; CEO
            </p>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-3">
            <h4 className="font-semibold text-text">Elitez Group Pte. Ltd.</h4>
            <ul className="text-sm text-text-muted space-y-2 font-mono">
              <li>HQ · Singapore (since 2004)</li>
              <li>UEN · 200410243C</li>
              <li>Field staff · ~350 SG · ~700 SEA</li>
              <li>Active markets · SG, MY, ID, VN, PH, TH</li>
              <li>Top FMCG MNCs served · 10</li>
            </ul>
          </Card>
          <Card className="space-y-3">
            <Heart className="h-5 w-5 text-accent" />
            <h4 className="font-semibold text-text">Altru.asia &amp; the SP bursary</h4>
            <p className="text-sm text-text-muted leading-relaxed">
              Elitez Group runs Altru.asia — an IPC-registered platform — and an endowed bursary at
              Singapore Polytechnic. ESG isn't a slide for us; it's where founder time goes when ElitezShelf isn't.
            </p>
            <a
              href="https://altru.asia"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-mono text-primary hover:underline"
            >
              altru.asia <ArrowRight className="h-3 w-3" />
            </a>
          </Card>
        </div>
      </Section>

      <Section className="!py-8">
        <SectionHeading eyebrow="Regional footprint" title="350 in Singapore. ~1,000 across Southeast Asia." />
        <figure className="relative mt-8 overflow-hidden rounded-xl border border-border bg-bg-elevated">
          <Image
            src={asset("/img/b02.jpg")}
            alt="Regional footprint atlas — Southeast Asia map with merchandiser density per country highlighted in shelf-tag teal"
            width={1600}
            height={1000}
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="block w-full h-auto"
          />
        </figure>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {footprint.map((f) => (
            <Card key={f.code} className="space-y-3">
              <div className="flex items-baseline justify-between">
                <h4 className="font-semibold text-text">{f.country}</h4>
                <span className="font-mono text-xs text-primary">{f.code}</span>
              </div>
              <div className="font-mono text-3xl font-semibold tracking-tight">{f.staff}</div>
              <p className="text-xs text-text-muted">field manpower · {f.retail}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="!py-12">
        <div className="rounded-2xl border border-border bg-bg-elevated/60 p-8 sm:p-10 grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Hiring promoters and merchandisers across SEA.
            </h3>
            <p className="mt-3 text-text-muted">
              ElitezShelf grows when the underlying network grows. If you're a field associate looking
              for retail or FMCG work, we're hiring. If you're an FMCG brand looking for shelf
              intelligence, we're listening.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button asChild>
              <Link href="/demo">Book a demo <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline">
              <a href="https://elitez.asia" target="_blank" rel="noopener noreferrer">
                Careers at Elitez <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}

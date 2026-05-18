import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Camera, Cpu, Tag, ShieldCheck, Workflow, Send } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { asset } from "@/lib/utils";

export const metadata = {
  title: "Solution",
  description: "How ElitezShelf turns weekly merchandiser visits into AI-decoded retail intelligence.",
};

const steps = [
  {
    n: "01",
    icon: Camera,
    label: "Capture",
    title: "Body-worn cameras issued to existing merchandisers and promoters.",
    body: [
      "Insta360 / GoPro Hero / purpose-built body-cam options. ~S$280 unit cost. No new headcount, no new route.",
      "End-of-shift upload to encrypted S3 / Cloudflare R2 over 4G or in-store Wi-Fi. Median 4-minute upload per visit.",
      "Cameras roll only inside merchandising windows. Audio is disabled. On-device blur of any incidental persons.",
    ],
    stat: "0",
    statLabel: "new merchandisers needed in Singapore",
    image: { src: "/img/p02.jpg", alt: "Body-worn camera clipped to a navy polo shirt collar, studio shot with shelf-tag teal rim light", aspect: "aspect-square" },
  },
  {
    n: "02",
    icon: Workflow,
    label: "Frame extraction & shelf segmentation",
    title: "SAM2-class segmentation isolates shelves from aisle clutter.",
    body: [
      "Frames extracted at adaptive cadence — denser when motion is low, sparser when the merchandiser is walking.",
      "SAM2 segments shelf bays. YOLOv8 / YOLO-NAS, fine-tuned on a Singapore-specific FMCG dataset, finds product instances.",
      "Aisle-end caps, gondolas, and chillers are tagged differently and routed into the right downstream model.",
    ],
    stat: "12 fps",
    statLabel: "in-store frame rate (adaptive)",
    image: { src: "/img/p01.jpg", alt: "AI segmentation overlay on a supermarket aisle with translucent polygon masks colour-coded by category", aspect: "aspect-[4/3]" },
  },
  {
    n: "03",
    icon: Cpu,
    label: "SKU recognition",
    title: "Brand → variant. Two stages, one truth.",
    body: [
      "Coarse model classifies into category (snacks / beverages / dairy / personal care...).",
      "Fine model resolves brand. Embedding match resolves sub-variant against a maintained 18,400+ SKU image library.",
      "Unrecognised SKUs flag the shelf segment for human-in-the-loop tagging. Within 48 hours, the SKU enters the library and downstream audits recognise it automatically.",
    ],
    stat: "88%",
    statLabel: "sub-variant accuracy in core categories",
    image: { src: "/img/h02.jpg", alt: "Sheng Siong snacks aisle with bounding-box overlays identifying KitKat, Lay's, Twix, Cadbury SKUs", aspect: "aspect-[4/3]" },
  },
  {
    n: "04",
    icon: Tag,
    label: "Price tag OCR",
    title: "Local retailer formats. Promo schemes parsed.",
    body: [
      "PaddleOCR / Google Document AI fine-tuned on NTUC, Sheng Siong, Cold Storage, Giant, Donki tag formats.",
      "Promo decoder converts shelf-talker copy into structured records: '2 for $5', '20% off', 'Member price S$11.95'.",
      "Multi-tier pricing (member vs walk-in) tracked when retailer surfaces both on the shelf-talker.",
    ],
    stat: "Member · MAP · Bundle",
    statLabel: "promo schemes parsed",
    image: { src: "/img/h06.jpg", alt: "Macro shot of a Coca-Cola 1.5L shelf-talker reading S$2.45 list, 2 for $4.50 promo, NTUC Member S$2.30", aspect: "aspect-[4/3]" },
  },
  {
    n: "05",
    icon: ShieldCheck,
    label: "Planogram compliance",
    title: "Upload your planogram. We diff what's on the shelf.",
    body: [
      "Compute facing-by-facing diff between planogram and reality.",
      "Score eye-level compliance, sequence compliance, OOS gaps, and competitor-adjacency violations.",
      "Print-ready evidence packs for retailer Category Manager negotiations: photo + facings + dates + retailer + outlet.",
    ],
    stat: "92%",
    statLabel: "median planogram match in pilot data",
    image: { src: "/img/p03.jpg", alt: "Planogram blueprint vs. reality split-screen — green dashed boxes mark matches, red boxes mark non-compliance", aspect: "aspect-[4/3]" },
  },
  {
    n: "06",
    icon: Send,
    label: "Delivery",
    title: "Dashboard, alerts, evidence packs, raw data.",
    body: [
      "Weekly dashboard with category, retailer, region drilldowns.",
      "OOS alerts via Slack / Email / webhook the moment a merchandiser uploads.",
      "Raw CSV / Parquet exports for your BI stack. REST API for product integrations.",
    ],
    stat: "<2h",
    statLabel: "median OOS alert latency",
    image: { src: "/img/u01.jpg", alt: "ElitezShelf BI dashboard with KPI tiles, retailer share donut, SOS movers bar chart, OOS heatmap", aspect: "aspect-[4/3]" },
  },
];

export default function SolutionPage() {
  return (
    <>
      <Section>
        <SectionHeading
          eyebrow="The pipeline"
          title="From shelf-cam frame to trade-marketing dashboard."
          description="Six steps. None of them require you to change your team, your retailer relationship, or your contract. We bolt onto the rotation we already run."
        />
        <figure className="relative mt-12 overflow-hidden rounded-3xl border-2 border-primary/15 bg-bg-elevated">
          <Image
            src={asset("/img/w01.jpg")}
            alt="Six-step retail analytics pipeline diagram on cream paper — Capture · Segment · Recognise · OCR · Diff · Deliver — hand-drawn timeline"
            width={1600}
            height={900}
            className="block w-full h-auto"
          />
          <figcaption className="border-t-2 border-primary/15 bg-bg/70 px-5 py-3 text-xs font-mono text-primary/80 uppercase tracking-[0.12em]">
            ● Six-step pipeline · the lay of the work
          </figcaption>
        </figure>
      </Section>

      <Section className="!py-0">
        <div className="space-y-24">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className="grid gap-10 lg:grid-cols-[260px_1fr] lg:gap-16"
            >
              <div className="lg:sticky lg:top-24 lg:self-start">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-text-muted/70">STEP</span>
                  <span className="font-mono text-xs text-primary">{s.n}</span>
                </div>
                <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5">
                  <s.icon className="h-4 w-4 text-primary" />
                  <span className="text-xs font-mono text-primary uppercase tracking-wider">{s.label}</span>
                </div>
                <h3 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">
                  {s.title}
                </h3>
              </div>
              <div className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,420px)]">
                  <div>
                    <div className="space-y-4 text-base text-text-muted leading-relaxed max-w-prose">
                      {s.body.map((p) => (
                        <p key={p}>{p}</p>
                      ))}
                    </div>
                    <div className="mt-6 inline-flex items-baseline gap-3 rounded-md border border-border bg-bg-elevated/60 px-5 py-4">
                      <span className="font-mono text-2xl font-semibold text-primary">{s.stat}</span>
                      <span className="text-xs text-text-muted">{s.statLabel}</span>
                    </div>
                  </div>
                  <figure className={`relative overflow-hidden rounded-xl border border-border bg-bg-elevated ${s.image.aspect}`}>
                    <Image
                      src={asset(s.image.src)}
                      alt={s.image.alt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 420px"
                      className="object-cover"
                    />
                  </figure>
                </div>
                {s.n === "06" && (
                  <figure className="relative ml-auto w-full max-w-[260px] overflow-hidden rounded-xl border border-border bg-bg-elevated">
                    <Image
                      src={asset("/img/u02.jpg")}
                      alt="Mobile OOS alert notification on a dark phone — Coca-Cola 1.5L OOS detected at NTUC Tampines"
                      width={520}
                      height={1040}
                      sizes="260px"
                      className="block w-full"
                    />
                  </figure>
                )}
              </div>
              {i < steps.length - 1 && (
                <div className="lg:col-span-2 mt-6 h-px bg-border/40" />
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section id="privacy" className="border-t border-border/60 mt-24">
        <SectionHeading
          eyebrow="Privacy posture"
          title="The shelf is the only thing the camera is allowed to see."
        />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            { t: "On-device blur", b: "Faces and PII blurred at the camera before footage leaves the body-cam. Audio is disabled at the firmware level." },
            { t: "Encryption", b: "TLS 1.3 in transit. AES-256 at rest. Region-locked to Singapore (and country-locked when we expand into MY/ID/PH/VN/TH)." },
            { t: "Retailer agreements", b: "Filming windows agreed at the chain level. We do not collect competitor-brand merchandiser footage. PDPA-registered. AI Verify principles." },
          ].map((c) => (
            <div key={c.t} className="rounded-xl border border-border bg-bg-elevated/60 p-6">
              <h4 className="font-semibold text-text">{c.t}</h4>
              <p className="mt-2 text-sm text-text-muted leading-relaxed">{c.b}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start gap-4">
          <Button asChild size="lg">
            <Link href="/demo">
              Book a 15-minute walkthrough <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Section>
    </>
  );
}

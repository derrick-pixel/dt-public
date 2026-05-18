# ElitezShelf — Frontage

The marketing + intelligence website for **ElitezShelf**, a venture by Elitez Group Pte. Ltd. that turns the 60% of Singapore supermarkets we already cover into the world's most efficient retail intelligence network.

> _Every shelf, every week, watched._

## Stack

- Next.js 16 (App Router, TypeScript, Server Components by default)
- Tailwind CSS v4
- Framer Motion for scroll animations and the bounding-box overlay
- Recharts for the dashboards
- Radix primitives (`@radix-ui/react-accordion`, `react-tabs`, etc.)
- Server Action for the demo lead form (Supabase + Resend wiring stubbed — see `db/schema.ts` and `app/demo/actions.ts`)

## Structure

```
app/
  layout.tsx           Root layout · Geist Sans/Mono · TopNav + Footer
  page.tsx             Home — Hero, asymmetry, vs incumbents, what we measure, FAQ
  solution/            6-step pipeline + privacy posture
  intelligence/        Hub + 5 sub-routes
    competitors/         Quadrant + capability matrix + structural argument
    pricing/             Spread + promo calendar + ladder integrity
    consumer/            Mosaic + festival + Nutri-Grade
    culture-policy/      Editorial — Nutri-Grade, HCS, Halal, festivals, sustainability, SEA
    whitespace/          Atlas + 6 cells + 4-step playbook
  about/               Founder note + regional footprint + Altru ESG
  demo/                Lead-capture form + server action
  sitemap.ts robots.ts
components/
  ui/                  Button, Card, Section primitives
  shelf/               BoundingBoxOverlay, KpiTile, LiveTicker, ShelfHeatmap, ShelfMockImage
  intel/               CompetitorMatrix, CompetitorQuadrant, charts, CoverageMap
  marketing/           TopNav, Footer, Hero, TrustStrip, FeatureTabs, FAQ, PricingCTA
  forms/               DemoRequestForm
data/                  Sample JSON/TS — retailers, competitors, sos-movers, pricing, whitespace, faq, ticker
db/                    Drizzle schema sketch for `leads` table
lib/                   `cn()` and formatting helpers
```

## Develop

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build
```

## Pre-launch checklist

The frontage ships with stubbed integrations. Before going live:

- **Supabase** — provision project, set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Run the Drizzle migration for the `leads` table (see `db/schema.ts`).
- **Resend** — set `RESEND_API_KEY` and route demo notifications to `derrick@elitez.asia`.
- **Cloudflare Turnstile** — add the site/secret keys and wrap the demo form.
- **Plausible** — set `PLAUSIBLE_DOMAIN` and add the script.
- **Cloudflare Pages** — wire deployment via `@cloudflare/next-on-pages`.
- **Domain** — confirm `elitezshelf.com` registration; otherwise pick a working subdomain.
- **Logos** — swap typographic placeholders in `TrustStrip` once FMCG client clearance is in place.
- **Founder photo** — add Derrick's headshot to `/public` and reference from `/about`.
- **Pilot pricing** — confirm whether to publish a 5-figure SGD range or keep "contact for quote".

## Brief

`elitezshelf-website-prompt.md` (the master brief) is the source of truth for IA, voice, and acceptance bar. This v0 implements all 11 pages with synthetic-but-plausible data; treat every chart with `// TODO: verify` until the live pipeline lands.

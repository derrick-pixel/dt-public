# ElitezShelf — Vibe Coding Master Brief
### Frontage Marketing & Intelligence Website

> **How to use this document:** Paste Section 0–4 into your tool of choice (Claude Code, Bolt, Lovable, v0, Cursor) as the master prompt. Use Sections 5–11 as follow-up prompts when iterating on individual pages or components. Sample data in Section 12 can be dropped directly into MDX/JSON files.

---

## 0. ROLE & MISSION

You are a senior product engineer and design partner. We are building **ElitezShelf**, the frontage marketing + intelligence website for a new venture by **Elitez Group Pte. Ltd.** (Singapore), the regional HR services group with ~350 employees and field manpower deployed weekly across Southeast Asian retail.

The venture: an AI-powered **Share-on-Shelf (SOS)**, **On-Shelf Availability (OSA)**, and **planogram compliance** intelligence platform for FMCG suppliers (Nestlé, Unilever, P&G, Suntory, Coca-Cola, Mondelez, Danone, etc.).

Our **structural moat** versus competitors (Trax Retail, ShelfPerfect, NielsenIQ Brandbank): we already have boots on the ground. Our merchandisers and promoters cover ~60% of all supermarkets in Singapore on a **weekly cadence**, representing ~80% of our existing FMCG client revenue. By equipping them with body-worn cameras + AI video analytics, we capture passive shelf intelligence at near-zero marginal cost — something Trax can only get via paid data collectors and CapEx-heavy in-store cameras.

**Your mission:** build the frontage website. This is NOT the analytics product itself. It is the storefront that:
1. Sells the vision to FMCG decision-makers (Trade Marketing Managers, Category Managers, Sales Directors)
2. Demonstrates intelligence depth via interactive sample dashboards
3. Positions Elitez against incumbents
4. Captures pilot/demo requests

---

## 1. AUDIENCE & VOICE

### Primary personas
- **Trade Marketing Manager** (FMCG MNC) — owns SOS/OSA targets, gets dinged when competitor steals facings. Reports up to Marketing Director.
- **Category / Channel Manager** — fights for shelf real estate quarterly with retailers. Needs evidence to negotiate.
- **Country Sales Director** — wants weekly retail audit data to coach reps and pressure distributors.
- **CMO / Marketing Director** — strategic, wants whitespace and consumer behaviour intelligence.

### Voice
- Confident, data-led, lightly provocative. Think Stripe × Linear × Bloomberg Terminal.
- Avoid generic SaaS adjectives ("seamless", "robust", "powerful"). Use specific numbers, named retailers, named brands.
- Singaporean / regional context unmistakable: name NTUC FairPrice, Sheng Siong, Cold Storage, Giant, Don Don Donki, Mustafa, Prime by name.
- Position incumbents directly but professionally. Trax and ShelfPerfect should be named in comparison tables.

---

## 2. TECH STACK (NON-NEGOTIABLE)

```
Framework:   Next.js 15 (App Router, TypeScript, Server Components by default)
Styling:     Tailwind CSS v4 + shadcn/ui
Animation:   Framer Motion + Motion One for scroll-driven
DataViz:     Recharts (primary) + Tremor (dashboards) + react-leaflet (maps)
Content:     MDX with @next/mdx + Contentlayer or Velite for typed frontmatter
Forms:       react-hook-form + zod
DB/Auth:     Supabase (lead capture only — no user auth on frontage)
ORM:         Drizzle ORM (against Supabase Postgres)
Email:       Resend for demo-request notifications
Fonts:       Geist Sans + Geist Mono via next/font (or Inter as fallback)
Icons:       Lucide React (primary), Tabler Icons (secondary)
Deployment:  Cloudflare Pages with @cloudflare/next-on-pages adapter
Analytics:   Plausible (privacy-first) + Vercel Speed Insights
SEO:         next-sitemap, structured metadata API, OG image gen with @vercel/og
```

### Repo conventions
- Use `pnpm` as package manager.
- Folder structure: `app/`, `components/`, `lib/`, `content/` (MDX), `data/` (JSON sample data), `db/` (Drizzle schema).
- Use `cn()` utility from shadcn for class merging.
- All components typed strictly. No `any`. Use `Readonly<{ ... }>` for props where appropriate.
- Server Components by default; mark Client Components explicitly with `'use client'` only when necessary (charts, animations, forms).

### GitHub
- Repo name: `elitezshelf-frontage`
- GitHub user: `derrick-pixel`
- Initial commit message: `chore: scaffold elitezshelf frontage`
- Follow conventional commits.

---

## 3. DESIGN SYSTEM

### Mood
**"Field intelligence, weaponised."** Equal parts retail-floor authenticity and Bloomberg-grade analytics. Think: a body-cam frame with bounding-box overlays, transitioning into a clean dashboard.

### Color tokens (use Tailwind config + CSS variables)

```css
--bg:           hsl(220 26% 6%)    /* near-black navy, default dark mode */
--bg-elevated:  hsl(220 22% 10%)
--surface:      hsl(220 20% 14%)
--border:       hsl(220 14% 22%)
--text:         hsl(210 20% 98%)
--text-muted:   hsl(215 14% 65%)

--primary:      hsl(168 84% 42%)   /* shelf-tag teal — distinctive, not blue */
--primary-fg:   hsl(220 26% 6%)
--accent:       hsl(35 92% 58%)    /* warning-amber for "low stock" / urgency */
--danger:       hsl(0 72% 58%)     /* OOS red */
--success:      hsl(142 70% 45%)   /* in-stock green */
```

The site has both **dark mode** (default — feels like a Bloomberg / shelf-cam UI) and **light mode**. Use shadcn's theming approach.

### Typography
- Display: **Geist Sans**, weights 400/500/600/700 — generous tracking on big numbers.
- Mono: **Geist Mono** for KPI digits, SKU codes, prices.
- Hero headline: 64–80px desktop, balanced wrap.
- Body: 16–18px, line-height 1.6.

### Visual motifs (reuse across pages)
1. **Bounding-box overlay** — wrap key images with animated SVG rectangles + small labels mimicking object detection output ("KitKat 4F • SGD 2.85 • Promo: Buy 2 @ 5"). This becomes a signature visual.
2. **Heatmap grids** — 12×24 cell grids representing shelf bays, color-coded by SOS%.
3. **Animated counters** — KPI numbers count up on scroll into view.
4. **Pixel grain / subtle noise** background texture on hero sections.
5. **Live-feed strip** — a horizontally scrolling ticker of "synthetic" recent audits: `NTUC Tampines • Snacks Aisle • Mondelez SOS 18.2% (-1.4) • 11:42 SGT`.

### Motion principles
- Reveal on scroll via Framer Motion `whileInView`.
- KPI numbers tween over 1.2s with `easeOutCubic`.
- Hover states on cards: subtle lift (translateY -2px) + border glow.
- Page transitions: instant (no overlay); use streaming SSR.

---

## 4. INFORMATION ARCHITECTURE

```
/                      Home (concept, hero, social proof, CTA)
/solution              How it works (manpower + camera + AI pipeline)
/intelligence          Market Intelligence (SG FMCG market dashboard)
/intelligence/competitors        Competitor Analytics (vs Trax, ShelfPerfect, NielsenIQ)
/intelligence/pricing            Pricing Analytics (cross-retailer, cross-SKU)
/intelligence/consumer           Consumer Behaviour (multi-cultural, festival, healthy)
/intelligence/culture-policy     Culture & Policy (Nutri-Grade, Halal, HCS, festivals)
/intelligence/whitespace         Whitespace Atlas + Attack Strategy
/about                 About Elitez Group, leadership, regional footprint
/demo                  Book a pilot — form
/blog                  (placeholder, MDX-driven, low priority for MVP)
```

Top nav: **Solution · Intelligence ▾ · About · Demo (CTA button)**
Footer: links, address, IPC charity mention (Altru.asia tie-in is OK), LinkedIn, contact.

---

## 5. PAGE SPEC — `/` HOME

### Sections (in order)

1. **Hero**
   - Headline: *"Every shelf, every week, watched."*
   - Sub: *"ElitezShelf turns the 60% of Singapore's supermarkets we already cover into the world's most efficient retail intelligence network. SOS, OSA, planogram compliance — captured by your own boots on the ground, decoded by AI."*
   - CTA primary: *Book a 15-min walkthrough →*
   - CTA secondary: *See sample intelligence ↓*
   - Visual: looping shelf-cam footage (use a stock video placeholder or a CSS-animated mock) with live AI overlays. Bounding boxes labelling brands, prices, facings counts. Small GPS / timestamp overlay top-left: `NTUC AMK Hub • 09:22 SGT`.

2. **Trust strip** — logos of FMCG clients we serve via Elitez (use neutral placeholder logos labelled `[Top 10 FMCG MNCs]`, instruction to swap when permission is given).

3. **The asymmetry** (3-column)
   - **60%** of Singapore supermarkets covered weekly
   - **80%** of leading FMCG client revenue inside our footprint
   - **0** new headcount required to begin

4. **How we differ from incumbents** — 4-card grid
   - vs Trax: They ship cameras. We ship people who already shop your shelves.
   - vs ShelfPerfect: They audit on demand. We audit on rotation.
   - vs NielsenIQ: They report monthly. We report weekly.
   - vs DIY apps: Your reps fake compliance. Ours wear cameras.

5. **What we measure** — animated tabbed feature grid
   - Shelf category classification
   - Brand & SKU identification (down to sub-variant)
   - Facing count per SKU
   - Price tag OCR + promo decoding
   - Planogram compliance scoring
   - Out-of-stock alerts (real-time, push)
   - Competitor adjacency tracking

6. **Live ticker** — horizontally scrolling synthetic feed of audits.

7. **Intelligence preview** — three card-links to `/intelligence/competitors`, `/intelligence/whitespace`, `/intelligence/pricing` with mini chart previews.

8. **Pilot CTA block** — "Pick three SKUs. Pick three retailers. We deliver four weeks of intelligence. SGD [TBD]. No camera CapEx, no software contract."

9. **FAQ accordion** (8 Qs) — see Section 12 for content.

10. **Footer.**

---

## 6. PAGE SPEC — `/solution`

Linear scroll narrative explaining the pipeline. Each step is a section with a sticky left-side label and a right-side animated diagram.

**Step 1 — Capture.** Body-worn cameras (Insta360 / GoPro Hero / specced bodycams) issued to existing merchandisers + promoters. No extra route, no extra time. Footage uploads over 4G/Wi-Fi at end of shift to encrypted S3 (or Cloudflare R2).

**Step 2 — Frame extraction & shelf segmentation.** Computer vision pipeline (suggested: SAM2 for segmentation, fine-tuned YOLOv8/YOLO-NAS for SKU detection on a Singapore-specific FMCG dataset).

**Step 3 — SKU recognition.** Multi-stage: (i) coarse category (snacks vs beverages), (ii) brand, (iii) sub-variant via embedding match against a maintained SKU image library.

**Step 4 — Price tag OCR.** PaddleOCR or Google Document AI fine-tuned on local NTUC/Sheng Siong/Cold Storage tag formats. Promo parsing rules engine (e.g., "2 for $5", "20% off", "Member price").

**Step 5 — Planogram compliance.** Client uploads planogram → system computes diff (% facings match, sequence match, eye-level compliance, OOS gaps).

**Step 6 — Delivery.** Weekly dashboard, Slack/Email alerts on OOS, downloadable raw CSV/Parquet, API for client BI integration.

Include a quiet privacy note: cameras only record shelves, not faces; PDPA-compliant, on-device blurring of any incidental persons.

---

## 7. PAGE SPEC — `/intelligence` (overview hub)

A single-page dashboard preview. **This is the page that closes deals.** Treat it like a real BI product, not marketing.

### Layout: Tremor-style dashboard with tabs across the top

Tabs: `Market` · `Competitors` · `Pricing` · `Consumer` · `Culture & Policy` · `Whitespace`. Each tab is its own sub-route (see IA above) but `/intelligence` shows a curated "Executive Summary" pulling one hero chart from each.

### Hero KPIs (4 tiles, animated count-up)
- **SGD ~[X]B** Singapore packaged FMCG market — *cite source placeholder*
- **~230** NTUC FairPrice outlets covered
- **62.4%** Estimated weekly merchandiser coverage of organised retail
- **18,400+** SKUs in our reference image library (target by Year 1)

### Six chart tiles
1. **Market share by retailer (donut)** — NTUC, Sheng Siong, DFI (Cold Storage + Giant), Prime, Mustafa, Don Don Donki, Independents.
2. **Category growth (bar, YoY)** — Snacks, Beverages, Dairy, Personal Care, Household, Frozen, Confectionery, Alcohol, Health.
3. **Top 10 brand SOS movers (horizontal bar)** — synthetic but plausible.
4. **OOS heatmap by retailer × category** (12×8 grid).
5. **Price elasticity scatter** (promo depth vs uplift).
6. **Coverage map** — interactive Singapore map (Leaflet + OneMap.sg tiles or MapLibre + protomaps) with dots clustered by district showing weekly merchandiser visits.

CTA at bottom of `/intelligence`: *"This is sample data. Your dashboard, populated weekly with your SKUs across your retailers, takes four weeks to stand up. Book a walkthrough."*

---

## 8. PAGE SPEC — `/intelligence/competitors`

The most opinionated page. Make it a credible competitive intelligence brief.

### Sections

**A. Landscape map.** 2×2 quadrant: X-axis = Audit Frequency (Monthly → Real-time), Y-axis = Coverage Cost (CapEx-heavy → Asset-light). Plot:
- Trax Retail (top-left: real-time, CapEx-heavy)
- ShelfPerfect (mid: weekly, mid)
- NielsenIQ Brandbank (bottom-left: monthly, asset-light but data-light)
- DIY rep apps / SAP RetailX (top-right: real-time, asset-light, low quality)
- **ElitezShelf** (top-right corner: weekly trending real-time, asset-light, high quality — call out the win)

**B. Feature comparison matrix.** Detailed table — see Section 12 for content. Columns: ElitezShelf | Trax | ShelfPerfect | NielsenIQ | DIY rep app. Rows: Coverage cadence, Geographic depth (SG/SEA), Image AI maturity, Price OCR, Planogram diffing, Manpower model, Time-to-deploy, Indicative pricing, Best for.

**C. The structural argument.** Editorial prose explaining why Trax-style models cost more per insight than ours. Include a worked example:
> A Trax-style deployment in Singapore requires ~150 in-store fixed cameras at S$2,000 CapEx + S$200/mo SaaS each, or ~30 dedicated auditors at S$3,500/mo loaded cost. ElitezShelf rides on existing routed merchandisers — marginal cost: a S$280 body-cam and 4 minutes of upload time per visit.

**D. Where incumbents are better (be honest).** A short, credibility-building section. Trax has 13+ years of model training data. NielsenIQ owns purchase-side panels we cannot match. We are not pretending otherwise; we are a complement, not a replacement, for monthly panel data.

**E. Migration / coexistence path.** "Run us alongside Trax for one quarter and compare."

---

## 9. PAGE SPEC — `/intelligence/pricing`

### Sections

1. **Cross-retailer price spread visualizer** — choose any of 30 sample SKUs (e.g., Coca-Cola 1.5L, Milo 1kg refill, Pantene 480ml shampoo) and see the price band across NTUC, Sheng Siong, Cold Storage, Giant, Prime, Don Don Donki. Render as a small-multiples strip plot.

2. **Promo depth distribution.** Histogram of % discount depth observed across 12 weeks for top 100 SKUs. Annotate clusters: "Everyday low" 0–5%, "Member tactical" 5–15%, "Festival blowout" 15–35%, "Clearance" 35%+.

3. **Promo calendar heatmap.** 52 weeks × top categories. Light-up cells when a category had >X% of SKUs on promo. Annotate festival windows: CNY (Jan/Feb), GSS (Great Singapore Sale, Jun), Hari Raya, National Day, Deepavali, Christmas.

4. **Price ladder integrity check.** For each brand, show whether the 250ml / 500ml / 1L price-per-ml ladder is intact. Disrupted ladders signal pricing leakage.

5. **Editorial takeaway** — 3 short prose insights derived from the visuals.

---

## 10. PAGE SPEC — `/intelligence/consumer`

Less data-heavy, more strategic. Mix of charts and editorial.

### Sections

1. **Singapore shopper mosaic.** Composition by ethnicity (Chinese, Malay, Indian, Others), by household type, by retail channel preference. Source line: *"Composite of Singstat 2024 census data and proprietary observations."*

2. **The festival surge map.** Overlay of category sales spikes against the SG festival calendar — CNY mandarin orange spike, Hari Raya cookies/syrups, Deepavali sweets/ghee, Christmas confectionery. ElitezShelf advantage: weekly cadence catches festival shelf changes 2–3 weeks ahead of POS data.

3. **The Healthier Choice / Nutri-Grade effect.** How Grade A/B/C/D labelling on beverages has reshaped the chiller. Chart: facings share of Grade A+B vs C+D over 2023–2025 (sample data — flag for verification).

4. **The premiumisation paradox.** SGD-rich shoppers trading up at Cold Storage / Don Don Donki while value shoppers consolidate at Sheng Siong. Retailer mix shift implications.

5. **The "Asian heartland" niche.** Mustafa, NTUC Hyper, Prime — under-indexed by global SOS tools, over-indexed by ElitezShelf coverage.

---

## 11. PAGE SPEC — `/intelligence/culture-policy`

Editorial-led, MDX. Each subsection 200–400 words + one or two embedded data viz components.

### Subsections
1. **Nutri-Grade labelling (HPB)** — mandatory grades for pre-packaged beverages, advertising prohibition for Grade D. Implications for shelf placement, promo. Sample chart: shift in chiller mix.
2. **Healthier Choice Symbol (HCS)** — voluntary, shopper-recognised. Brand strategies to win the symbol.
3. **Halal certification (MUIS)** — non-negotiable for ~15% of the population; affects adjacency rules (alcohol can't be next to halal staples in some retailers).
4. **Festival regulatory windows** — CNY food import surges (SFA inspections), Hari Raya MOM workforce schedules.
5. **Sustainability and packaging** — Singapore Mandatory Reporting + EPR for packaging coming. SOS implications: lighter packs, refill formats, on-shelf eco-labelling.
6. **Cross-border SEA expansion notes** — preview of how policy differs in MY/ID/PH/VN/TH (Indonesian halal certification BPJPH, Thailand FDA, etc.) — sets up regional ambition.

---

## 12. PAGE SPEC — `/intelligence/whitespace` (the closer)

This is the deal-clincher page. Rebrand it on the site as **"Whitespace Atlas + Attack Strategy"**.

### Concept
We claim to surface **gaps**: SKU/category/retailer/geo combinations where (a) a category indexes high, (b) a brand under-indexes its market share, and (c) shelf real estate is winnable. Then prescribe an attack play.

### Sections

1. **Whitespace map.** Singapore choropleth (postal sector level — use SG OneMap data) overlaid with bubbles representing whitespace value. A right-side panel lists the top 20 whitespace cells with: category, retailer, location cluster, current incumbent brand, suggested challenger, estimated weekly revenue prize.

2. **Whitespace examples (case-study cards × 4).** Each card: a real-feeling synthetic example.
   - *"Halal-certified premium chocolate at NTUC Tampines/Pasir Ris cluster — 4.2% category share for top-3 brands vs SG average 11.7%."*
   - *"Low-sugar isotonic drinks (Grade A) at Sheng Siong heartland stores — only 2 facings vs growing 18% YoY category."*
   - *"Korean ready-meals at Don Don Donki Orchard — 47 SKUs, only 2 from local distributor; whitespace for SG-importer brand."*
   - *"Refill home-care formats at Cold Storage CBD outlets — sustainability shopper index +34, current refill SOS only 6%."*

3. **Attack Strategy framework.** Four-step playbook (visualised as a stepper):
   - **Identify** the whitespace cell.
   - **Pre-negotiate** the planogram change with retailer Category Manager (use ElitezShelf evidence pack).
   - **Activate** with promoter deployment from existing Elitez manpower roster.
   - **Measure** weekly via the same body-cam pipeline.

4. **The compounding loop.** Diagram showing how every audited cycle improves both the model and the playbook recommendations.

5. **Closing CTA.** *"We will show you three whitespace cells in your category — for free — in your demo. You decide whether they're worth more than our annual fee."*

---

## 13. PAGE SPEC — `/about`

- One-paragraph intro to **Elitez Group Pte. Ltd.** — Singapore HQ, ~350 employees, recruitment + BPO + training + consultancy + retail manpower across SEA.
- Founder note from **Derrick Teo, Co-founder & CEO**. Photo placeholder. Two short paragraphs on the genesis of ElitezShelf — "we already had the network; we just needed the cameras."
- Regional footprint map (SG, MY, ID, PH, VN, TH) with merchandiser headcount per market.
- ESG / IPC tie-in — brief mention of Altru.asia and the Singapore Polytechnic endowed bursary (Derrick's existing philanthropy).
- Hiring CTA → links to elitez.asia or LinkedIn.

---

## 14. PAGE SPEC — `/demo`

Lead-capture form. Fields:
- Full name, work email (validate work-email regex), company, role, country, categories of interest (multi-select), retailers of interest (multi-select), comments.
- Honeypot field + Cloudflare Turnstile.
- Submit → Supabase `leads` table via server action; trigger Resend email to `derrick@elitez.asia` (placeholder) with structured payload.
- Success state: confirmation + calendar embed (Cal.com or Google Calendar appointment scheduler placeholder).

### Drizzle schema sketch
```ts
// db/schema.ts
export const leads = pgTable('leads', {
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  fullName: text('full_name').notNull(),
  workEmail: text('work_email').notNull(),
  company: text('company').notNull(),
  role: text('role'),
  country: text('country').notNull(),
  categories: text('categories').array(),
  retailers: text('retailers').array(),
  comments: text('comments'),
  utmSource: text('utm_source'),
  utmMedium: text('utm_medium'),
  utmCampaign: text('utm_campaign'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
});
```

---

## 15. COMPONENT LIBRARY (build these once, reuse everywhere)

```
components/
├── ui/                        # shadcn primitives
├── shelf/
│   ├── BoundingBoxOverlay.tsx       # animated SVG over an <img>
│   ├── LiveTicker.tsx               # marquee of synthetic audit lines
│   ├── ShelfHeatmap.tsx             # 12x24 grid, props: data, palette
│   ├── KpiTile.tsx                  # animated count-up + delta
│   └── RetailerLogo.tsx             # consistent retailer iconography
├── intel/
│   ├── CompetitorMatrix.tsx         # quadrant + table
│   ├── PriceSpreadStrip.tsx         # small-multiples strip plot
│   ├── PromoCalendarHeatmap.tsx     # 52-week heatmap
│   ├── WhitespaceMap.tsx            # Leaflet SG map + bubble overlay
│   └── CoverageMap.tsx              # SG map dot density
├── marketing/
│   ├── Hero.tsx
│   ├── TrustStrip.tsx
│   ├── FeatureTabs.tsx
│   ├── PricingCTA.tsx
│   ├── FAQ.tsx
│   └── Footer.tsx
└── forms/
    └── DemoRequestForm.tsx
```

---

## 16. SAMPLE DATA & CONTENT (drop into `data/` as JSON / TS)

> All numbers below are **directionally plausible synthetic data** for design and copy purposes. Mark with `// TODO: verify` comments. Do not present as audited facts on the live site without verification — use a footer disclaimer: *"Sample intelligence. Live deployments populate with your SKUs and retailers."*

### Singapore organised retail (synthetic shares)
```ts
export const sgRetailerShare = [
  { retailer: 'NTUC FairPrice',      sharePct: 57, outlets: 230 },
  { retailer: 'Sheng Siong',         sharePct: 14, outlets:  74 },
  { retailer: 'Cold Storage (DFI)',  sharePct:  9, outlets:  46 },
  { retailer: 'Giant (DFI)',         sharePct:  7, outlets:  43 },
  { retailer: 'Prime',               sharePct:  3, outlets:  28 },
  { retailer: 'Mustafa',             sharePct:  2, outlets:   1 },
  { retailer: 'Don Don Donki',       sharePct:  3, outlets:  17 },
  { retailer: 'Independents/Others', sharePct:  5, outlets: 320 },
];
```

### Competitor matrix
```ts
export const competitorMatrix = [
  {
    feature: 'Audit cadence',
    elitezshelf: 'Weekly, passive',
    trax: 'Real-time (where cameras installed)',
    shelfperfect: 'On-demand audits',
    nielseniq: 'Monthly panel',
    diy: 'Self-reported by reps',
  },
  {
    feature: 'Geographic depth in Singapore',
    elitezshelf: '~62% organised retail weekly',
    trax: 'Limited fixed-camera footprint',
    shelfperfect: 'Per project scope',
    nielseniq: 'National panel, broad but shallow',
    diy: 'Wherever reps remember',
  },
  {
    feature: 'Image AI maturity',
    elitezshelf: 'New entrant — building local SKU library',
    trax: 'Mature, multi-year training',
    shelfperfect: 'Mature in core categories',
    nielseniq: 'Brandbank — image catalog, not shelf vision',
    diy: 'None',
  },
  {
    feature: 'Price tag OCR + promo decoding',
    elitezshelf: 'Yes, local retailer formats',
    trax: 'Yes',
    shelfperfect: 'Yes',
    nielseniq: 'Indirect via panel',
    diy: 'Manual',
  },
  {
    feature: 'Planogram compliance scoring',
    elitezshelf: 'Yes',
    trax: 'Yes',
    shelfperfect: 'Yes',
    nielseniq: 'No',
    diy: 'Subjective',
  },
  {
    feature: 'Manpower / capture model',
    elitezshelf: 'Existing routed merchandisers — zero marginal',
    trax: 'Fixed cameras / contracted auditors',
    shelfperfect: 'Contracted auditors',
    nielseniq: 'Sample panel',
    diy: 'Client salesforce',
  },
  {
    feature: 'Time to first dashboard',
    elitezshelf: '~4 weeks',
    trax: '8–16 weeks',
    shelfperfect: '4–8 weeks',
    nielseniq: 'Quarterly',
    diy: 'Immediate but unreliable',
  },
  {
    feature: 'Indicative pricing model',
    elitezshelf: 'SKU-bundle subscription, S$ low-mid 5-figures/yr',
    trax: 'Enterprise SaaS, 6-figures/yr',
    shelfperfect: '5–6-figures/yr',
    nielseniq: 'Subscription panels, 6-figures',
    diy: 'Free (and worth it)',
  },
];
```

### Synthetic top SOS movers (for hero chart)
```ts
export const topSosMovers = [
  { brand: 'Coca-Cola',     category: 'CSD',           soSpct: 23.4, deltaPp: +1.8 },
  { brand: 'Milo',          category: 'Malted',        soSpct: 41.2, deltaPp: +0.6 },
  { brand: 'Lay\'s',        category: 'Snacks',        soSpct: 18.9, deltaPp: -0.7 },
  { brand: 'Pantene',       category: 'Haircare',      soSpct: 14.3, deltaPp: +2.1 },
  { brand: 'Magnum',        category: 'Ice Cream',     soSpct: 27.6, deltaPp: -0.4 },
  { brand: 'Maggi',         category: 'Instant Noodle', soSpct: 33.8, deltaPp: +0.2 },
  { brand: 'Kit Kat',       category: 'Confectionery', soSpct: 16.1, deltaPp: +1.3 },
  { brand: 'Pepsi',         category: 'CSD',           soSpct: 11.7, deltaPp: -1.2 },
  { brand: 'Yeo\'s',        category: 'Asian Drinks',  soSpct: 24.5, deltaPp: +0.9 },
  { brand: 'Pocari Sweat',  category: 'Isotonic',      soSpct: 19.2, deltaPp: +2.4 },
];
```

### FAQ content
```
Q1. We already use Trax / NielsenIQ. Why also you?
A1. Because we measure what they don't — at a cadence they can't, in retailers they under-cover, at a marginal cost that lets you pilot without procurement gymnastics. Several clients run us alongside.

Q2. How do you handle PDPA and shopper privacy?
A2. Body-cams point at shelves. On-device blur of any incidental persons. Audio off. Footage encrypted in transit and at rest. We are PDPA-registered and follow IMDA's AI Verify framework principles.

Q3. Do retailers know your merchandisers are filming?
A3. Yes. Retailer relations are managed at the chain level; filming within shopper-empty aisles during merchandising windows is permitted under our existing agreements. We do not collect competitor-brand merchandiser footage.

Q4. How accurate is the AI?
A4. We launch with internal benchmarks of >95% brand-level accuracy and >88% sub-variant accuracy in core categories (snacks, beverages, dairy, confectionery, personal care). Edge categories ramp over the first quarter.

Q5. What happens if a SKU you don't recognise appears?
A5. The shelf segment is flagged for human-in-the-loop tagging. Within 48 hours, the SKU enters the library and downstream audits recognise it.

Q6. What is the contract length?
A6. Quarterly minimum, monthly thereafter. We earn renewal — we don't trap it.

Q7. Can we use the data for retailer negotiations?
A7. Yes — that's a primary use case. We ship printable evidence packs with photos, facings, OOS frequencies and planogram diffs.

Q8. When does regional (MY / ID / PH / VN / TH) coverage go live?
A8. Malaysia and Indonesia in the first 6 months post-launch. Philippines, Vietnam, Thailand follow as Elitez merchandiser networks scale.
```

### Nav copy
```
Solution
Intelligence
  ├ Market overview
  ├ Competitor analytics
  ├ Pricing analytics
  ├ Consumer behaviour
  ├ Culture & policy
  └ Whitespace + attack strategy
About
[Book a demo] (CTA button)
```

### Footer copy
```
ElitezShelf is a venture of Elitez Group Pte. Ltd. — Singapore.
Built on the network that already walks your shelves.
[Solution] [Intelligence] [About] [Demo] [LinkedIn] [Contact]
© 2026 Elitez Group Pte. Ltd. UEN xxxxxxxxx
PDPA notice · Terms · Sample intelligence — live deployments populate with your SKUs.
```

---

## 17. ACCESSIBILITY, SEO, PERFORMANCE

- WCAG 2.2 AA. All charts have a sibling `<table>` for screen readers (visually hidden via `sr-only`).
- Lighthouse targets: Performance 95+, Accessibility 100, SEO 100, Best Practices 100.
- All images via `next/image`, AVIF preferred, lazy-loaded outside hero.
- LCP <2.0s on 4G. Hero video uses `<video preload="metadata" muted playsinline>`.
- Generate dynamic OG images per page via `@vercel/og`.
- `next-sitemap`, `robots.txt` (allow all, sitemap reference).
- Schema.org structured data: `Organization`, `WebSite`, `Service` for the SOS/OSA product.
- Plausible script with custom events: `demo_form_submit`, `intel_tab_view`.

---

## 18. DEPLOYMENT

- Push to GitHub `derrick-pixel/elitezshelf-frontage`.
- Wire to Cloudflare Pages with `@cloudflare/next-on-pages`.
- Environment variables (set in Cloudflare):
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `RESEND_API_KEY`
  - `TURNSTILE_SECRET_KEY`
  - `PLAUSIBLE_DOMAIN`
- Custom domain: `elitezshelf.com` (or subdomain placeholder, verify availability).
- Set up preview deployments per PR.

---

## 19. BUILD ORDER (do this exactly)

1. Scaffold Next.js 15 + Tailwind + shadcn/ui + Geist fonts.
2. Set up Drizzle + Supabase client; create `leads` table migration.
3. Build the design tokens (colors, typography, motion utilities).
4. Build core components: `KpiTile`, `BoundingBoxOverlay`, `LiveTicker`, `Footer`, top nav.
5. Ship the home page (`/`) end-to-end. Stop. Review with Derrick.
6. Build `/solution` next.
7. Build `/intelligence` overview hub with 4 hero KPIs + 6 chart placeholders wired to JSON sample data.
8. Build sub-tabs: `/competitors` → `/whitespace` (whitespace is the closer; ship it before pricing/consumer/culture).
9. Build `/pricing`, `/consumer`, `/culture-policy`.
10. Build `/about`, `/demo` form + Resend integration.
11. SEO, OG images, sitemap, analytics.
12. Deploy to Cloudflare Pages.
13. QA pass on mobile (target iPhone 14, Galaxy S22, iPad Mini).

After each numbered step, pause and summarise what was built, list files changed, and flag anything ambiguous. Do not silently invent business decisions.

---

## 20. THINGS TO ASK DERRICK BEFORE BUILDING

Surface these in your first reply, do not assume:
1. Final brand name confirmation: **ElitezShelf** vs alternatives (e.g., ShelfSense, ShelfIQ, Elitez Vision).
2. Domain choice and whether to register before launch.
3. FMCG client logos: which are cleared for display? Default to anonymised silhouettes.
4. Pilot pricing — is the suggested 5-figure SGD subscription range OK to publish, or keep "Contact for pricing"?
5. Body-cam hardware decision — Insta360 vs GoPro vs purpose-built (impacts one line of `/solution` copy).
6. Regional rollout sequence — confirm MY → ID order; affects the FAQ and About map.
7. Founder photo + bio source — pull from derrickteo.com or new headshot?
8. Legal: who reviews PDPA + retailer-relations claims before launch?

---

## 21. WHAT GOOD LOOKS LIKE (acceptance bar)

- A FMCG Trade Marketing Manager visiting `/intelligence/whitespace` for the first time should think *"this team has actually walked these aisles."*
- A Trax salesperson opening `/intelligence/competitors` should not be able to easily refute the structural argument.
- A Singaporean visitor should see at least three names of local retailers in the first viewport of the home page.
- The home page hero should communicate the entire value proposition in under 12 seconds of scroll.
- Mobile experience must be first-class — many FMCG buyers will open the link on their phone in a meeting.

---

## 22. NON-GOALS (don't build these yet)

- The actual analytics product / client dashboard with real auth.
- The body-cam fleet management portal.
- A pricing page with Stripe checkout.
- An MDX blog beyond a placeholder.
- Multi-language. (English-only for v1; add Bahasa Indonesia + Bahasa Melayu in regional rollout.)

---

## 23. TONE EXAMPLES (paste-ready microcopy)

**Hero alt:** *"While our competitors are still installing cameras, we already shop your shelves."*

**Section header alt:** *"The world's largest passive retail intelligence network was already walking. We just gave it a camera."*

**Pilot CTA alt:** *"You bring three SKUs and three retailers. We bring four weeks of evidence. Either it changes how you negotiate your next planogram, or you don't pay."*

**About paragraph:** *"Elitez Group has been deploying retail and field manpower across Southeast Asia since [year]. ElitezShelf is what happens when you point that network at the question your CMO has been asking for a decade — what is actually on the shelf, right now, in every store that matters."*

---

## END OF MASTER BRIEF

When you (the AI coding tool) start, reply first with:
1. Confirmation you have read this brief.
2. Your build plan as a numbered checklist (mirroring Section 19).
3. Any clarifications from Section 20 you want answered before scaffolding.

Then begin Step 1 of Section 19. Ship in small, reviewable increments.

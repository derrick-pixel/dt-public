# dt-public — Architecture & API Reference

## Overview / Purpose

`dt-public` is the canonical public portfolio repository for Derrick Teo, served at **derrickteo.com** via a **Cloudflare Static-Assets Worker** (`dt-public`) — NOT GitHub Pages. CF's GitHub-integration auto-build expects `wrangler.jsonc` at the repo root; if it's missing or malformed the Worker silently freezes on the last successful bundle (cache purges do not help — the Worker serves bundled assets, not edge-cached HTML). Fix in that scenario is to restore `wrangler.jsonc` at the root and run `wrangler deploy`. The repo is a **one-way downstream mirror**: upstream source repositories (hosted as `derrick-pixel/*` on GitHub) are the authoritative source of truth. `sync-wip.sh` shallow-clones each upstream repo and copies it into a named subfolder; it strips internal docs, agent configs, and private files before committing. The only files edited directly in this repo are the root landing page (`index.html`), site-wide assets, and deploy config.

The repo aggregates two tiers of content:

- **Live products** — links to production URLs (Altru, Lumana, JR+). The actual apps run on their own infrastructure (Cloudflare Workers + D1, Vercel, GitHub Pages, etc.).
- **Preview mirrors** — static snapshots of in-progress projects; these are tagged `noindex,nofollow` by `sync-wip.sh` to avoid duplicate-content penalties.

Each mirrored subfolder may contain its own full application stack (Next.js, CF Workers, Supabase schema, etc.). The sub-projects are documented per-section below.

---

## Tech Stack

| Layer | Technology | Version / Notes |
|---|---|---|
| Hosting | Cloudflare Static-Assets Worker (`dt-public`) | `main` branch → CF auto-builds → derrickteo.com. Needs `wrangler.jsonc` at repo root or auto-build fails silently. |
| CDN / DNS | Cloudflare | Worker-attached zone; orange cloud effectively on (CF terminates TLS + serves assets) |
| Custom domain | CNAME | `derrickteo.com` |
| Root landing page | Vanilla HTML/CSS/JS | Single-file (`index.html`, 1445 lines) |
| Theme | CSS variables | Dark (JARVIS/Stark) + light toggle; persisted in `localStorage` |
| Fonts | Google Fonts CDN | Inter |
| Sync tooling | Bash (`sync-wip.sh`) | Runs manually; shallow git clone + Perl SRI rewriting |
| Secret scanning | Gitleaks | `.gitleaksignore` allowlist for RLS-safe anon keys |
| **Altru sub-project** | | |
| Runtime | Cloudflare Workers (TypeScript) | `compatibility_date: 2026-04-12`; `nodejs_compat` flag |
| Database | Cloudflare D1 (SQLite) | `altru` database; 4 migrations |
| Static assets | CF Assets binding | Served from repo root via `ASSETS.fetch()` |
| Email | Resend | Transactional email via `RESEND_API_KEY` |
| Payments | HitPay | Singapore PayNow aggregator |
| SMS / Phone OTP | Twilio | `TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN` |
| AI Operations | Claude API (Anthropic) | Compliance cron agents; gated by `AI_OPS_ENABLED` |
| Error tracking | Sentry | Optional; falls back to `console.error` |
| **Discounter sub-project** | | |
| Framework | Next.js | 16.2.5 |
| Runtime | React 19.2.4, TypeScript 5 | |
| Database | Supabase (PostgreSQL) | Shared project; multi-tenant via `tenant` column |
| Auth | Supabase phone OTP (Twilio Verify) | Anonymous checkout + phone upsert |
| Payments | PayNow QR | Generated server-side via `qrcode` npm package |
| Cart state | Zustand | Client-side store; `localStorage` persisted |
| Styling | Tailwind CSS 4, shadcn/ui | `@base-ui/react` components |
| Testing | Vitest | Unit tests for cart, order utils, PayNow QR |
| **Elitez ESOP sub-project** | | |
| Runtime | Vanilla JS + Supabase JS v2 | Static HTML pages, no build step |
| Database | Supabase (PostgreSQL) | Project `suehogmzjspagcsrqvsw` (shared auth gate project) |
| Edge Functions | Deno (Supabase Edge Functions) | `admin-invite`, `verify-chain` |
| Auth | Supabase magic-link email | Allowlist hook: elitez.asia + dhc.com.sg only |
| PDF generation | html2canvas + jsPDF (CDN) | `onboarding-guide.pdf` |
| PayNow | SGQR payload generator | Client-side `sgqr.js` |
| Hosting | Cloudflare Pages | `_headers` security headers |
| **ElitezShelf Frontage sub-project** | | |
| Framework | Next.js | 16.2.4 |
| ORM | Drizzle ORM | Schema sketch in `db/schema.ts` (not yet wired to a live DB) |
| UI | Radix UI primitives, Tailwind CSS 4 | |
| Animation | Framer Motion 12 | |
| Charts | Recharts 3 | |
| Forms | React Hook Form + Zod 4 | |
| Output | Static export (`output: "export"`) | GitHub Pages deployment via `basePath` |
| **Competitor-Intel template** | | |
| Runtime | Vanilla JS ES modules | No build step; Node.js `--test` runner for unit tests |
| Theming | Dual-theme CSS (`dual-theme.css`) | |
| PDF export | jsPDF + html2canvas (CDN) | `report/pdf-generator.js` |
| Admin gate | `auth-gate.js` (Supabase OTP) | Shared gate pattern (see Auth section) |

---

## Repository Layout

```
dt-public/
├── index.html                  # Root landing page — derrickteo.com (1445 lines)
├── CNAME                       # "derrickteo.com"
├── sitemap.xml                 # Single URL: https://derrickteo.com/
├── robots.txt                  # Allows root only; disallows all mirrored subfolders
├── site.webmanifest            # PWA manifest for root site
├── sync-wip.sh                 # Weekly sync script (see Build section)
├── .gitleaksignore             # Allowlist for RLS-safe Supabase anon keys
├── bg-space.jpg                # Landing page background (dark theme)
├── thumbnail.png               # OG preview image (1200×630)
├── favicon.*  / android-chrome-*.png / apple-touch-icon.png
│
├── altru/                      # Digital hongbao / wedding-gift platform (CF Workers + D1)
│   ├── src/
│   │   ├── worker.ts           # CF Worker entry: routes /api/* or serves ASSETS
│   │   ├── router.ts           # Regex route table (42 routes)
│   │   ├── types.ts            # Env interface; GiftState / WeddingStatus enums
│   │   ├── routes/             # auth.ts, wedding.ts, couple.ts, gift.ts,
│   │   │                       #   hitpay.ts, compliance.ts, disbursement.ts
│   │   ├── services/           # auth, otp, email, hitpay, sanctions, sms,
│   │   │                       #   encryption, state, ai-ops, audit
│   │   ├── cron/               # auto-refund.ts, disbursement.ts,
│   │   │                       #   invoices.ts, compliance.ts
│   │   └── lib/                # hmac, id, sha256, time, validation, sentry
│   ├── migrations/
│   │   ├── 0001_initial.sql    # Core schema (weddings, couples, gifts, disbursements,
│   │   │                       #   invoices, sessions, otp_codes, sanctions_checks, audit_log)
│   │   ├── 0002_charity_seed.sql
│   │   ├── 0003_compliance.sql # consent_logs, pfa_agreements, fundraising_permits,
│   │   │                       #   data_subject_requests, ai_tasks, regulatory_updates
│   │   └── 0004_sanctions_tables.sql
│   ├── wrangler.jsonc          # CF Workers config: D1 binding, cron triggers, secrets list
│   ├── package.json
│   └── *.html                  # Static pages served by ASSETS binding
│
├── discounter/                 # FMCG clearance for SG worker dorms (Next.js 16 + Supabase)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (store)/        # Customer-facing store pages
│   │   │   │   ├── page.tsx            # Product listing (/)
│   │   │   │   ├── cart/page.tsx
│   │   │   │   ├── checkout/page.tsx
│   │   │   │   ├── account/page.tsx
│   │   │   │   ├── account/orders/page.tsx
│   │   │   │   └── out-of-stock/page.tsx
│   │   │   ├── admin/          # Admin portal (no auth middleware yet in mirror)
│   │   │   │   ├── page.tsx
│   │   │   │   ├── orders/page.tsx
│   │   │   │   ├── products/page.tsx
│   │   │   │   ├── products/new/page.tsx
│   │   │   │   └── delivery/page.tsx
│   │   │   └── api/
│   │   │       ├── orders/create/route.ts      # POST — create order + PayNow QR
│   │   │       ├── orders/lookup/route.ts      # POST — lookup orders by phone
│   │   │       ├── orders/[orderId]/status/route.ts  # GET — order status poll
│   │   │       └── admin/seed-products/route.ts      # POST — seed product catalogue
│   │   ├── lib/
│   │   │   ├── supabase/       # client.ts, server.ts, admin.ts
│   │   │   ├── store/cart.ts   # Zustand cart store
│   │   │   ├── types.ts        # Product, Order, OrderItem, Dormitory, User types
│   │   │   ├── tenant.ts       # TENANT = 'discounter' | 'flashcart'
│   │   │   └── utils/          # order.ts (week cutoff), paynow.ts (QR builder)
│   │   └── components/
│   ├── supabase/
│   │   ├── schema.sql          # Full Postgres schema with RLS policies
│   │   ├── seed.sql
│   │   ├── functions.sql
│   │   └── migrations/         # 2026-04-10, 2026-04-13, 2026-05-13 (flashcart unification)
│   ├── next.config.ts
│   └── package.json
│
├── esop/                       # Elitez ESOP platform (vanilla JS + Supabase)
│   ├── assets/                 # JS modules: app.js, auth.js, store.js, trading.js,
│   │   │                       #   admin.js, committee.js, sgqr.js, docs.js, etc.
│   │   └── data.json           # Seed/config data
│   ├── supabase/
│   │   ├── config.toml         # Supabase CLI config; project_id = "Elitez-ESOP"
│   │   ├── migrations/         # 21 migrations (profiles, events, audit_log,
│   │   │                       #   documents, payments, RPCs, views, holders_directory)
│   │   ├── functions/
│   │   │   ├── admin-invite/index.ts   # Deno Edge Function — invite user + create profile
│   │   │   └── verify-chain/index.ts   # Deno Edge Function — nightly event-chain verification
│   │   └── tests/
│   ├── _headers                # Cloudflare Pages security headers
│   ├── intel/                  # Competitor analytics pages (auth-gated)
│   └── *.html                  # Pages: index, portal, trading, admin, committee, scheme, etc.
│
├── elitezshelf-frontage/       # ElitezShelf marketing site (Next.js 16, static export)
│   ├── app/
│   │   ├── page.tsx            # Homepage
│   │   ├── about/page.tsx
│   │   ├── demo/page.tsx
│   │   ├── pricing/page.tsx
│   │   ├── solution/page.tsx
│   │   └── intelligence/       # Competitors, consumer, culture-policy, pricing, whitespace
│   ├── db/schema.ts            # Drizzle schema sketch: leads table (not yet live)
│   ├── data/                   # TS data files: competitors.ts, pricing.ts, retailers.ts, etc.
│   ├── components/
│   ├── lib/
│   └── next.config.ts          # Static export; basePath=/elitezshelf-frontage in prod
│
├── competitor-intel/           # Reusable competitor analytics template (vanilla JS)
│   ├── template/
│   │   ├── admin/              # OTP-gated admin pages: index, insights, whitespace,
│   │   │                       #   design-audit, report
│   │   └── assets/
│   │       ├── js/             # app.js, dom.js, dual-theme.js, format.js,
│   │       │                   #   report/pdf-generator.js, report/toc.js, etc.
│   │       └── css/            # admin.css, dual-theme.css, site.css, report.css
│   ├── methodology/            # Research methodology docs
│   ├── showcase/               # Example instantiations
│   └── package.json            # name: competitor-intel-template; Node test runner
│
├── dt-site-creator/            # Site-building methodology (vanilla JS + Supabase auth)
│   ├── dashboard/              # Interactive dashboard: archetypes, mechanics, ecosystem
│   │   ├── js/                 # auth.js, auth-config.js, main.js, assemble.js, etc.
│   │   └── data/               # archetypes.json, mechanics.json, examples.json
│   ├── archetypes/             # Archetype reference pages
│   ├── mechanics/              # 11 mechanics subdirectories
│   └── *.html                  # index, showcase, assembly, pitfalls, scope, etc.
│
├── aevum/                      # AEVUM MRI clinic (static HTML; 8 style variants)
│   ├── admin/                  # OTP-gated admin/intel pages
│   ├── data/                   # competitors.json, design-audit.json,
│   │                           #   market-intelligence.json, pricing-strategy.json, etc.
│   ├── style-*.html            # 8 style variant pages (atlas, cinematic, clinic,
│   │                           #   clinical, console, editorial, evidence, obsidian, twilight)
│   └── index.html
│
├── altru/admin/                # (see altru/ above — admin sub-path)
├── elitez-security/            # Elitez Security website (static HTML)
│   ├── admin/                  # OTP-gated competitor intel
│   └── data/                   # Standard intel JSON set
├── elix-eor/                   # Elitez EOR website (static HTML + admin intel)
│   └── data/
├── xinceai/                    # XinceAI website (static HTML + admin intel)
│   └── data/                   # brand-tokens.json + standard intel set
├── elitezai/                   # ElitezAI website (static HTML)
├── the-commons/                # P2P event platform (vanilla JS; localStorage v2 backend)
│   ├── assets/js/              # app.js, dom.js, format.js, viz/heatmap.js, viz/radar.js
│   ├── data/                   # Standard intel JSON set
│   └── BACKEND.md              # Schema spec for Supabase migration path
├── elixcraft/                  # ElixCraft gamified HR (vanilla JS)
│   ├── js/                     # game-state.js, boss-battle.js, career-map.js, etc.
│   ├── data/                   # benefits.json, jobs.json, skills.json
│   └── elix-onboarding/        # Professional skin (separate HTML set)
├── vectorsky/                  # Vector Sky Defence website (static HTML)
├── site-supervisor/            # Elitez Site Supervisor website (static HTML)
│   └── admin/                  # OTP-gated pages
├── passage/                    # Passage caskets DTC website (static HTML)
│   ├── admin/                  # OTP-gated admin/intel
│   └── data/
├── pulse/                      # Elitez Pulse marketing retainer (static HTML)
│   ├── admin/                  # OTP-gated pages
│   └── data/                   # capabilities.json, company.json, competitors.json,
│                               #   insights.json, packages.json, templates.json, etc.
├── lumana/                     # Lumana aged-care monitoring site (static HTML)
│   └── admin/                  # OTP-gated pages; gate.js (separate Supabase project)
├── events/                     # Elitez Events website (static HTML + admin intel)
│   └── data/
├── elix-resume/                # ELIX Resume editor (static HTML)
├── flashcart-research/         # FlashCart research template (vanilla JS)
│   └── template/admin/         # OTP-gated
├── market-tracker-research/    # Market Tracker research template (vanilla JS)
│   └── template/admin/         # OTP-gated
├── wip/                        # Staging area for not-yet-public previews (git-ignored)
└── img/                        # Root-level image assets for landing page
```

---

## System Architecture

### Runtime Architecture & Data Flow

```
Internet
    │
    ▼
┌──────────────────────────────────────────────────────┐
│  Cloudflare DNS + Worker route                        │
│  derrickteo.com → CF zone → dt-public Static-Assets   │
│  Worker (auto-built from `main` via GitHub integration│
│  — needs wrangler.jsonc at repo root)                 │
└─────────────────────────┬────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────┐
│  Cloudflare Static-Assets Worker `dt-public`         │
│  Serves bundled assets at derrickteo.com             │
│  • index.html  (portfolio landing page)              │
│  • <subfolder>/*.html  (mirrored previews)           │
│  • robots.txt, sitemap.xml, _headers, CNAME          │
│  • cache purge via .github/workflows/purge.yml       │
└─────────────────────────┬────────────────────────────┘
                          │
           ┌──────────────┼──────────────┐
           │              │              │
           ▼              ▼              ▼
   ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐
   │ Admin/Intel  │ │  Altru app   │ │ Discounter / ESOP / other│
   │ pages in     │ │  (mirrored   │ │ sub-projects (mirrored   │
   │ each subfol- │ │  static HTML)│ │ static HTML / Next.js    │
   │ der (gated   │ │              │ │ static export)           │
   │ by auth-gate)│ │  LIVE app    │ │  LIVE apps on own infra  │
   └──────┬───────┘ │  on CF       │ │  (CF Pages, Vercel, etc) │
          │         │  Workers +   │ └──────────────────────────┘
          │         │  D1 + HitPay │
          ▼         └──────────────┘
   Supabase (shared auth project)
   suehogmzjspagcsrqvsw.supabase.co
   • Email OTP delivery via Resend SMTP
   • Before-User-Created hook: allow elitez.asia + dhc.com.sg only
   • Used by: auth-gate.js across all admin/intel pages
```

### Source Sync Flow

```
derrick-pixel/<repo> (upstream source — canonical)
         │
         │  ./sync-wip.sh  (manual, weekly)
         │  1. git clone --depth=1
         │  2. rm .git, .github
         │  3. Strip: docs/, .claude/, CLAUDE.md, *.private.*
         │  4. Inject <meta name="robots" noindex,nofollow> in all HTML
         │  5. Rewrite CDN script tags with SRI integrity hashes (Perl)
         ▼
dt-public/<subfolder>/  (downstream mirror — public)
         │
         │  git add -A && git commit && git push
         ▼
CF Static-Assets Worker → derrickteo.com/<subfolder>/
```

### Admin / Intel Gate Flow (all gated pages)

```
Browser loads <subfolder>/admin/*.html
  └─► auth-gate.js injects full-screen OTP overlay
        └─► user enters @elitez.asia or @dhc.com.sg email
              └─► Supabase signInWithOtp() → Resend delivers OTP
                    └─► verifyOtp() creates session in localStorage
                          └─► overlay removed; page content revealed
                                └─► window._sbReady (Promise) resolved
```

### Altru Data Flow

```
Guest donor visits altru.asia/donate
  └─► POST /api/gift/create → Worker validates → D1 INSERT gifts
        └─► HitPay payment link returned to guest
              └─► Guest pays → HitPay calls POST /api/hitpay/webhook
                    └─► gifts.state → 'pending' (pending couple auth)
                          └─► Couple sees pending gifts in dashboard
                                └─► POST /api/couple/gifts/authorise
                                      └─► Step-up OTP if amount > S$500
                                            └─► gifts.state → 'authorised'
                                                  └─► Daily cron:
                                                        runDisbursement()
                                                          → PayNow transfer
                                                          → 5% fee invoice
```

---

## API Reference

### Altru — Cloudflare Worker API (`/api/*`)

All routes are defined in `altru/src/router.ts`. Requests to `/api/*` are handled by the Worker; everything else is served as a static asset.

**Auth routes** (`altru/src/routes/auth.ts`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/magic-link/request` | None | Send magic-link email to a couple's address. Always returns `{ ok: true }` to avoid email enumeration. |
| `GET` | `/api/auth/magic-link/verify` | None | Consume magic-link token (`?token=`), create session cookie, redirect to couple dashboard. |

**Wedding routes** (`altru/src/routes/wedding.ts`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/wedding/create` | None | Create a new wedding page. Body: `{ slug, weddingDate, displayName, mobile, charityIds?, splitPct? }`. Returns `{ weddingId, slug }`. |
| `GET` | `/api/wedding/by-slug/:slug` | None | Get public wedding info by URL slug. |
| `GET` | `/api/wedding/claim/info` | None | Get claim info for a guest-created wedding (`?token=`). |
| `POST` | `/api/wedding/claim/start` | None | Start the couple claim flow for a guest-created page. |
| `POST` | `/api/wedding/claim/verify` | None | Verify the claim OTP and transfer ownership. |

**Gift routes** (`altru/src/routes/gift.ts`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/gift/create` | None | Donor creates a gift. Body: `{ weddingId, guestName, guestMobile, guestEmail?, amountCents, personalPortionPct?, message? }`. Returns HitPay payment URL. |
| `GET` | `/api/gift/:giftId` | None | Get public gift status (state machine value only — no PII). |
| `GET` | `/api/gift/:giftId/refund-link/:hash` | None | Validate a refund link token and return the refund status. |

**HitPay webhook** (`altru/src/routes/hitpay.ts`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/hitpay/webhook` | HMAC `X-HitPay-Signature` | Receive payment confirmation from HitPay. Transitions gift state to `pending`. |

**Couple routes** (`altru/src/routes/couple.ts`) — require session cookie

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/couple/me` | Session | Get the signed-in couple's profile + wedding info. |
| `POST` | `/api/couple/verify-mobile/request` | Session | Send SMS OTP to the couple's mobile. |
| `POST` | `/api/couple/verify-mobile/confirm` | Session | Confirm SMS OTP; sets `mobile_verified_at`. |
| `POST` | `/api/couple/set-nric` | Session | Store AES-256 encrypted NRIC; requires mobile verified. |
| `POST` | `/api/couple/charity-selection` | Session | Update the couple's charity allocation. Body: `{ charityPortions: [{ charityId, sharePct }] }`. |
| `POST` | `/api/couple/add-partner` | Session | Invite the second partner. Body: `{ email, displayName, mobile }`. |
| `GET` | `/api/couple/gifts` | Session | List all gifts for the couple's wedding. |
| `POST` | `/api/couple/gifts/authorise` | Session | Authorise a batch of gifts. Body: `{ giftIds: string[] }`. Returns step-up OTP required if any gift > `LARGE_GIFT_THRESHOLD_CENTS`. |
| `POST` | `/api/couple/gifts/authorise/otp` | Session | Confirm step-up OTP for large-gift authorisation. |
| `POST` | `/api/couple/gifts/decline` | Session | Decline (trigger refund) for a batch of gifts. |
| `GET` | `/api/couple/audit` | Session | Get the immutable audit log entries for this couple's wedding. |
| `POST` | `/api/couple/claim` | Session | Claim a guest-created wedding page. |

**Charity routes** (`altru/src/routes/disbursement.ts`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/charity/list` | None | List all active charities with their display info. |
| `GET` | `/api/charity/portal` | Session (charity) | Charity portal — disbursements and invoice history for authenticated charity. |

**Compliance routes** (`altru/src/routes/compliance.ts`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/compliance/dsr` | None | Submit a PDPA Data Subject Request (access / deletion / correction). |
| `POST` | `/api/compliance/support` | None | Submit a support/contact request. |
| `GET` | `/api/compliance/status` | None | Public compliance status page (PSA licence status, etc.). |

**Admin routes** — protected by Cloudflare Access at the edge (`/api/admin/*`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/admin/ai-tasks` | CF Access | List pending AI operations tasks. |
| `POST` | `/api/admin/ai-tasks/:id/approve` | CF Access | Approve an AI-generated task output for actioning. |
| `POST` | `/api/admin/breach` | CF Access | Submit a data breach assessment for AI triage. |
| `GET` | `/api/admin/disbursements` | CF Access | List queued disbursements. |
| `POST` | `/api/admin/disbursements/:id/sent` | CF Access | Mark a disbursement as sent (bank transfer initiated). |
| `POST` | `/api/admin/disbursements/:id/confirmed` | CF Access | Mark a disbursement as confirmed (bank confirmed receipt). |
| `GET` | `/api/admin/invoices` | CF Access | List charity invoices. |
| `GET` | `/api/admin/dsr` | CF Access | List open Data Subject Requests. |
| `POST` | `/api/admin/dsr/:id/complete` | CF Access | Mark a DSR as completed. |
| `GET` | `/api/admin/sanctions` | CF Access | List recent MAS sanctions checks. |

**Altru Cron Handlers** (Workers Scheduled triggers — no HTTP path)

| Cron (UTC) | SGT | Handler | Description |
|---|---|---|---|
| `0 * * * *` | Hourly | `runAutoRefund()` | Auto-refund gifts past their 14-day authorisation window |
| `0 1 * * *` | 09:00 | `runDisbursement()` | Daily: authorised gifts → queued PayNow payouts |
| `0 2 1 * *` | 10:00 1st | `runMonthlyInvoices()` | Monthly: 5% platform-fee invoices to charities |
| `0 3 * * *` | 11:00 | `dispatchComplianceCron()` | PDPA data retention sweep (sessions, OTPs) |
| `0 4 * * *` | 12:00 | `dispatchComplianceCron()` | HitPay reconciliation report |
| `0 5 * * *` | 13:00 | `dispatchComplianceCron()` | MAS sanctions list refresh (AI-assisted) |
| `0 10 * * 1` | 18:00 Mon | `dispatchComplianceCron()` | Weekly AI compliance review |
| `0 0 * * *` | 08:00 | `dispatchComplianceCron()` | DSR 30-day deadline checker |

---

### Discounter — Next.js API Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/orders/create` | None (phone upsert) | Create an order. Body: `{ name, phone, postalCode, dormitoryId, items: [{ productId, quantity }], totalAmount }`. Server re-prices from DB, generates PayNow QR. Rate limited: 5 req / IP / 15 min. Returns `{ orderId, paymentRef, qrDataUrl }`. |
| `POST` | `/api/orders/lookup` | None | Look up all orders by phone number. Returns `{ orders: [...] }`. |
| `GET` | `/api/orders/[orderId]/status` | None | Poll order status. Returns `{ status, paymentStatus }`. |
| `POST` | `/api/admin/seed-products` | Supabase session (admin role) | Seed the product catalogue from the built-in GSK / legacy FMCG list. |

---

### ESOP — Supabase Edge Functions

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `https://<ref>.functions.supabase.co/admin-invite` | Supabase JWT (admin role) | Invite a new holder / committee / admin user. Body: `{ email, full_name, role, holder_id? }`. Creates Supabase auth user + profile row. |
| `POST` | `https://<ref>.functions.supabase.co/verify-chain` | Bearer shared secret (`VERIFY_CHAIN_SECRET`) | Trigger nightly event-chain integrity verification. Calls `verify_chain()` RPC; logs result to `audit_log`. |

---

### Competitor-Intel Template — Client-Side Data Loading

Not a server API. Each admin page calls `loadAppData(path)` (in `template/assets/js/app.js`) to fetch the project's `data/*.json` files at runtime. The admin pages are gated by `auth-gate.js`.

| File | Purpose |
|---|---|
| `data/competitors.json` | Competitor profiles and scoring matrix |
| `data/design-audit.json` | Design quality rubric for each competitor |
| `data/market-intelligence.json` | Market size, segments, trends |
| `data/pricing-strategy.json` | Pricing tiers and competitive positioning |
| `data/whitespace-competitors.json` | Whitespace analysis per competitor |
| `data/whitespace-framework.json` | Whitespace framework dimensions |

---

## Data Model

### Altru — Cloudflare D1 (SQLite)

**`weddings`**

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | |
| `slug` | TEXT UNIQUE | URL-safe identifier |
| `wedding_date` | TEXT | ISO 8601 |
| `status` | TEXT | `pending_couple_claim \| active \| closed \| past \| disputed` |
| `default_split_personal_pct` | INTEGER | 0–100; percentage of gift going to couple vs charity |
| `created_by` | TEXT | `couple \| guest` |
| `created_at` | INTEGER | Unix seconds |
| `claimed_at` | INTEGER | Unix seconds, nullable |
| `closed_at` | INTEGER | Unix seconds, nullable |

**`couples`**

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | |
| `wedding_id` | TEXT FK → weddings | |
| `display_name` | TEXT | |
| `role` | TEXT | `partner1 \| partner2` |
| `email` | TEXT | Nullable for guest-created path |
| `mobile` | TEXT | |
| `email_verified_at` | INTEGER | Unix seconds, nullable |
| `mobile_verified_at` | INTEGER | Unix seconds, nullable |
| `nric_encrypted` | TEXT | AES-256 encrypted; key = `NRIC_ENCRYPTION_KEY` |
| `nric_consented_at` | INTEGER | |
| `iras_donor_share_pct` | INTEGER | Default 100 |

**`charities`**

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | |
| `name` | TEXT | |
| `uen` | TEXT | Singapore UEN |
| `ipc_no` | TEXT | IPC number for IRAS tax relief |
| `paynow_uen` | TEXT | PayNow target UEN |
| `status` | TEXT | `confirmed \| pending \| paused \| withdrawn` |
| `dpo_email` | TEXT | |
| `finance_email` | TEXT | |

**`gifts`**

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | |
| `wedding_id` | TEXT FK → weddings | |
| `guest_name` | TEXT | |
| `guest_mobile` | TEXT | |
| `guest_email` | TEXT | Nullable |
| `gift_amount_cents` | INTEGER | |
| `personal_portion_cents` | INTEGER | |
| `charity_portions_json` | TEXT | JSON array of `{ charity_id, amount_cents }` |
| `state` | TEXT | State machine (see GiftState enum) |
| `payment_ref` | TEXT | HitPay reference |
| `scheduled_auto_refund_at` | INTEGER | Unix seconds; 14 days after creation by default |

**`disbursements`**

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | |
| `beneficiary_type` | TEXT | `charity \| couple` |
| `beneficiary_uen` | TEXT | PayNow target |
| `amount_cents` | INTEGER | |
| `gift_ids_json` | TEXT | JSON array |
| `status` | TEXT | `queued \| sent \| confirmed \| failed` |

**`sessions`** — HMAC-SHA256 token hashes; 30-day TTL

**`otp_codes`** — SHA256-hashed OTP tokens; purposes: `magic_link, mobile_verify, authorise_action, claim_link`

**`sanctions_checks`** — MAS sanctions list hit/miss records per entity

**`audit_log`** — append-only immutable log (no RLS write policies)

**Compliance tables (migration 0003):**

- `consent_logs` — PDPA consent events per subject (purposes: `data_collection, nric_collection, marketing, third_party_share`)
- `pfa_agreements` — Charities Act written fund-raising agreements per charity
- `fundraising_permits` — COC fundraising permit tracking
- `data_subject_requests` — PDPA DSRs with 30-day deadline tracking
- `ai_tasks` — AI operations task queue (Claude API; task types: compliance_review, invoice_draft, sanctions_refresh, breach_assessment, etc.)
- `regulatory_updates` — AI-detected regulatory changes from MAS / IRAS / COC / ACRA / PDPC

**GiftState** values: `pending_claim | pending | authorised | declined | released | auto_refunded | refunded | failed | disputed`

---

### Discounter — Supabase PostgreSQL

**`dormitories`** (uuid PK, name, address, delivery_day, is_active)

**`products`**

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `tenant` | text | `discounter \| flashcart` (added 2026-05-13) |
| `brand` | text | e.g. `GSK`, `CENTRUM`; nullable |
| `name` | text | |
| `category` | text CHECK | Full set: beverages, snacks, instant_noodles, canned_goods, rice_grains, cooking_essentials, personal_care, dairy, other, pain_relief, oral_care, denture_care, vitamins, supplements, cold_flu, skincare, digestive |
| `original_price` | numeric(10,2) | |
| `sale_price` | numeric(10,2) | |
| `discount_pct` | integer | |
| `expiry_date` | date | |
| `stock_qty` | integer | 0 = out-of-stock; only `stock_qty > 0` products appear in store |
| `is_active` | boolean | |
| `sort_order` | integer | Display sort order (nullable) |

**`users`** (extends `auth.users`; uuid PK, phone UNIQUE, full_name, dormitory_id FK, role `customer|admin`)

**`orders`**

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `tenant` | text | `discounter \| flashcart` (added 2026-05-13) |
| `user_id` | uuid FK → users | Nullable if anonymous (Flashcart path) |
| `dormitory_id` | uuid FK → dormitories | |
| `status` | text | `pending_payment \| paid \| processing \| out_for_delivery \| delivered \| cancelled` |
| `total_amount` | numeric(10,2) | Server-computed; client value is ignored |
| `payment_status` | text | `unpaid \| paid \| refunded` |
| `payment_ref` | text | `LASTNAME POSTALCODE` format for PayNow reconciliation |
| `postal_code` | text | 6 digits |
| `week_cutoff` | date | Weekly delivery batch cutoff |
| `last_name` | text | Flashcart anonymous path (added 2026-05-13) |
| `client_request_id` | uuid | Idempotency key (unique index) |

**`order_items`** (uuid PK, order_id FK, product_id FK, quantity, unit_price, product_name snapshot, brand snapshot)

**RLS summary:** dormitories public-read; products public-read (active only); users own-record only (admins see all); orders own-user (admins see all); order_items via order ownership.

---

### ESOP — Supabase PostgreSQL

**`profiles`** (uuid PK → auth.users; email, full_name, role `holder|committee|admin`, holder_id, committee_seat `major|senior|NULL`)

**`events`** — append-only, SHA-256 chained event log

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | |
| `type` | text | Event type (e.g. `valuation_added`, `window_opened`, `exercise_confirmed`) |
| `payload` | jsonb | Event payload; `holder_id` field used for RLS row-level scoping |
| `at` | timestamptz | |
| `actor_id` | uuid FK → profiles | |
| `prev_hash` | text | SHA-256 of previous event |
| `hash` | text | SHA-256 of this event (digest of `digest_input`) |

**`documents`** (uuid PK; holder_id, kind `letter_of_offer|exercise_notice|clawback_notice|plan_pdf`, status, signed_at, storage_path)

**`payments`** (uuid PK; exercise_event_id FK → events, holder_id, amount_sgd, reference UNIQUE, qr_payload, status `pending|paid|cancelled`)

**`audit_log`** (bigserial PK; at, actor_id, actor_email, action, target, ip, user_agent, metadata jsonb) — committee/admin read only; no RLS write policies (written by triggers and Edge Function service role)

**`holders_directory`** view — joined view for committee/admin listing of all holders and their ESOP status.

---

### ElitezShelf Frontage — Drizzle (schema sketch, not live)

**`leads`**

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `created_at` | timestamp | |
| `full_name` | text | |
| `work_email` | text | |
| `company` | text | |
| `role` | text | Nullable |
| `country` | text | |
| `categories` | text[] | Array of shelf categories |
| `retailers` | text[] | Array of retailer names |
| `comments` | text | |
| `utm_source / utm_medium / utm_campaign` | text | UTM attribution |
| `ip_address / user_agent` | text | |

---

### The Commons — localStorage Schema (`tc:*` keys)

All data is stored in the browser. Backend migration path documented in `the-commons/BACKEND.md`.

| Key | Row shape |
|---|---|
| `tc:events` | `{ id, slug, title, emoji, category, date, time, location, costPerPerson, depositAmount, maxGuests, milestones[], providers[], organiser, status, createdAt }` |
| `tc:rsvps` | `{ id, eventId, name, email, phone, amountPaid, status, createdAt }` |

---

## Authentication & Authorization

### Root site (index.html)

No authentication. Theme preference stored in `localStorage` key `dt-theme` (`dark` default, `light` optional).

### Admin / Intel Gate (all `admin/` and `intel/` sub-pages)

Every admin and intel HTML page across all mirrored sub-projects loads a shared drop-in script:

```
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/..."></script>
<script src="assets/js/auth-gate.js"></script>
```

**Supabase project:** `suehogmzjspagcsrqvsw.supabase.co` (shared across aevum, altru, competitor-intel, discounter-admin, elix-eor, esop-intel, events, flashcart-research, market-tracker-research, passage, pulse, site-supervisor, the-commons, xinceai)

**Flow:**
1. Page load → gate injects full-screen overlay, hides `body > *` via CSS.
2. User enters a `@elitez.asia` or `@dhc.com.sg` email.
3. `signInWithOtp()` → Supabase triggers Before-User-Created Postgres hook to validate the domain.
4. User enters the 6-digit OTP from email.
5. `verifyOtp()` creates a session persisted in `localStorage`.
6. Overlay removed; `window._sbReady` Promise resolves with the Supabase client instance.

**Known limitation:** The gate controls the UI; data baked into the static HTML is still readable via page source. Moving sensitive data to RLS-gated Supabase tables is a planned follow-up.

### Altru (CF Workers)

- **Couple sessions:** Custom HMAC-SHA256 token cookies; 30-day TTL. Token hash stored in D1 `sessions` table. `getCoupleFromSession()` in `services/auth.ts` validates on each request.
- **Magic links:** 15-minute OTP token, SHA256-hashed in `otp_codes` table, single-use (`consumed_at`).
- **Mobile OTP:** 6-digit SMS via Twilio; step-up required for gifts > S$500 (`LARGE_GIFT_THRESHOLD_CENTS`).
- **Admin routes:** Cloudflare Access protects `/api/admin/*` at the edge — no application-level auth needed.
- **HitPay webhook:** HMAC-SHA256 `X-HitPay-Signature` header validated before processing.

### Discounter (Next.js)

- **Customer auth:** Supabase phone OTP via Twilio Verify. Phone-upsert pattern in `/api/orders/create` — no explicit sign-in flow; user identity tied to phone number.
- **Admin routes:** Supabase session cookie; `role = 'admin'` checked via RLS policy `exists (select 1 from users where id = auth.uid() and role = 'admin')`.
- **Service-role operations:** `createAdminClient()` uses `SUPABASE_SERVICE_ROLE_KEY` — used only in server-side API routes.

### ESOP (Supabase)

- **User auth:** Supabase magic-link email. Allowed domains enforced by a Before-User-Created Postgres hook.
- **Role hierarchy:** `holder < committee < admin`. `profile_role()` stable function used in all RLS policies (avoids recursion with `current_role` reserved keyword).
- **Edge Functions:**
  - `admin-invite`: Verifies caller JWT; requires `profiles.role = 'admin'`; uses service-role key to create user.
  - `verify-chain`: Requires `VERIFY_CHAIN_SECRET` Bearer token (no user auth); invoked by Supabase cron via `net.http_post()`.
- **Event log integrity:** SHA-256 chain on `events` table; nightly verification via `verify_chain()` Postgres RPC + `verify-chain` Edge Function.

---

## Configuration & Environment Variables

### Altru (wrangler secrets — `wrangler secret put <KEY>`)

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | Transactional email delivery via Resend |
| `HITPAY_API_KEY` | HitPay payment initiation |
| `HITPAY_WEBHOOK_SECRET` | HMAC validation for incoming HitPay webhooks |
| `NRIC_ENCRYPTION_KEY` | AES-256 key for NRIC field encryption (`openssl rand -base64 32`) |
| `SESSION_HMAC_SECRET` | HMAC key for session token signing (`openssl rand -hex 32`) |
| `TWILIO_ACCOUNT_SID` | Twilio SMS account identifier |
| `TWILIO_AUTH_TOKEN` | Twilio SMS auth token |
| `TWILIO_FROM_NUMBER` | E.164 sender number (e.g. `+6581234567`) |
| `CLAUDE_API_KEY` | Anthropic API key for AI compliance cron agents |
| `SANCTIONS_LIST_URL` | MAS designated-persons list endpoint URL |
| `OPERATOR_NOTIFY_EMAIL` | Destination for compliance alerts and AI task reviews |
| `SENTRY_DSN` | Sentry error capture DSN (optional) |

**Public vars in `wrangler.jsonc`** (non-sensitive):

| Variable | Value / Purpose |
|---|---|
| `ENV` | `dev \| staging \| prod` |
| `PUBLIC_BASE_URL` | `https://altru.asia` |
| `LARGE_GIFT_THRESHOLD_CENTS` | `50000` (S$500) — step-up OTP trigger |
| `AUTO_REFUND_WINDOW_DAYS` | `14` — escrow window |
| `PLATFORM_FEE_BPS` | `500` (5%) — charity platform fee |
| `DPO_EMAIL` | `dpo@altru.asia` |
| `PSA_LICENCE_STATUS` | `pending_legal_opinion \| exempt \| spi_licensed` |
| `AI_OPS_ENABLED` | `false` — gates Claude API calls in crons |

### Discounter (Next.js `.env.local`)

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (browser-safe) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (browser-safe; RLS-protected) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key for server-side admin operations |
| `PAYNOW_MOBILE` | PayNow recipient mobile number; defaults to hardcoded fallback |

### ESOP (Supabase Edge Function secrets — `supabase secrets set`)

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role for user creation and audit writes |
| `SUPABASE_ANON_KEY` | Anon key for caller JWT validation |
| `ESOP_SITE_URL` | Production site URL for magic-link redirect |
| `VERIFY_CHAIN_SECRET` | Shared secret protecting the `verify-chain` endpoint |

### Shared Admin Auth Gate

The `auth-gate.js` script has the Supabase URL and anon key **hardcoded** (not environment variables). This is intentional: the anon key is RLS-safe (role=anon, no elevated privileges). The Supabase project ID is `suehogmzjspagcsrqvsw`. Actual values are gitleaks-allowlisted in `.gitleaksignore`.

---

## Build, Run & Deployment

### Root site (derrickteo.com)

**Deploy:** Push to `main` branch → Cloudflare's GitHub integration auto-builds and deploys the `dt-public` Static-Assets Worker. No build step on this end. Changes are live within ~30 seconds. **Gotcha:** the auto-build requires `wrangler.jsonc` at the repo root; if that file is missing or malformed the build fails silently and the Worker keeps serving the last successful bundle. Cache purges do not help in that scenario — the Worker serves bundled assets, not cached HTML. Fix is to restore `wrangler.jsonc` and run `wrangler deploy` locally.

**Domain:** `CNAME` file set to `derrickteo.com`. DNS managed at Cloudflare; the zone has a Worker route attached to derrickteo.com, so the orange cloud is effectively on for the root site.

### Weekly sync

```bash
# From dt-public/ root
./sync-wip.sh          # clones 22 upstream repos, strips private files,
                       # injects noindex meta, rewrites CDN SRI hashes
git status             # review changes
git add -A && git commit -m "weekly WIP sync" && git push
```

Repos synced (source → subfolder):

| Source repo | Local folder |
|---|---|
| `Elitez_MRI` | `aevum/` |
| `discounter` | `discounter/` |
| `Passage` | `passage/` |
| `elitez-security` | `elitez-security/` |
| `elitezai-website` | `elitezai/` |
| `elix-eor` | `elix-eor/` |
| `ElixCraft` | `elixcraft/` |
| `the-commons` | `the-commons/` |
| `vectorsky` | `vectorsky/` |
| `XinceAI` | `xinceai/` |
| `altru` | `altru/` |
| `elitez-pulse` | `pulse/` |
| `competitor-intel-template` | `competitor-intel/` |
| `Elitez-ESOP` | `esop/` |
| `dt-site-creator` | `dt-site-creator/` |
| `elitezshelf-frontage` | `elitezshelf-frontage/` |
| `elitez-site-supervisor` | `site-supervisor/` |
| `Elitez-Events` | `events/` |
| `ELIX-resume` | `elix-resume/` |
| `Lumana` | `lumana/` |
| `market-tracker-research` | `market-tracker-research/` |
| `flashcart-research` | `flashcart-research/` |

### Altru (live app — not deployed from this repo)

```bash
cd altru/
wrangler dev                    # local development
wrangler d1 migrations apply altru --local
wrangler deploy                 # deploy Worker to Cloudflare
wrangler d1 migrations apply altru --remote
```

Production is deployed from the upstream `derrick-pixel/altru` repo, not from this mirror.

### Discounter (live app — not deployed from this repo)

```bash
cd discounter/
npm run dev           # Next.js dev server
npm run build         # Next.js production build
npm run test          # Vitest unit tests
```

Production is deployed from the upstream `derrick-pixel/discounter` repo. Supabase schema managed via `supabase/` migrations.

### ESOP (live app — deployed via Cloudflare Pages)

Static HTML; Cloudflare Pages auto-deploys on push to the upstream `derrick-pixel/Elitez-ESOP` repo. Security headers in `esop/_headers`. Supabase Edge Functions deployed with `supabase functions deploy`.

### ElitezShelf Frontage (static export)

```bash
cd elitezshelf-frontage/
pnpm dev              # Next.js dev
pnpm build            # Generates static export (output: "export")
```

`basePath` is set to `/elitezshelf-frontage` in production for GitHub Pages sub-path hosting.

---

## Notable Implementation Details / Gotchas

### 1. Source-canonical rule (critical)
Files in this repo's mirrored subfolders are **overwritten** on every `sync-wip.sh` run. **Never edit mirrored files directly in dt-public.** Only `index.html`, `CNAME`, `robots.txt`, `sitemap.xml`, `sync-wip.sh`, `wip/`, and root assets are dt-public-native. Violation caused divergent URLs in April 2026 Week 4 (see `dt-site-creator/methodology/proposals/2026-04-29-fleet-seo-fix-week4.md`).

### 2. noindex injection
`sync-wip.sh` uses `perl -i` to inject `<meta name="robots" content="noindex, nofollow">` before `</head>` in every mirrored HTML file. This prevents search engines indexing preview snapshots as duplicate content of the live production sites.

### 3. SRI hash rewriting
`sync-wip.sh` rewrites bare CDN `<script src>` tags for chart.js, marked, DOMPurify, qrcode, jsPDF, and html2canvas with pinned versions and `integrity` + `crossorigin` attributes. If a CDN URL is updated in source but the hash list in `sync-wip.sh` is stale, the script will be left un-hashed (silently, not as an error) — regenerate hashes with `curl -sL <URL> | openssl dgst -sha384 -binary | openssl base64 -A`.

### 4. Auth gate + static data limitation
`auth-gate.js` hides the rendered DOM but does **not** protect data baked into HTML source. Treat the gate as access-control for the UI, not data confidentiality. Moving intel data into RLS-gated Supabase queries is a planned follow-up per the comment in `sync-wip.sh`.

### 5. Altru: LARGE_GIFT_THRESHOLD_CENTS step-up
Any gift authorisation batch containing a gift ≥ S$500 triggers a second SMS OTP (`authorise_action` purpose). This is a MAS AML control and must not be removed without legal review. The threshold is configurable via the `LARGE_GIFT_THRESHOLD_CENTS` environment variable (set in `wrangler.jsonc` vars, not a secret).

### 6. Altru: PSA licensing status
`PSA_LICENCE_STATUS` in `wrangler.jsonc` is currently `pending_legal_opinion`. The platform should not go live in production for real monetary transactions until this is resolved. The value surfaces on the `/api/compliance/status` public endpoint.

### 7. Discounter: server-side price enforcement
The `/api/orders/create` route **ignores the client-sent `totalAmount` and `unitPrice`**. It re-fetches prices from Supabase and recomputes the total server-side. This prevents price manipulation attacks. A race-condition guard using `decrement_stock` RPC handles concurrent stock depletion (cancels the order if stock is gone between validation and decrement).

### 8. Discounter / Flashcart multi-tenant
The Supabase project is shared between `discounter` (FMCG dorm clearance) and `flashcart` (corporate-event flash sales) via a `tenant` column added in migration `2026-05-13-flashcart-unification.sql`. The `TENANT` constant in `src/lib/tenant.ts` is hardcoded to `'discounter'` in this repo. All queries must include `.eq('tenant', TENANT)`.

### 9. ESOP: `profile_role()` vs `current_role`
The helper function is named `profile_role()`, not `current_role`. `current_role` is a reserved Postgres keyword that returns the connection role (e.g. `authenticator`), not the application role. Using `current_role` in RLS policies would silently grant or deny access to all rows.

### 10. ESOP: event-chain integrity
The `events` table is an append-only SHA-256 hash chain. Every event stores `prev_hash` and `hash`. The `verify_chain()` Postgres RPC walks all events in `seq` order and re-computes hashes from `digest_input`. A nightly Supabase cron calls the `verify-chain` Edge Function, which logs the result to `audit_log`. A `chain_broken` alert in `audit_log` indicates tampering or a migration error.

### 11. Mobile menu z-index convention
All mobile menus across mirrored sites use `z-index: 199` (nav is at 200). A `position: fixed` menu without an explicit z-index will be invisible because the nav covers it.

### 12. lumana/admin gate uses a different Supabase project
`lumana/admin/assets/js/gate.js` connects to a **different** Supabase project than the shared `suehogmzjspagcsrqvsw` project used by all other admin gates. The `.gitleaksignore` allowlists this separately. Do not copy the gate from another project without updating the URL and anon key.

### 13. robots.txt vs sub-project robots
The root `robots.txt` disallows crawling of all mirrored subfolders. Individual sub-projects (e.g. `xinceai/robots.txt`) may have their own rules that apply when the sub-project is served from its own domain (e.g. `xinceai.elitez.com.sg`), but those are irrelevant on `derrickteo.com` where the root `robots.txt` takes precedence.

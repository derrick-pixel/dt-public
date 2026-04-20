# Discounter SG

Grocery e-commerce app offering up to 80% off FMCG products with weekly delivery to foreign worker dormitories in Singapore. Customers browse near-expiry discounted groceries, order via cart, and pay through PayNow QR.

## Tech Stack

- **Framework:** Next.js 16 + React 19 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4 + ShadCN/UI
- **Database:** Supabase (Postgres + Auth)
- **State:** Zustand (persisted cart)
- **Payments:** PayNow QR (EMVCo spec)

## Features

- **Product catalog** with category filtering, discount badges, and expiry urgency indicators
- **Shopping cart** (persisted in localStorage via Zustand) with stock-aware quantity controls
- **Checkout** with PayNow QR code generation for instant mobile payment
- **Order tracking** with status updates (pending → paid → processing → delivered)
- **Weekly cutoff system** — orders batch every Sunday 23:59 SGT for next-week delivery
- **Admin panel** — manage products, view/fulfill orders, track deliveries, seed demo data
- **Customer accounts** — phone-based auth, order history

## Getting Started

```bash
# Install dependencies
npm install

# Set environment variables (see below)
cp .env.local.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (admin operations) |

## Project Structure

```
src/
├── app/
│   ├── (store)/          # Customer-facing pages
│   │   ├── page.tsx      # Product catalog (homepage)
│   │   ├── cart/         # Shopping cart
│   │   ├── checkout/     # Checkout + PayNow QR
│   │   └── account/      # Order history
│   ├── admin/            # Admin panel
│   │   ├── products/     # Product CRUD
│   │   ├── orders/       # Order management
│   │   └── delivery/     # Delivery tracking
│   └── api/
│       ├── orders/       # Order creation + status API
│       └── admin/        # Seed products endpoint
├── components/
│   ├── ui/               # ShadCN/UI primitives
│   ├── products/         # ProductCard, CategoryFilter
│   └── layout/           # Navbar, CutoffBanner
└── lib/
    ├── store/cart.ts     # Zustand cart store
    ├── supabase/         # Supabase client (browser, server, admin)
    ├── utils/order.ts    # Cutoff dates, formatting, expiry logic
    ├── utils/paynow.ts   # PayNow QR string builder (EMVCo)
    └── types.ts          # TypeScript interfaces
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

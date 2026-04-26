# FlashCart (by Elitez) — Design Spec

**Date:** 2026-04-21
**Status:** Approved
**Origin:** Stripped-down clone of Discounter SG for in-person PayNow transactions.

## 1. Product summary

FlashCart is an in-person PayNow transactional tool used by Elitez sales reps. The rep shows the phone/tablet to a customer, the customer picks items from a 22-SKU CENTRUM/CALTRATE catalogue, taps "Pay", and the app displays a PayNow QR plus a screenshot-friendly receipt showing every line item, qty, slashed/sale prices, and the PayNow reference. No delivery, no customer accounts, no order history, no admin panel.

**Not in scope:** delivery logistics, weekly cutoffs, dormitory selection, customer sign-in, order fulfillment tracking, inventory management UI, admin dashboards.

## 2. Architecture & separation

- **New repo:** `flashcart` under `derrick-pixel`. Scaffolded by copying the Discounter Next.js app, then stripped.
- **New Vercel project:** `flashcart` on the Hobby team. Auto-deploys from `main`. URL: `https://flashcart.vercel.app` (or `flashcart-elitez` if taken).
- **New Supabase project:** `flashcart` (free tier). Holds a single `products` table. Public-read RLS, no writes from the app.
- **No runtime coupling** with Discounter — separate DB, separate env vars, separate deploy. Code starts as a copy of Discounter and drifts independently.
- **Existing GitHub Pages site** (`derrick-pixel.github.io/discounter/`) is untouched.

**Tech stack (inherited from Discounter):**
- Next.js 16 + React 19 (App Router)
- TypeScript
- Tailwind CSS 4 + ShadCN/UI (Base UI React primitives)
- Supabase (public-read only)
- Zustand (persisted cart)
- `qrcode` for PayNow QR generation
- vitest for unit tests

## 3. Data model

Single Supabase table.

```sql
create table products (
  id           uuid primary key default gen_random_uuid(),
  brand        text not null check (brand in ('CENTRUM','CALTRATE')),
  name         text not null,
  image_url    text,
  original_price numeric(10,2) not null,  -- column F, shown slashed
  sale_price     numeric(10,2) not null,  -- column G, charged price
  discount_pct   integer not null,        -- column H rounded (for badge)
  stock_qty      integer not null default 1000,
  is_active      boolean not null default true,
  sort_order     integer not null,        -- CENTRUM first, then CALTRATE, sheet order
  created_at     timestamptz not null default now()
);

alter table products enable row level security;
create policy "public read" on products for select using (is_active = true);
```

**Seed migration** (`supabase/migrations/2026-04-21-flashcart-seed.sql`): 22 rows pulled directly from `new project, Jack/Product for Elitez ...xlsx`. Pricing exact to the cent from columns F, G; discount_pct = `round(H * 100)`.

Full SKU list (sheet order, brand + name + original / sale / discount):

| # | Brand | Name | RSP | Promo | % |
|---|---|---|---|---|---|
| 1 | CENTRUM | Centrum Advance 60's | 38.95 | 19.48 | 50 |
| 2 | CENTRUM | Centrum Silver Advance 60's | 44.50 | 22.25 | 50 |
| 3 | CENTRUM | Centrum Advance 100's | 59.50 | 40.10 | 33 |
| 4 | CENTRUM | Centrum Men 60s | 45.50 | 31.60 | 31 |
| 5 | CENTRUM | Centrum Women 60s | 45.50 | 31.60 | 31 |
| 6 | CENTRUM | Centrum Men 100s | 68.50 | 47.55 | 31 |
| 7 | CENTRUM | Centrum Women 100s | 68.50 | 47.55 | 31 |
| 8 | CENTRUM | Centrum Silver Advance 100's | 67.95 | 45.85 | 33 |
| 9 | CENTRUM | Centrum 50+ Men 60s | 49.95 | 33.00 | 34 |
| 10 | CENTRUM | Centrum 50+ Women 60s | 49.95 | 33.00 | 34 |
| 11 | CENTRUM | Centrum 50+ Men 100s | 76.50 | 50.55 | 34 |
| 12 | CENTRUM | Centrum 50+ Women 100s | 76.50 | 50.55 | 34 |
| 13 | CENTRUM | Centrum Kids Chews 60s (Strawberry) | 25.95 | 18.00 | 31 |
| 14 | CALTRATE | Caltrate 500IU Bone & Muscle Health (2in1) 60s | 33.95 | 23.50 | 31 |
| 15 | CALTRATE | Caltrate 500IU Bone & Muscle Health (2in1) 100s | 51.50 | 36.30 | 30 |
| 16 | CALTRATE | Caltrate 500IU Bone & Muscle Health Plus (3in1) 60s | 37.95 | 26.35 | 31 |
| 17 | CALTRATE | Caltrate 500IU Bone & Muscle Health Plus (3in1) 100s | 57.95 | 40.20 | 31 |
| 18 | CALTRATE | Caltrate 600+D 1000IU Bone & Muscle Health 60s | 43.50 | 30.20 | 31 |
| 19 | CALTRATE | Caltrate Joint Health Ucii 30s | 50.50 | 35.05 | 31 |
| 20 | CALTRATE | Caltrate Joint Health Ucii 90s | 136.50 | 94.75 | 31 |
| 21 | CALTRATE | Caltrate 1000IU Bone & Muscle Vitamin D 60s | 21.50 | 14.95 | 30 |
| 22 | CALTRATE | Caltrate Joint Speed Hops Uc-ii Collagen 42s | 67.95 | 42.85 | 37 |

**Images** — 22 PNGs are embedded in the xlsx (`xl/media/image1.png` … `image22.png`, 250×240 RGBA). Extracted and mapped 1:1 to sheet order, committed to `public/products/` with kebab-case filenames derived from the product name (lowercase, spaces → `-`, strip apostrophes and parens, collapse duplicate dashes). Examples:

- `centrum-advance-60s.png`
- `centrum-silver-advance-100s.png`
- `centrum-kids-chews-60s-strawberry.png`
- `caltrate-500iu-bone-muscle-health-2in1-60s.png`
- `caltrate-joint-speed-hops-uc-ii-collagen-42s.png`

`image_url` in the DB stores the relative URL path (e.g. `/products/centrum-advance-60s.png`).

## 4. App structure

```
flashcart/
├── public/
│   └── products/              # 22 PNGs
├── src/
│   ├── app/
│   │   ├── layout.tsx         # root layout, FlashCart navbar
│   │   ├── globals.css        # copied from Discounter
│   │   ├── page.tsx           # catalogue
│   │   ├── cart/page.tsx      # cart + last-name input + pay button
│   │   └── pay/page.tsx       # PayNow QR + receipt snapshot
│   ├── components/
│   │   ├── ui/                # ShadCN primitives (button, card, input, label, separator)
│   │   ├── products/
│   │   │   ├── ProductCard.tsx
│   │   │   └── BrandFilter.tsx
│   │   └── layout/
│   │       └── Navbar.tsx     # "⚡ FlashCart" + "by Elitez" + cart count
│   └── lib/
│       ├── store/cart.ts      # Zustand, persisted, simplified (no dormitory, no week cutoff)
│       ├── supabase/client.ts # browser client only
│       ├── utils/paynow.ts    # EMVCo QR builder (ported from Discounter)
│       ├── utils/reference.ts # NEW — buildPaynowReference
│       ├── utils/format.ts    # formatSGD
│       └── types.ts           # Product, CartItem
├── supabase/
│   └── migrations/
│       └── 2026-04-21-flashcart-seed.sql
├── package.json
├── next.config.ts
├── tailwind.config (via postcss)
├── tsconfig.json
├── vitest.config.ts
└── .env.local.example
```

**No** `/admin`, `/account`, `/api`, `/checkout`, `/out-of-stock`, or any server-side route. All interaction is client-only.

## 5. Flow

### 5.1 Catalogue (`/`)
- Red hero banner: "⚡ Flash Sale — Today Only" + subtitle "Up to 50% off vitamins".
- Search input (name contains).
- Brand filter chips: `All` (default) | `CENTRUM` | `CALTRATE`.
- 2-column mobile grid of `ProductCard`:
  - Image (square, object-cover).
  - Red discount badge top-right (e.g. `−50%`).
  - Name (line-clamp 2).
  - Slashed `original_price` (strike-through, gray) + `sale_price` (bold red).
  - `+` button to add to cart; if already in cart, shows `− qty +` stepper.
- Loading skeleton grid while products fetch.
- Empty-filter state: friendly message.

### 5.2 Cart (`/cart`)
- Back arrow + "Your Cart" title.
- List of items with qty stepper and trash button. Each row shows thumbnail, name, sale price, line total.
- Subtotal card.
- **Last Name input** (only field). Label: "Last name (for PayNow reference)". Placeholder: "e.g. Tan". Bound to `cart.lastName` in the store (persists across refresh).
- Primary button: "Pay S$121.05" (disabled until lastName non-empty and cart non-empty).
- On tap: navigate to `/pay`. Cart state (items + lastName) lives entirely in the Zustand store; no query params, no server round-trip.
- Empty-cart state: "Your cart is empty" + Browse button.

### 5.3 PayNow page (`/pay`)
Laid out as a single scrollable column. Top section is the action (scan to pay). Bottom section is the receipt (screenshot target).

**Action section:**
- "Pay with PayNow" heading.
- QR code, 256×256, generated client-side from the PayNow EMVCo string using the existing `paynow.ts` builder + `qrcode` lib.
- Amount card (red): large bold `S$121.05`, subtitle `PayNow to +65 8363 8499`.
- Reference card (yellow): monospace `TAN 05 12105` with a copy button. Warning: "Enter exactly in the Remarks field".
- Manual instructions (numbered list: open banking app → scan or transfer → enter amount → enter reference → complete).

**Receipt section (below a horizontal divider labelled "Receipt"):**
- Card with visible border, designed to stand alone in a screenshot.
- Header row: `FlashCart` (bold) · timestamp `21 Apr 2026, 2:35 PM`.
- Ref row: `Ref: TAN 05 12105`.
- Line items: each with a 48×48 thumbnail and name (line-clamp 1). Pricing row shows `S$38.95` (strike-through) then `→ S$19.48 × 2 = S$38.96`.
- Separator.
- Subtotal row + bold Total row.
- Footer: `Paid via PayNow to +65 8363 8499` · `Powered by Elitez`.

**Below the receipt** (visually outside the card, so a tight screenshot excludes it):
- "Back to shop" button. On tap, clears cart and navigates to `/`.

Direct URL (e.g. refresh): if the cart is empty on `/pay`, redirect to `/`.

## 6. PayNow reference format

```ts
function buildPaynowReference(lastName: string, cartSize: number, total: number): string {
  const name = lastName.trim().split(/\s+/)[0].toUpperCase().replace(/[^A-Z]/g, '')
  const size = String(Math.min(cartSize, 99)).padStart(2, '0')
  const cents = Math.round(total * 100)
  const amount = String(Math.min(cents, 99999)).padStart(5, '0')
  return `${name} ${size} ${amount}`
}
```

Examples:
- `("Tan", 5, 121.05)` → `"TAN 05 12105"`
- `("Ravi Kumar", 1, 19.48)` → `"RAVI 01 01948"`
- `("O'Brien", 3, 48.99)` → `"OBRIEN 03 04899"`

**Caps:** cart size > 99 truncates to `99`; total ≥ $1000 truncates the dollar field to `99999`. Totals above $999.99 are unlikely for this catalogue — flagged and documented, not enforced in UI.

## 7. Cart store (Zustand, persisted)

```ts
type CartState = {
  items: { product: Product; quantity: number }[]
  lastName: string
  add: (p: Product) => void
  remove: (id: string) => void
  setQty: (id: string, qty: number) => void
  setLastName: (name: string) => void
  clear: () => void  // clears items AND lastName
  total: () => number
  size: () => number  // sum of quantities, for reference-code cart size field
}
```

Persisted to `localStorage` under key `flashcart-cart`. No dormitory, no week cutoff, no server sync.

## 8. Env vars

Only two needed (no service-role key, no admin operations):

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | FlashCart Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable key (`sb_publishable_*`) |

Set in Vercel project settings + local `.env.local`.

## 9. Testing

**Unit tests (vitest):**
- `reference.test.ts` — normal case, long name, apostrophe name, cart size cap, amount cap.
- `paynow.test.ts` — ported from Discounter, verifies EMVCo string builder with FlashCart's PayNow number.
- `cart.test.ts` — add, remove, update qty, clear, total, size.

**Manual smoke test checklist (post-deploy):**
1. Open the deployed URL on a mobile browser.
2. Catalogue renders with 22 SKUs; all images load; prices match the xlsx.
3. Brand filter toggles (All / CENTRUM / CALTRATE).
4. Search narrows by name.
5. Add 3 different items (mixed brands); cart count in navbar updates.
6. Navigate to `/cart`; qty steppers work; trash removes; subtotal correct.
7. Type last name; tap Pay; arrive at `/pay`.
8. QR scans with a Singapore banking app (DBS PayLah or similar); amount field in the app equals the on-screen total; reference field is editable (we don't lock it server-side).
9. Scroll down; take a screenshot of the receipt card; verify thumbnails, line totals, and the "Powered by Elitez" footer are all inside.
10. Back to shop clears the cart.

## 10. Deployment

1. Create empty GitHub repo `flashcart` under `derrick-pixel`.
2. Create Supabase project `flashcart`, run the seed migration in SQL Editor.
3. Create Vercel project `flashcart`, link the GitHub repo, set env vars, deploy.
4. Verify smoke test on the Vercel URL.
5. No custom domain for now (can be added later).

## 11. Out of scope / follow-ups

- Real-time stock decrement (currently `stock_qty` is advisory; we don't persist orders so we can't decrement).
- Custom domain.
- Multiple sales rep accounts / attribution.
- Historical sales ledger (was an explicit choice — not needed for this tool).
- Receipt PDF export.
- Undo cart clear after successful payment.

# GSK Catalogue Swap — Design Spec

**Date:** 2026-04-10
**Scope:** Swap the starter 30 grocery SKUs for the first 5 pages (42 SKUs) of the
`GSK - Products Catalogue 2026.pdf` supplied by Chuan Seng Leong PTE LTD, add a
hidden Out-of-Stock page showing the legacy SKUs, and apply a 10% discount off
the per-unit RSP on each new SKU.

## Decisions (confirmed with user)

- **Descriptions:** I write short clean consumer-facing blurbs — not verbatim PDF text.
- **Categories:** Expand the Postgres category check constraint with new pharma categories.
- **DB state:** Supabase is already seeded with the legacy 30 SKUs — a migration SQL is required.
- **OOS page:** Hidden route only at `/out-of-stock`, no nav link.
- **Stock qty:** 1000 per new SKU.
- **Scope:** Pages 1–5 only (42 SKUs, brands Panadol / Panaflex / Voltaren / Aquafresh / Parodontax / Polident).

## Pricing rule

For every new SKU:

```
original_price = RSP                   (the "9% GST RSP" column from the PDF)
sale_price     = round(RSP * 0.90, 2)
discount_pct   = 10
```

RSP is already the per-unit / per-EA retail price — no conversion from Price/Box.

## Category mapping

Existing enum keeps its food categories (legacy SKUs need to stay queryable for the
OOS page). New pharma values added:

| New value      | Brands mapped                                   |
|----------------|-------------------------------------------------|
| `pain_relief`  | Panadol (all), Panaflex, Voltaren               |
| `oral_care`    | Aquafresh, Parodontax                           |
| `denture_care` | Polident                                        |

(Later pages will need `vitamins`, `supplements`, `cold_flu`, `skincare`,
`digestive` — out of scope for this spec.)

## Product data (42 SKUs, pages 1–5)

CSL stock code → product. Name is cleaned, description is hand-written, category
is mapped above, `original_price` is RSP from the PDF, `sale_price` is RSP × 0.9.
Stock qty = 1000 for every SKU. Expiry date = `2027-12-31` (placeholder — PDF has
no expiry info).

### Panadol (15) — pain_relief

1. `71010362` Panadol Optizorb 500mg (20s) — $7.95 → $7.16
2. `71010430` Panadol Extra Optizorb 500mg (20s) — $9.95 → $8.96
3. `71080447` Panadol Extra Optizorb 500mg (120s) — $55.75 → $50.18
4. `71011284` Panadol Extra Optizorb 500mg (30s) — $13.25 → $11.93
5. `71010515` Panadol Actifast 500mg (20s) — $11.75 → $10.58
6. `71010608` Panadol Extend 665mg (18s) — $9.95 → $8.96
7. `71012013` Panadol Menstrual 500mg (20s) — $9.95 → $8.96
8. `71010110` Panadol Cold & Flu Hot Remedy 500mg (5s) — $8.75 → $7.88
9. `71010294` Panadol Cold & Flu Cold Relief 500mg (12s) — $11.95 → $10.76
10. `71001414` Panadol Cold & Flu Cough & Cold (16s) — $14.45 → $13.01
11. `71010899` Panadol Cold & Flu Sinus Max 500mg (12s) — $11.95 → $10.76
12. `71010561` Panadol MiniCaps 500mg (12s) — $8.75 → $7.88
13. `71019302` Panadol Kid Suspension 120mg/5ml Strawberry (60ml) — $9.75 → $8.78
14. `71010691` Panadol Kids Suspension 1–12 yrs (60ml) — $10.75 → $9.68
15. `71010315` Panadol Kid Chewable 120mg Cherry (24s) — $8.75 → $7.88

### Panaflex (3) — pain_relief

16. `71011025` Panadol Panaflex Hydro Heat Patch (2s) — $4.05 → $3.65
17. `71011056` Panadol Panaflex Heat Gel Patch (4s) — $7.30 → $6.57
18. `71014536` Panadol Panaflex Hot Patch (5s) — $6.60 → $5.94

### Voltaren (1) — pain_relief

19. `71021784` Voltaren Emulgel 2% (50g) — $25.15 → $22.64

### Aquafresh (10) — oral_care

20. `72016713` Aquafresh Kids Toothpaste Little Teeth 3–5 yrs (50ml) — $7.60 → $6.84
21. `72016720` Aquafresh Kids Toothpaste Big Teeth 6+ yrs (50ml) — $7.60 → $6.84
22. `72018810` Aquafresh Kids Toothpaste Little Teeth 3–5 yrs Value Pack (2×50ml) — $12.35 → $11.12
23. `72018827` Aquafresh Kids Toothpaste Big Teeth 6+ yrs Value Pack (2×50ml) — $12.35 → $11.12
24. `72010929` Aquafresh Kids Toothbrush Milk Teeth 0–2 yrs — $6.45 → $5.81
25. `72011759` Aquafresh Kids Toothbrush Little Teeth 3–5 yrs — $6.45 → $5.81
26. `72011480` Aquafresh Toothbrush Clean & Control Soft (3-pack) — $5.85 → $5.27
27. `72011473` Aquafresh Toothbrush Clean & Control Medium (3-pack) — $5.85 → $5.27
28. `72010142` Aquafresh Toothbrush Clean & Flex Soft (3-pack) — $5.85 → $5.27
29. `72010159` Aquafresh Toothbrush Clean & Flex Medium (3-pack) — $5.85 → $5.27

### Parodontax (3) — oral_care

30. `72028506` Parodontax Daily Fluoride Toothpaste (90g) — $9.65 → $8.69
31. `72023423` Parodontax Daily Whitening Toothpaste (90g) — $9.20 → $8.28
32. `72023447` Parodontax Herbal Toothpaste (90g) — $9.65 → $8.69

### Polident (10) — denture_care

33. `72065160` Polident 3-Minute Daily Cleanser Tablets (36s) — $9.10 → $8.19
34. `72061107` Polident Daily Cleanser Whitening Tablets (36s) — $9.85 → $8.87
35. `72034758` Polident Pro Retainer Daily Cleanser Tablets (36s) — $10.50 → $9.45
36. `72038292` Polident 3-Minute Daily Cleanser Tablets Twin Pack (2×36s) — $13.85 → $12.47
37. `72038285` Polident Daily Cleanser Whitening Tablets Twin Pack (2×36s) — $14.95 → $13.46
38. `72035922` Polident 3-Minute Daily Cleanser Tablets Value Pack (16s+2s) — $5.00 → $4.50
39. `72035382` Polident Denture Adhesive Cream Fresh Mint (60g) — $14.00 → $12.60
40. `72039381` Polident Denture Adhesive Cream Flavour Free (60g) — $14.00 → $12.60
41. `72037841` Polident Max Hold & Seal Adhesive (40g) — $11.90 → $10.71
42. `72037827` Polident Max Hold & Seal Adhesive (70g) — $18.90 → $17.01

## Architecture changes

### Files touched

1. `supabase/schema.sql` — category check constraint expanded.
2. `supabase/seed.sql` — rewritten with legacy SKUs (stock_qty=0) + 42 new SKUs.
3. **New** `supabase/migrations/2026-04-10-gsk-catalogue.sql` — alter constraint, zero legacy stock, insert new SKUs. Idempotent via `on conflict` guard on a name uniqueness check.
4. `src/app/api/admin/seed-products/route.ts` — mirrored seed list.
5. `src/lib/types.ts` — expand `Category` union.
6. `src/components/products/CategoryFilter.tsx` — render new category chips.
7. **New** `src/app/(store)/out-of-stock/page.tsx` — queries `is_active=true AND stock_qty=0`, renders grid using `ProductCard` (which already has SOLD OUT overlay + disabled add-to-cart).
8. **New** `public/products/<stock_code>.png` × 42 — extracted product images.

### Image extraction

`pdftocairo` → render each PDF page as a high-DPI PNG → Python/PIL crop the
image column (constant x-range, per-row y-range computed by dividing the table
body into N equal rows per page). Output files named by CSL stock code so the
seed data can reference `/products/<code>.png`.

Fallback: if cropping quality is poor, use `pdfimages -j` and match by
extraction order within each page (PDF usually stores images in reading order).

### DB migration idempotency

The migration:

```sql
-- 1. alter check constraint
alter table products drop constraint products_category_check;
alter table products add constraint products_category_check check (category in (
  'beverages','snacks','instant_noodles','canned_goods','rice_grains',
  'cooking_essentials','personal_care','dairy','other',
  'pain_relief','oral_care','denture_care'
));

-- 2. take legacy SKUs OOS (but keep queryable for /out-of-stock page)
update products set stock_qty = 0 where created_at < '2026-04-10';

-- 3. insert new SKUs (skip if already present by name)
insert into products (...) values (...) on conflict do nothing;
```

(`products.name` doesn't have a unique constraint today — we'll add a conditional
`where not exists (select 1 from products where name = ...)` guard to keep it
idempotent without a schema change.)

### OOS page

`src/app/(store)/out-of-stock/page.tsx`:

- Server-side or client-side fetch: `is_active=true AND stock_qty=0`.
- Reuse `<ProductCard />` unchanged — it already shows the SOLD OUT overlay and
  the Add-to-cart button is disabled when `stock_qty === 0`.
- Header: "Out of stock — these items have sold out. Check the store for current
  deals."
- Link back to `/`.
- Not linked from nav; reachable only by direct URL.

## Testing

- Hit `/out-of-stock` → see the 30 legacy SKUs with SOLD OUT overlays.
- Hit `/` → see only the 42 new GSK SKUs.
- Category filter → new pharma chips filter correctly.
- Add-to-cart on a new SKU → cart updates.
- `npm run lint` + `npm run build` pass.
- Spot-check prices: e.g. Panadol Optizorb 500mg (20s) shows $7.16 (was $7.95).

## Out of scope

- Pages 6–16 of the PDF (remaining ~66 SKUs: Sensodyne, Scott's, Eno, Drapolene,
  Otrivin, Centrum, Caltrate, Robitussin, Imedeen). Follow-up task.
- Adding OOS link to navigation (explicitly out per user confirmation).
- Revising the homepage hero copy ("Up to 80% OFF") — the new 10% discount makes
  that copy misleading, but user hasn't asked for a copy change. Flag for follow-up.

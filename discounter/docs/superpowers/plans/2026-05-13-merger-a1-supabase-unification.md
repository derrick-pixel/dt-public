# Merger A1 — Supabase Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merge Discounter + Flashcart into ONE Supabase project (keep Discounter's, retire Flashcart's). Save $10/month and clear the runway for dt-site-creator's free OTP gate.

**Architecture:** Additive schema migration on the surviving Discounter project — `tenant` + `brand` columns, nullable `user_id`/`dormitory_id` on orders, `last_name`/`client_request_id`/snapshot columns. Re-seed Flashcart's 22 products under `tenant='flashcart'`. Both Next.js codebases stay separate; Flashcart's `.env.local` swaps to the merged Supabase URL. Frontend consolidation is deferred to Spec A2.

**Tech Stack:** Supabase (Postgres + RLS + service-role pattern). Next.js codebases on both ends. Manual user actions for Supabase dashboard work (apply migration, kill old project).

**Spec:** `discounter/docs/superpowers/specs/2026-05-13-merger-a1-supabase-unification-design.md` — full requirements.

**Repo conventions:**
- Discounter: commit + push to derrick-pixel/discounter main.
- Flashcart: commit + push to derrick-pixel/flashcart main.
- NEVER commit `.env.local` (both have it gitignored).
- Real Supabase credentials NEVER appear in commit messages or PR descriptions.

---

## File Map

**Created (in discounter repo):**
```
supabase/migrations/2026-05-13-flashcart-unification.sql   additive schema + flashcart seed
src/lib/tenant.ts                                          TENANT='discounter' constant
```

**Created (in flashcart repo):**
```
src/lib/tenant.ts                                          TENANT='flashcart' constant
```

**Modified (in discounter repo):**
```
Every Next.js page/component that queries products or orders
  → add .eq('tenant', TENANT) to filter to Discounter rows only.
```

**Modified (in flashcart repo):**
```
.env.local              (local, NOT committed)  → swap to merged Supabase URL+keys
Every page/component querying products/orders   → scope with .eq('tenant', TENANT)
Order-create code                                → set tenant='flashcart' on insert
```

**Manual user actions (NOT in code):**
- M2: Apply migration via Discounter Supabase SQL editor.
- M6: 48-hour observation window (no action — just wait).
- M7: Delete the Flashcart Supabase project via dashboard.

---

## Task M1: Write the unified migration SQL

**Files:** Create `/Users/derrickteo/codings/discounter/supabase/migrations/2026-05-13-flashcart-unification.sql`.

- [ ] **Step 1: Read the flashcart seed source** for the 22 products to transform:

```bash
cat /Users/derrickteo/codings/flashcart/supabase/migrations/2026-04-21-flashcart-seed.sql
cat /Users/derrickteo/codings/flashcart/supabase/migrations/2026-04-29-promo-40pct-3-skus.sql
```

The 22 products you'll re-insert into Discounter have columns: `brand` (CENTRUM/CALTRATE), `name`, `image_url`, `original_price`, `sale_price`, `discount_pct`, `stock_qty` (default 1000), `is_active` (default true), `sort_order` (1–22).

When transforming for Discounter's `products` table you also need:
- `tenant = 'flashcart'`
- `category = 'vitamins'` (Discounter's enum already supports it — see schema.sql)
- `expiry_date = '2099-12-31'` (placeholder; Discounter's NOT NULL constraint requires a value)

- [ ] **Step 2: Write the migration file** with this exact structure. The header section is fixed; the seed-insert block at the bottom transforms the 22 source rows per the rules above.

```sql
-- ────────────────────────────────────────────────────────────────────
-- 2026-05-13 Flashcart unification
-- Additive schema migration: enables one Supabase project to host both
-- Discounter (tenant='discounter') and Flashcart (tenant='flashcart').
-- Backward-compatible for the existing Discounter app — every change is
-- a column add or a NOT NULL relaxation. No existing data is rewritten
-- except a one-time backfill of `brand` for GSK products.
-- ────────────────────────────────────────────────────────────────────

-- ── products: add tenant + brand + sort_order ──
alter table products add column if not exists tenant text not null default 'discounter'
  check (tenant in ('discounter', 'flashcart'));
alter table products add column if not exists brand text;
alter table products add column if not exists sort_order integer;

-- Backfill: GSK pharma rows get brand='GSK'; legacy grocery rows stay brand=NULL.
update products set brand = 'GSK'
where brand is null
  and category in ('pain_relief','oral_care','denture_care','vitamins','supplements','cold_flu','skincare','digestive');

-- ── orders: relax NOT NULL + add flashcart fields ──
alter table orders alter column user_id drop not null;
alter table orders alter column dormitory_id drop not null;

alter table orders add column if not exists tenant text not null default 'discounter'
  check (tenant in ('discounter', 'flashcart'));
alter table orders add column if not exists last_name text;
alter table orders add column if not exists item_count integer;
alter table orders add column if not exists client_request_id uuid;

create unique index if not exists orders_client_request_id_key
  on orders (client_request_id) where client_request_id is not null;

-- Identity constraint: signed-in (user_id) OR anonymous (last_name) must be set.
do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'orders_identity_present'
  ) then
    alter table orders add constraint orders_identity_present
      check (user_id is not null or last_name is not null);
  end if;
end $$;

-- ── order_items: snapshot columns for tenant-agnostic order history ──
alter table order_items add column if not exists product_name text;
alter table order_items add column if not exists brand text;

-- ── Flashcart product seed (22 SKUs) ──
-- Source: flashcart/supabase/migrations/2026-04-21-flashcart-seed.sql
-- Transformed: tenant='flashcart', category='vitamins', expiry_date='2099-12-31',
--              brand and sort_order carried from source.
insert into products (tenant, brand, name, image_url, category, original_price, sale_price, discount_pct, sort_order, stock_qty, is_active, expiry_date) values
  ('flashcart','CENTRUM','Centrum Advance 60''s','/products/centrum-advance-60s.png','vitamins',38.95,19.48,50,1,1000,true,'2099-12-31'),
  ('flashcart','CENTRUM','Centrum Silver Advance 60''s','/products/centrum-silver-advance-60s.png','vitamins',44.50,22.25,50,2,1000,true,'2099-12-31'),
  ('flashcart','CENTRUM','Centrum Advance 100''s','/products/centrum-advance-100s.png','vitamins',59.50,40.10,33,3,1000,true,'2099-12-31'),
  ('flashcart','CENTRUM','Centrum Men 60s','/products/centrum-men-60s.png','vitamins',45.50,31.60,31,4,1000,true,'2099-12-31'),
  ('flashcart','CENTRUM','Centrum Women 60s','/products/centrum-women-60s.png','vitamins',45.50,31.60,31,5,1000,true,'2099-12-31');
  -- ⬇️ IMPLEMENTER: open flashcart/supabase/migrations/2026-04-21-flashcart-seed.sql,
  --   take rows 6–22 from the existing seed and transform them the same way
  --   (add tenant='flashcart', category='vitamins', stock_qty=1000, is_active=true,
  --    expiry_date='2099-12-31'; CALTRATE brand uses category='supplements' instead
  --    of 'vitamins' if the source's brand is CALTRATE — both are in Discounter's
  --    category enum). Then apply the promo migration:
  --    flashcart/supabase/migrations/2026-04-29-promo-40pct-3-skus.sql also
  --    adjusts 3 specific SKUs' discount to 40% — fold those updates into the
  --    initial inserts so we have one consistent seed (don't run the old promo
  --    migration verbatim; merge it into the inserts above).
  ;
```

NOTE: rows 6–22 not inlined here because the source file is authoritative and copying 17 more rows is error-prone. The implementer reads the source and transforms.

- [ ] **Step 3: Validate the SQL parses** (syntax check only, not against a real DB yet):

```bash
# Quick syntax sanity: psql --dry-run isn't real, but we can lint via the supabase CLI if installed.
# At minimum verify the file is non-empty and starts with the expected header:
wc -l /Users/derrickteo/codings/discounter/supabase/migrations/2026-05-13-flashcart-unification.sql
head -5 /Users/derrickteo/codings/discounter/supabase/migrations/2026-05-13-flashcart-unification.sql
```

Expected: file has 60+ lines (including 22 product inserts); header begins with `-- 2026-05-13 Flashcart unification`.

- [ ] **Step 4: Commit** (in discounter repo):

```bash
git -C /Users/derrickteo/codings/discounter add supabase/migrations/2026-05-13-flashcart-unification.sql
git -C /Users/derrickteo/codings/discounter commit -m "migration: A1 — additive schema for flashcart tenant + 22 SKU seed"
git -C /Users/derrickteo/codings/discounter push
```

---

## Task M2: USER ACTION — Apply migration to production Supabase

**Files:** None modified. Manual dashboard action by the user.

The agent must STOP after Task M1 commit and ask the user to perform this task. The agent does NOT apply migrations to live Supabase from the CLI — the user runs it via the Supabase SQL editor for review.

- [ ] **Step 1: Tell the user**

> Migration file is ready at `discounter/supabase/migrations/2026-05-13-flashcart-unification.sql`. Please apply it to the production Discounter Supabase project:
>
> 1. Open https://supabase.com/dashboard/project/mvbxnvrkxgfeylrwsuom/sql/new
> 2. Paste the contents of the migration file.
> 3. Run.
> 4. Check the output — no errors, all `alter table` statements succeed.
> 5. Then run these verification queries (one at a time) and tell me the row counts:
>
>    ```sql
>    select count(*) from products;
>    select count(*) from products where tenant='discounter';
>    select count(*) from products where tenant='flashcart';
>    select count(*) from products where brand='GSK';
>    select count(*) from orders;
>    select count(*) from users;
>    ```
>
> Expected: flashcart count = 22. Discounter counts should match what they were BEFORE the migration (no Discounter data touched except `brand` backfill).

- [ ] **Step 2: Wait for user confirmation + counts**.

- [ ] **Step 3: If counts don't match**, halt and escalate to the user. Do not proceed.

- [ ] **Step 4: If counts match**, mark M2 complete and proceed to M3.

---

## Task M3: Discounter — add `lib/tenant.ts` + scope queries

**Files:**
- Create: `/Users/derrickteo/codings/discounter/src/lib/tenant.ts`
- Modify: every page/component that queries `products` or `orders`.

- [ ] **Step 1: Create the tenant constant**

```typescript
// src/lib/tenant.ts
export const TENANT = 'discounter' as const;
export type Tenant = typeof TENANT | 'flashcart';
```

- [ ] **Step 2: Find every product/order query in the Discounter codebase**

```bash
grep -rn "from('products')\|from('orders')\|from(\"products\")\|from(\"orders\")" /Users/derrickteo/codings/discounter/src/ 2>/dev/null
```

For each match, read the surrounding query chain (it'll be `.from('products').select(...).eq(...)` or similar). The fix is to add `.eq('tenant', TENANT)` so the query only returns Discounter rows.

- [ ] **Step 3: Update each query**

Import the constant at the top of each file: `import { TENANT } from '@/lib/tenant';` (or whatever the existing import alias is — check `tsconfig.json` for the path alias).

For each query chain, insert `.eq('tenant', TENANT)` at the appropriate point (typically right after `.select(...)`). Example:

```typescript
// before
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('is_active', true);

// after
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('tenant', TENANT)
  .eq('is_active', true);
```

Same pattern for `orders` queries.

NOTE: If you find queries that should LEGITIMATELY return rows from BOTH tenants (e.g., an admin cross-tenant report — unlikely in Discounter), skip those and note in your report.

- [ ] **Step 4: Build the Next.js app to catch any type errors**

```bash
npm run build
```

Expected: build succeeds. If it fails on a missing TENANT import or a type error, fix that one and re-run.

- [ ] **Step 5: Commit**

```bash
git -C /Users/derrickteo/codings/discounter add src/
git -C /Users/derrickteo/codings/discounter commit -m "scope: A1 — filter products+orders queries by tenant='discounter'"
git -C /Users/derrickteo/codings/discounter push
```

---

## Task M4: Flashcart — swap env + add tenant scope + write tenant on insert

**Files:**
- Modify (local only, NOT committed): `/Users/derrickteo/codings/flashcart/.env.local`
- Create: `/Users/derrickteo/codings/flashcart/src/lib/tenant.ts`
- Modify: every page/component querying `products` or `orders`.
- Modify: order-create code (writes `tenant='flashcart'` on insert).

- [ ] **Step 1: Swap `.env.local` to point at the merged Supabase project**

Read the current Discounter `.env.local` to get the merged project's URL + keys (the agent has filesystem access; user already has these in discounter):

```bash
grep "NEXT_PUBLIC_SUPABASE_URL\|NEXT_PUBLIC_SUPABASE_ANON_KEY\|SUPABASE_SERVICE_ROLE_KEY" /Users/derrickteo/codings/discounter/.env.local
```

Copy those three values into `/Users/derrickteo/codings/flashcart/.env.local` REPLACING the existing values. Keep the other flashcart-specific env vars (PayNow mobile, etc.) unchanged.

The implementer DOES NOT commit `.env.local`. It's gitignored — only edited locally.

- [ ] **Step 2: Create the tenant constant**

```typescript
// flashcart/src/lib/tenant.ts
export const TENANT = 'flashcart' as const;
export type Tenant = 'discounter' | typeof TENANT;
```

- [ ] **Step 3: Find every product/order query in Flashcart and scope**

```bash
grep -rn "from('products')\|from('orders')\|from(\"products\")\|from(\"orders\")\|from('order_items')\|from(\"order_items\")" /Users/derrickteo/codings/flashcart/src/ 2>/dev/null
```

For each `products` or `orders` query, add `.eq('tenant', TENANT)`. Import `TENANT` from `@/lib/tenant`.

`order_items` queries don't need scoping — they're already JOIN-tied to a tenant-scoped `orders` row.

- [ ] **Step 4: Update the order-create code**

Find the place where Flashcart inserts a new row into `orders` (likely in an API route under `src/app/api/...` or a server action). Currently it inserts with the columns Flashcart knows (last_name, payment_ref, total, item_count, client_request_id). Add `tenant: 'flashcart'` to that insert payload.

Similarly for `order_items` inserts — Flashcart already has `product_name`, `brand`, `sale_price`, `quantity`. Map them to the merged schema:
- `product_name` → maps to `order_items.product_name` (new snapshot column).
- `brand` → maps to `order_items.brand` (new snapshot column).
- `sale_price` → maps to `order_items.unit_price` (existing Discounter column). RENAME.
- `quantity` → maps unchanged.

Example transformation in the order-create handler:

```typescript
// before (Flashcart's old shape)
await supabase.from('order_items').insert(
  cart.map(item => ({
    order_id: order.id,
    product_id: item.id,
    product_name: item.name,
    brand: item.brand,
    sale_price: item.salePrice,
    quantity: item.qty,
  }))
);

// after (merged schema)
await supabase.from('order_items').insert(
  cart.map(item => ({
    order_id: order.id,
    product_id: item.id,
    product_name: item.name,
    brand: item.brand,
    unit_price: item.salePrice,   // ← renamed from sale_price
    quantity: item.qty,
  }))
);
```

- [ ] **Step 5: Build the Flashcart Next.js app**

```bash
cd /Users/derrickteo/codings/flashcart && npm run build
```

Expected: build succeeds.

- [ ] **Step 6: Commit (skip .env.local — gitignored)**

```bash
git -C /Users/derrickteo/codings/flashcart add src/
git -C /Users/derrickteo/codings/flashcart commit -m "scope: A1 — point at merged Supabase project + filter by tenant='flashcart'"
git -C /Users/derrickteo/codings/flashcart push
```

---

## Task M5: Deploy both + smoke test

**Files:** None modified. Deployment + functional verification.

- [ ] **Step 1: Deploy Discounter to its hosting**

If Discounter deploys via a connected Git provider (Vercel/CF Pages auto-deploys on push), the push from M3 already triggered it — verify build succeeded in the deploy dashboard.

If manual: run the appropriate deploy command (`vercel deploy --prod` or `wrangler pages deploy ...` or whatever Discounter uses).

- [ ] **Step 2: Smoke-test Discounter end-to-end**

Open the live Discounter URL in a browser. Verify:

- Home page loads.
- Product listing shows ONLY Discounter products (no Centrum/Caltrate items leaking through).
- Sign in as a known user (phone OTP flow).
- Navigate to checkout. Place a small test order.
- Verify in Supabase SQL editor: `select * from orders where tenant='discounter' order by created_at desc limit 1;` — the new order is there with tenant='discounter'.

- [ ] **Step 3: Deploy Flashcart**

Same pattern — Flashcart's hosting (likely Vercel or CF Pages) auto-deploys on the M4 push, OR run the manual deploy command.

- [ ] **Step 4: Smoke-test Flashcart end-to-end**

Open the live Flashcart URL in a browser. Verify:

- Product listing shows ONLY Flashcart products (Centrum/Caltrate — 22 SKUs).
- Add items to cart.
- Complete the anonymous checkout (last_name + payment_ref).
- Verify in Supabase SQL editor: `select * from orders where tenant='flashcart' order by created_at desc limit 1;` — the new order is there with tenant='flashcart', user_id IS NULL, last_name set, client_request_id set.
- Verify order_items: `select * from order_items where order_id = '<that order id>';` — snapshot columns (product_name, brand) populated.

- [ ] **Step 5: Idempotency check (Flashcart)**

Re-submit the same checkout (same `client_request_id`). Verify NO duplicate order is created (the unique index from M1 enforces this).

- [ ] **Step 6: Cross-tenant leak check**

In Supabase SQL editor:

```sql
-- No Discounter query should ever return a Flashcart product, and vice versa.
-- Manual sanity:
select tenant, count(*) from products group by tenant;
select tenant, count(*) from orders group by tenant;
```

Expected: discounter count from products = original Discounter count; flashcart count = 22 + any new test orders.

- [ ] **Step 7: Report results to user**

Summarize: both apps deployed, smoke tests pass, no leakage. User confirms before proceeding to M6.

---

## Task M6: USER ACTION — 48-hour observation window

**Files:** None. Agent waits.

- [ ] **Step 1: Tell the user**

> Both apps are live on the merged Supabase project. Let's wait 48 hours before retiring the old Flashcart project. During this window, monitor:
>
> - Any user-facing error reports (especially around checkout/sign-in)
> - Supabase logs in the merged project (any new error spikes?)
> - Cost: the merged project should look normal (no compute spike).
>
> If anything breaks, we can revert Flashcart's `.env.local` to the OLD Supabase URL — the retired project is still alive during this 48-hour window.

- [ ] **Step 2: Wait for user to come back after 48 hours** and confirm everything's stable.

- [ ] **Step 3: If user reports issues**, halt and address them. Do not proceed to M7.

- [ ] **Step 4: If user reports stable**, proceed to M7.

---

## Task M7: USER ACTION — Shut down the old Flashcart Supabase project

**Files:** None. Manual dashboard action by the user.

- [ ] **Step 1: Tell the user**

> Time to shut down the old Flashcart Supabase project. This is irreversible (Supabase deletes data after a short grace period). Steps:
>
> 1. Open https://supabase.com/dashboard/project/mncrihivjymxqktbcjyr/settings/general
> 2. Scroll to "Delete project" at the bottom.
> 3. Type the project name to confirm.
> 4. Click Delete.
>
> The monthly Supabase bill will drop by $10 starting next billing cycle.

- [ ] **Step 2: User confirms deletion**.

- [ ] **Step 3: Verify**

In the Supabase org-level billing dashboard, confirm the project count dropped from 4 to 3. The "$10/month for project mncrihivjymxqktbcjyr" line should disappear from the next invoice.

- [ ] **Step 4: Mark this plan complete**.

---

## Self-review checklist (run before declaring complete)

- [ ] Migration file `2026-05-13-flashcart-unification.sql` exists in `discounter/supabase/migrations/` and applied successfully to production.
- [ ] All 22 Flashcart products visible in production with `tenant='flashcart'`.
- [ ] Discounter row counts (products / users / orders) unchanged pre/post migration.
- [ ] `lib/tenant.ts` exists in both repos.
- [ ] All product/order queries in both codebases scope by `.eq('tenant', TENANT)`.
- [ ] Both apps deployed and smoke tests pass.
- [ ] No cross-tenant leakage (Discounter doesn't show Flashcart products, vice versa).
- [ ] Flashcart `.env.local` points at merged project (NOT committed).
- [ ] 48 hours stable.
- [ ] Old Flashcart project deleted. Next bill drops by $10.

## Out of scope (per spec §3, §11)

- Spec A2 (frontend consolidation / flashcart-as-skin on Discounter app).
- Merger B (esop / lms / tender internal projects).
- dt-site-creator gate wiring — separate 1-line follow-up task that pastes the merged Supabase URL+anon key into `dt-site-creator/dashboard/js/auth-config.js`.
- Discounter or Flashcart auth changes.
- Payment provider changes.

# Spec A1: Discounter+Flashcart Supabase Unification

**Date:** 2026-05-13
**Status:** Draft (awaiting user review)
**Driver:** Currently 4 Supabase projects on Pro plan = $55/month. Merging Discounter + Flashcart into one project drops to $45/month and unblocks dt-site-creator's free email-OTP gate (it attaches to the merged public project). This is Spec **A1 of A** in the planned consolidation — A1 covers schema + data; A2 (frontend-as-skin consolidation) is deferred to its own spec.

---

## 1. Problem

Discounter and Flashcart each run on their own Supabase project:

- Discounter (`mvbxnvrkxgfeylrwsuom`): real users + orders. Phone-auth via Supabase Auth. Worker-dormitory FMCG flow.
- Flashcart (`mncrihivjymxqktbcjyr`): experimental, seed-only. Anonymous orders (last_name + payment_ref).

Both run $10/month minimum on Pro plan. Schema-wise they're cousins (both have `products`, `orders`, `order_items`) but the column shapes diverge. Maintaining two projects is overkill for the actual data volume; consolidating saves $10/month and creates a single "public consumer apps" Supabase home that dt-site-creator (and any future consumer surface) can share for free.

## 2. Goals

- Merge into **one Supabase project**: keep Discounter's (`mvbxnvrkxgfeylrwsuom`), retire Flashcart's.
- Extend the Discounter schema with an additive migration that supports Flashcart's anonymous-order shape — `tenant`, `brand`, nullable `user_id`/`dormitory_id`, `last_name`, `client_request_id`, snapshot columns on `order_items`.
- Preserve all existing Discounter data (users, orders, order_items, products, dormitories) — additive migration only.
- Re-seed Flashcart's 22 products into the merged project under `tenant='flashcart'`.
- Point Flashcart's existing Next.js codebase at the merged Supabase URL (codebase otherwise unchanged — its own frontend consolidation is Spec A2, deferred).
- Shut down the Flashcart Supabase project after the cutover is verified.

## 3. Non-goals (for A1)

- Frontend consolidation (flashcart-as-skin on Discounter Next.js app) — Spec A2.
- Auth-model changes for Discounter (stays phone-based).
- Adding Supabase Auth to Flashcart (stays anonymous).
- Merger B (esop/lms/tender internal projects) — separate cycle.
- dt-site-creator gate wiring (follows A1 as a 1-line config change in `dashboard/js/auth-config.js`).
- Stripe / payment provider changes.
- Migrating Flashcart's 4 existing orders (assume seed-only; if real orders exist, see §10 risk).

## 4. Which project survives, which retires

- **Survives:** Discounter project `mvbxnvrkxgfeylrwsuom` ("derrick's Org" → Pro plan, has real data).
- **Retires:** Flashcart project `mncrihivjymxqktbcjyr`.

The choice: Discounter has real users + orders; Flashcart is experimental. Keep the one with valuable data; migrate the other's *schema shape* into it.

## 5. Schema unification (additive migration)

The migration adds columns and relaxes nullability — never drops anything Discounter currently uses. Discounter app keeps working without code changes (defaults absorb the new shape).

### 5.1 `products` table — add tenant + brand grouping

```sql
alter table products add column if not exists tenant text not null default 'discounter'
  check (tenant in ('discounter', 'flashcart'));
alter table products add column if not exists brand text;
alter table products add column if not exists sort_order integer;

-- Backfill: GSK pharma products get brand='GSK'; legacy grocery rows stay brand=NULL.
update products set brand = 'GSK'
where category in ('pain_relief','oral_care','denture_care','vitamins','supplements','cold_flu','skincare','digestive');
```

The `category` enum already includes `vitamins` and `supplements` — Flashcart's Centrum/Caltrate products fit cleanly without enum changes.

### 5.2 `orders` table — relax + add flashcart fields

```sql
alter table orders alter column user_id drop not null;
alter table orders alter column dormitory_id drop not null;

alter table orders add column if not exists tenant text not null default 'discounter'
  check (tenant in ('discounter', 'flashcart'));
alter table orders add column if not exists last_name text;
alter table orders add column if not exists item_count integer;
alter table orders add column if not exists client_request_id uuid;

create unique index if not exists orders_client_request_id_key
  on orders (client_request_id) where client_request_id is not null;

-- Either signed-in (user_id) or anonymous (last_name) must be set
alter table orders add constraint orders_identity_present
  check (user_id is not null or last_name is not null);
```

Discounter's existing rows have `user_id` set → constraint passes. Flashcart writes will set `last_name` only → also passes.

### 5.3 `order_items` table — add snapshot columns

```sql
alter table order_items add column if not exists product_name text;
alter table order_items add column if not exists brand text;
```

Flashcart writes snapshot columns at order time (so product renames/deletes don't corrupt order history). Discounter app can keep using `product_id` joins; the snapshot columns are nullable.

### 5.4 RLS policy update — flashcart anonymous writes

Flashcart writes via `service_role` only (anon role gets nothing). This matches current Flashcart pattern.

```sql
-- Service role bypasses RLS by default in Supabase; no policy change needed for writes.
-- Public reads on products (existing policy) cover both tenants because the policy
-- is on is_active=true, not tenant-scoped.
-- Flashcart order writes happen via Next.js API route + service role (existing pattern).
-- Receipt page receives order data in the POST response — no separate anon read needed.
-- No new RLS policy required for flashcart orders.
```

Flashcart's current flow already uses server-side writes via service role. Receipts are shown by passing the order data back from the POST response into the receipt page props. No anon read RLS needed — keep the orders table fully gated to authenticated user_id (Discounter) or service role (Flashcart).

### 5.5 Function — `decrement_stock` already covers both tenants

The existing `decrement_stock(product_id, qty)` function works for any product regardless of tenant. No changes needed.

## 6. Data migration

### 6.1 Discounter preserves everything in place

No data migration for Discounter. All rows continue to exist; new columns get defaults via the additive migration.

### 6.2 Flashcart seed re-insertion

Flashcart's 22 Centrum/Caltrate products get re-inserted into the merged project as:

```sql
insert into products (tenant, brand, name, category, image_url, original_price, sale_price, discount_pct, sort_order, expiry_date, stock_qty, is_active)
values
  ('flashcart', 'CENTRUM', 'Centrum Advance 60''s', 'vitamins', '/products/centrum-advance-60s.png', 38.95, 19.48, 50, 1, '2099-01-01', 1000, true),
  -- ... 21 more rows from flashcart/supabase/migrations/2026-04-21-flashcart-seed.sql
  ;
```

(Source: `/Users/derrickteo/codings/flashcart/supabase/migrations/2026-04-21-flashcart-seed.sql` — adapt the existing seed to include `tenant` + `brand` + a placeholder `expiry_date` since Discounter's schema requires it.)

The promo migration (`2026-04-29-promo-40pct-3-skus.sql`) is a one-off SKU update; apply after the seed.

### 6.3 Flashcart existing orders

Per user's clarification, Flashcart is "experimental — no real orders." Skip data migration on orders/order_items.

If any real test orders exist when we hit migration day, decide at execution time: keep or drop. Default: drop (treat as test data, fresh start in the merged project).

## 7. App code changes

### 7.1 Discounter

Two changes, both small:

- All product/order queries that should be scoped to Discounter add `.eq('tenant', 'discounter')`. Without this, Discounter's listing pages would also show Flashcart's Centrum/Caltrate products.
- Add a `lib/tenant.ts` constant `export const TENANT = 'discounter';` and use it across queries for DRY.

Files to modify: every Next.js page/component that reads `products` or `orders`. The implementer will grep + wrap.

### 7.2 Flashcart

Two changes:

- Update `.env.local`: point `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` to the merged Discounter project's credentials.
- All product/order queries scope with `.eq('tenant', 'flashcart')`. Add `lib/tenant.ts` constant `export const TENANT = 'flashcart';`.
- Order create writes `client_request_id`, `last_name`, `tenant='flashcart'`, snapshot `product_name`/`brand` to order_items. Most of this is already in Flashcart's code; just need to set `tenant` explicitly.

## 8. Cutover sequence

1. Branch the Discounter Supabase project (Pro plan supports branches). Run all migrations from §5 + seed from §6.2 on the branch. Verify counts.
2. Cherry-pick the branch into a single combined migration file in `discounter/supabase/migrations/2026-05-13-flashcart-unification.sql`.
3. Apply the migration to production Discounter Supabase project (via SQL editor or `supabase db push`).
4. Verify Discounter app still loads correctly (smoke: home page, product list, sign-in, checkout flow).
5. Run the Flashcart seed re-insertion against production. Verify 22 new `tenant='flashcart'` products exist.
6. Update Flashcart's `.env.local` to point at the merged Supabase project. Add `tenant='flashcart'` filtering to Flashcart queries. Deploy Flashcart to its existing hosting.
7. Verify Flashcart app loads + can place a test order against the new backend.
8. Wait 48 hours. Watch logs in both apps.
9. Shut down the Flashcart Supabase project (`mncrihivjymxqktbcjyr`). Saves $10/month on next billing cycle.
10. (Out of A1 scope, informational only — see §3.) After A1 lands, a separate 1-line task pastes the merged project URL+anon key into `dt-site-creator/dashboard/js/auth-config.js` to activate the gate. Tracked separately.

## 9. Files created / modified

**Created:**
- `discounter/supabase/migrations/2026-05-13-flashcart-unification.sql` — the additive migration + flashcart seed insert + RLS policy.
- `discounter/src/lib/tenant.ts` (1 line — `export const TENANT = 'discounter';`).
- `flashcart/src/lib/tenant.ts` (1 line — `export const TENANT = 'flashcart';`).
- `discounter/docs/superpowers/specs/2026-05-13-merger-a1-supabase-unification-design.md` (this file).

**Modified:**
- Discounter: every page/component that reads `products` or `orders` → add `.eq('tenant', TENANT)`.
- Flashcart: same pattern + `.env.local` URL/key swap.

**Retired:**
- Flashcart Supabase project `mncrihivjymxqktbcjyr` (manual delete via Supabase dashboard, after 48-hour verification window).

## 10. Risk + rollback

**Schema migration risk: LOW.** All changes are additive — new columns with defaults, relaxed NULL constraints, new check constraint that existing rows pass. Discounter app keeps working without code changes during migration. If migration fails halfway, the partial state is still valid (some columns added, no data corruption).

**Flashcart cutover risk: LOW.** Flashcart is experimental; no real users to disrupt. If the merged-backend version of Flashcart breaks, revert `.env.local` to the old Flashcart Supabase URL and the old project is still running (we only shut it down 48 hours after cutover).

**Data-loss risk: NEAR-ZERO.** Discounter data stays in its current Supabase project the entire time. Pro plan has daily automated backups. We never touch existing rows except to backfill the `brand` column on GSK products (idempotent).

**Hidden-real-data risk:** If Flashcart turns out to have real orders we didn't expect, decide at execution time whether to migrate them or drop. They're easily portable via pg_dump → restore into the merged project under `tenant='flashcart'`.

**Rollback plan:**
- Schema: every additive change in §5 can be reversed by `alter table ... drop column ...`. The `not null` relaxations on `user_id`/`dormitory_id` can be re-tightened ONLY IF no anonymous Flashcart orders exist yet. Roll back BEFORE Flashcart cutover for clean reversal.
- Flashcart cutover: revert `.env.local` to old project URL. Old project stays alive until 48-hour window expires.

## 11. Out of scope (per §3, restated)

- Frontend consolidation (Spec A2).
- Discounter auth changes.
- Flashcart auth additions.
- Merger B.
- dt-site-creator gate wiring (1-line config change after A1 lands; not part of A1 spec/plan).
- Payment provider changes.

## 12. Acceptance criteria

- [ ] Migration `2026-05-13-flashcart-unification.sql` applied to production Discounter Supabase project.
- [ ] Discounter app loads + places a test order (existing user) without errors.
- [ ] Flashcart products visible in merged project under `tenant='flashcart'` (22 SKUs, sort_order 1–22).
- [ ] Flashcart app, repointed at merged Supabase URL, loads + places a test order without errors.
- [ ] `select count(*) from products` returns Discounter's count + 22.
- [ ] `select count(*) from users` unchanged from pre-migration.
- [ ] `select count(*) from orders where tenant='discounter'` matches pre-migration order count.
- [ ] Old Flashcart Supabase project shut down. Next month's Supabase bill drops by $10.
- [ ] dt-site-creator's `auth-config.js` updated with merged project URL+key (separate follow-up).

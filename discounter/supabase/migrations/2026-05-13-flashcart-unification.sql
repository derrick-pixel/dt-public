-- ────────────────────────────────────────────────────────────────────
-- 2026-05-13 Flashcart unification
-- Additive schema migration: enables one Supabase project to host both
-- Discounter (tenant='discounter') and Flashcart (tenant='flashcart').
-- Backward-compatible for the existing Discounter app — every change is
-- a column add or a NOT NULL relaxation. No existing data is rewritten
-- except a one-time backfill of `brand` for GSK products.
-- ────────────────────────────────────────────────────────────────────

-- ── products: reset category check constraint to the full canonical set ──
-- (Production was on the older 2026-04-10 constraint which omits vitamins/supplements.
--  schema.sql shows the full set; the 2026-04-13 migration that introduced it
--  never reached production. Re-applying here is idempotent.)
alter table products drop constraint if exists products_category_check;
alter table products add constraint products_category_check check (category in (
  'beverages', 'snacks', 'instant_noodles', 'canned_goods',
  'rice_grains', 'cooking_essentials', 'personal_care', 'dairy', 'other',
  'pain_relief', 'oral_care', 'denture_care',
  'vitamins', 'supplements', 'cold_flu', 'skincare', 'digestive'
));

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
alter table orders alter column week_cutoff drop not null;

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
-- Promo overrides folded in from flashcart/supabase/migrations/2026-04-29-promo-40pct-3-skus.sql
-- Affected SKUs (sort_order 17, 20, 22): discount_pct=40 already reflected in seed values.
-- Transformation: tenant='flashcart', category='vitamins' (CENTRUM) or 'supplements' (CALTRATE),
--                  stock_qty=1000, is_active=true, expiry_date='2099-12-31'.
insert into products (tenant, brand, name, image_url, category, original_price, sale_price, discount_pct, sort_order, stock_qty, is_active, expiry_date) values
  ('flashcart','CENTRUM','Centrum Advance 60''s','/products/centrum-advance-60s.png','vitamins',38.95,19.48,50,1,1000,true,'2099-12-31'),
  ('flashcart','CENTRUM','Centrum Silver Advance 60''s','/products/centrum-silver-advance-60s.png','vitamins',44.50,22.25,50,2,1000,true,'2099-12-31'),
  ('flashcart','CENTRUM','Centrum Advance 100''s','/products/centrum-advance-100s.png','vitamins',59.50,40.10,33,3,1000,true,'2099-12-31'),
  ('flashcart','CENTRUM','Centrum Men 60s','/products/centrum-men-60s.png','vitamins',45.50,31.60,31,4,1000,true,'2099-12-31'),
  ('flashcart','CENTRUM','Centrum Women 60s','/products/centrum-women-60s.png','vitamins',45.50,31.60,31,5,1000,true,'2099-12-31'),
  ('flashcart','CENTRUM','Centrum Men 100s','/products/centrum-men-100s.png','vitamins',68.50,47.55,31,6,1000,true,'2099-12-31'),
  ('flashcart','CENTRUM','Centrum Women 100s','/products/centrum-women-100s.png','vitamins',68.50,47.55,31,7,1000,true,'2099-12-31'),
  ('flashcart','CENTRUM','Centrum Silver Advance 100''s','/products/centrum-silver-advance-100s.png','vitamins',67.95,45.85,33,8,1000,true,'2099-12-31'),
  ('flashcart','CENTRUM','Centrum 50+ Men 60s','/products/centrum-50-men-60s.png','vitamins',49.95,33.00,34,9,1000,true,'2099-12-31'),
  ('flashcart','CENTRUM','Centrum 50+ Women 60s','/products/centrum-50-women-60s.png','vitamins',49.95,33.00,34,10,1000,true,'2099-12-31'),
  ('flashcart','CENTRUM','Centrum 50+ Men 100s','/products/centrum-50-men-100s.png','vitamins',76.50,50.55,34,11,1000,true,'2099-12-31'),
  ('flashcart','CENTRUM','Centrum 50+ Women 100s','/products/centrum-50-women-100s.png','vitamins',76.50,50.55,34,12,1000,true,'2099-12-31'),
  ('flashcart','CENTRUM','Centrum Kids Chews 60s (Strawberry)','/products/centrum-kids-chews-60s-strawberry.png','vitamins',25.95,18.00,31,13,1000,true,'2099-12-31'),
  ('flashcart','CALTRATE','Caltrate 500IU Bone & Muscle Health (2in1) 60s','/products/caltrate-500iu-bone-muscle-health-2in1-60s.png','supplements',33.95,23.50,31,14,1000,true,'2099-12-31'),
  ('flashcart','CALTRATE','Caltrate 500IU Bone & Muscle Health (2in1) 100s','/products/caltrate-500iu-bone-muscle-health-2in1-100s.png','supplements',51.50,36.30,30,15,1000,true,'2099-12-31'),
  ('flashcart','CALTRATE','Caltrate 500IU Bone & Muscle Health Plus (3in1) 60s','/products/caltrate-500iu-bone-muscle-health-plus-3in1-60s.png','supplements',37.95,26.35,31,16,1000,true,'2099-12-31'),
  ('flashcart','CALTRATE','Caltrate 500IU Bone & Muscle Health Plus (3in1) 100s','/products/caltrate-500iu-bone-muscle-health-plus-3in1-100s.png','supplements',57.95,34.77,40,17,1000,true,'2099-12-31'),
  ('flashcart','CALTRATE','Caltrate 600+D 1000IU Bone & Muscle Health 60s','/products/caltrate-600-d-1000iu-bone-muscle-health-60s.png','supplements',43.50,30.20,31,18,1000,true,'2099-12-31'),
  ('flashcart','CALTRATE','Caltrate Joint Health Ucii 30s','/products/caltrate-joint-health-ucii-30s.png','supplements',50.50,35.05,31,19,1000,true,'2099-12-31'),
  ('flashcart','CALTRATE','Caltrate Joint Health Ucii 90s','/products/caltrate-joint-health-ucii-90s.png','supplements',136.50,81.90,40,20,1000,true,'2099-12-31'),
  ('flashcart','CALTRATE','Caltrate 1000IU Bone & Muscle Vitamin D 60s','/products/caltrate-1000iu-bone-muscle-vitamin-d-60s.png','supplements',21.50,14.95,30,21,1000,true,'2099-12-31'),
  ('flashcart','CALTRATE','Caltrate Joint Speed Hops Uc-ii Collagen 42s','/products/caltrate-joint-speed-hops-uc-ii-collagen-42s.png','supplements',67.95,40.77,40,22,1000,true,'2099-12-31');

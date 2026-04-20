-- ============================================================
-- 2026-04-13  GSK catalogue — remaining 65 SKUs (pages 6-16)
-- ============================================================
-- Follow-up to 2026-04-10-gsk-catalogue.sql which loaded pages 1-5.
-- This migration:
-- 1. Widens the products.category check constraint with 5 more pharma
--    categories (vitamins, supplements, cold_flu, skincare, digestive).
-- 2. Inserts 65 new SKUs from pages 6-16 of Chuan Seng Leong's "GSK -
--    Products Catalogue 2026":
--      Sensodyne (22) — oral_care
--      Scott's (13)  — supplements
--      Eno (4)       — digestive
--      Drapolene (1) — skincare
--      Otrivin (1)   — cold_flu
--      Centrum (12)  — vitamins
--      Caltrate (9)  — supplements
--      Robitussin (1)— cold_flu
--      Imedeen (2)   — supplements
-- Prices use RSP as original_price with a flat 10% discount (per unit).
-- ============================================================

begin;

-- 1. Expand category check constraint with the 5 new pharma categories.
alter table products drop constraint if exists products_category_check;
alter table products add constraint products_category_check check (category in (
  'beverages', 'snacks', 'instant_noodles', 'canned_goods',
  'rice_grains', 'cooking_essentials', 'personal_care', 'dairy', 'other',
  'pain_relief', 'oral_care', 'denture_care',
  'vitamins', 'supplements', 'cold_flu', 'skincare', 'digestive'
));

-- 2. Insert the 65 new SKUs. Idempotent: skips any name that already exists.
insert into products (
  name, description, image_url, category,
  original_price, sale_price, discount_pct,
  expiry_date, stock_qty, is_active
)
select v.name, v.description, v.image_url, v.category,
       v.original_price, v.sale_price, 10,
       date '2027-12-31', 1000, true
from (values
  -- SENSODYNE (oral_care)
  ('Sensodyne Complete Protection Cool Mint Toothpaste (100g)',
   'Daily protection toothpaste for sensitive teeth — 10 benefits in one, with cool mint flavour. 100g tube.',
   '/products/72049689.png', 'oral_care', 10.20, 9.18),
  ('Sensodyne Complete Protection Fresh Breath Toothpaste (100g)',
   'Daily sensitivity toothpaste with extra-fresh breath formula. 100g tube.',
   '/products/72049719.png', 'oral_care', 10.20, 9.18),
  ('Sensodyne Repair & Protect Toothpaste (100g)',
   'Clinically proven to repair sensitive areas and build a protective layer. 100g tube.',
   '/products/72046328.png', 'oral_care', 10.20, 9.18),
  ('Sensodyne Repair & Protect Extra Fresh Toothpaste (100g)',
   'Repairs sensitive teeth with an extra-fresh mint flavour. 100g tube.',
   '/products/72047486.png', 'oral_care', 10.20, 9.18),
  ('Sensodyne Repair & Protect Whitening Toothpaste (100g)',
   'Repairs sensitive teeth while gently whitening daily. 100g tube.',
   '/products/72047011.png', 'oral_care', 10.20, 9.18),
  ('Sensodyne Rapid Relief Original Toothpaste (100g)',
   'Rapid-acting sensitivity relief in 60 seconds — original mint flavour. 100g tube.',
   '/products/72049503.png', 'oral_care', 10.20, 9.18),
  ('Sensodyne Rapid Relief Whitening Toothpaste (100g)',
   'Rapid 60-second sensitivity relief with daily whitening action. 100g tube.',
   '/products/72049527.png', 'oral_care', 10.20, 9.18),
  ('Sensodyne Sensitivity & Gum Toothpaste (100g)',
   'Twin-action toothpaste for sensitive teeth and healthier gums. 100g tube.',
   '/products/72042341.png', 'oral_care', 10.20, 9.18),
  ('Sensodyne Sensitivity & Gum Whitening Toothpaste (100g)',
   'Daily care for sensitive teeth and gums — with whitening. 100g tube.',
   '/products/72042365.png', 'oral_care', 10.20, 9.18),
  ('Sensodyne Sensitivity & Gum Extra Fresh Toothpaste (100g)',
   'Sensitive teeth and gum protection with an extra-fresh flavour. 100g tube.',
   '/products/72043357.png', 'oral_care', 10.20, 9.18),
  ('Sensodyne Sensitivity & Gum Enamel Mint Toothpaste (100g)',
   'Protects sensitive teeth, gums and enamel with a cooling mint flavour. 100g tube.',
   '/products/72047636.png', 'oral_care', 11.00, 9.90),
  ('Sensodyne Clinical White Stain Protector Toothpaste (100g)',
   'Clinically proven to whiten and protect sensitive teeth from stains. 100g tube.',
   '/products/72041908.png', 'oral_care', 13.00, 11.70),
  ('Sensodyne Clinical White Enamel Strengthening Toothpaste (100g)',
   'Clinical whitening formula that also strengthens enamel. 100g tube.',
   '/products/72042196.png', 'oral_care', 13.00, 11.70),
  ('Sensodyne Clinical White Stain Protector Travel Toothpaste (20g)',
   'Travel-size Sensodyne Clinical White stain-protection toothpaste. 20g tube.',
   '/products/72041878.png', 'oral_care', 2.95, 2.66),
  ('Sensodyne Fresh Mint Toothpaste Twin Pack (2 x 100g)',
   'Twin-pack of Sensodyne Fresh Mint daily sensitivity toothpaste. 2 x 100g tubes.',
   '/products/72046134.png', 'oral_care', 6.05, 5.45),
  ('Sensodyne Gum Care Toothpaste Twin Pack (2 x 100g)',
   'Twin-pack of Sensodyne Gum Care — sensitivity and gum health. 2 x 100g tubes.',
   '/products/72046141.png', 'oral_care', 6.05, 5.45),
  ('Sensodyne Gentle Whitening Toothpaste Twin Pack (2 x 100g)',
   'Twin-pack of Sensodyne Gentle Whitening — sensitivity with daily whitening. 2 x 100g tubes.',
   '/products/72044672.png', 'oral_care', 6.05, 5.45),
  ('Sensodyne Multi Care Toothpaste Twin Pack (2 x 100g)',
   'Twin-pack of Sensodyne Multi Care — all-round sensitivity protection. 2 x 100g tubes.',
   '/products/72043508.png', 'oral_care', 6.05, 5.45),
  ('Sensodyne Fresh Mint Toothpaste (75g)',
   'Daily fresh-mint toothpaste for sensitive teeth. 75g tube.',
   '/products/72042976.png', 'oral_care', 4.00, 3.60),
  ('Sensodyne Multicare Toothbrush Soft (3-pack)',
   'Soft-bristle toothbrush designed for sensitive teeth and gums. Pack of 3.',
   '/products/72042860.png', 'oral_care', 4.20, 3.78),
  ('Sensodyne Complete Protection Toothbrush Soft (Buy 2 Free 1)',
   'Soft-bristle sensitivity toothbrush — buy 2 get 1 free promotional pack.',
   '/products/72041191.png', 'oral_care', 14.00, 12.60),
  ('Sensodyne Sensitivity & Gum Toothbrush Soft (Buy 2 Free 1)',
   'Soft-bristle toothbrush for sensitive teeth and gums — buy 2 get 1 free promotional pack.',
   '/products/72043249.png', 'oral_care', 14.00, 12.60),

  -- SCOTT'S (supplements)
  ('Scott''s Cod Liver Oil Capsules (500 capsules)',
   'Classic cod liver oil capsules — omega-3, vitamin A and D for daily immunity. 500 capsules per bottle.',
   '/products/74016028.png', 'supplements', 36.10, 32.49),
  ('Scott''s Vitamin C Mix Berries Pastilles (100g)',
   'Chewable vitamin C pastilles in mixed-berries flavour — daily immunity support. 100g bottle.',
   '/products/74011049.png', 'supplements', 11.95, 10.76),
  ('Scott''s Vitamin C Orange Pastilles (100g)',
   'Chewable vitamin C pastilles in orange flavour — daily immunity support. 100g bottle.',
   '/products/74011629.png', 'supplements', 11.95, 10.76),
  ('Scott''s Vitamin C Black Currant Pastilles (100g)',
   'Chewable vitamin C pastilles in black currant flavour — daily immunity support. 100g bottle.',
   '/products/74016103.png', 'supplements', 11.95, 10.76),
  ('Scott''s Vitamin C Mix Berries Zipper Pack (30g)',
   'Resealable snack pack of mixed-berries vitamin C pastilles. 30g pouch.',
   '/products/74011360.png', 'supplements', 4.15, 3.74),
  ('Scott''s Vitamin C Orange Zipper Pack (30g)',
   'Resealable snack pack of orange vitamin C pastilles. 30g pouch.',
   '/products/74011643.png', 'supplements', 4.15, 3.74),
  ('Scott''s Vitamin C Black Currant Zipper Pack (30g)',
   'Resealable snack pack of black currant vitamin C pastilles. 30g pouch.',
   '/products/74016097.png', 'supplements', 4.15, 3.74),
  ('Scott''s DHA Gummies Black Currant (60 gummies)',
   'Soft chewable DHA gummies for kids — brain-boosting omega-3 with a black-currant twist. 60 gummies per bottle.',
   '/products/74013005.png', 'supplements', 24.50, 22.05),
  ('Scott''s DHA Gummies Orange (60 gummies)',
   'Soft chewable DHA gummies for kids — brain-boosting omega-3 in orange flavour. 60 gummies per bottle.',
   '/products/74012305.png', 'supplements', 24.50, 22.05),
  ('Scott''s DHA Gummies Strawberry (60 gummies)',
   'Soft chewable DHA gummies for kids — brain-boosting omega-3 in strawberry flavour. 60 gummies per bottle.',
   '/products/74012381.png', 'supplements', 24.50, 22.05),
  ('Scott''s DHA Gummies Black Currant Zipper Pack (15 gummies)',
   'Resealable snack pack of kids'' DHA gummies in black-currant flavour. 15 gummies.',
   '/products/74012978.png', 'supplements', 6.50, 5.85),
  ('Scott''s DHA Gummies Orange Zipper Pack (15 gummies)',
   'Resealable snack pack of kids'' DHA gummies in orange flavour. 15 gummies.',
   '/products/74012329.png', 'supplements', 6.50, 5.85),
  ('Scott''s DHA Gummies Strawberry Zipper Pack (15 gummies)',
   'Resealable snack pack of kids'' DHA gummies in strawberry flavour. 15 gummies.',
   '/products/74012404.png', 'supplements', 6.50, 5.85),

  -- ENO (digestive)
  ('Eno Fruit Salt Plain (100g)',
   'Fast-acting antacid fruit salt — relieves heartburn, indigestion and acidity. 100g bottle.',
   '/products/74020017.png', 'digestive', 6.50, 5.85),
  ('Eno Fruit Salt Orange (100g)',
   'Fast-acting antacid fruit salt with a refreshing orange flavour. 100g bottle.',
   '/products/74020055.png', 'digestive', 6.50, 5.85),
  ('Eno Fruit Salt Lemon (100g)',
   'Fast-acting antacid fruit salt with a zesty lemon flavour. 100g bottle.',
   '/products/74020031.png', 'digestive', 6.50, 5.85),
  ('Eno Fruit Salt Lemon Sachets (48 x 4.3g)',
   'Portable single-dose sachets of lemon-flavoured antacid fruit salt. Box of 48.',
   '/products/74000086.png', 'digestive', 49.20, 44.28),

  -- DRAPOLENE (skincare)
  ('Drapolene Cream (55g)',
   'Gentle antiseptic cream that prevents and treats nappy rash. Suitable for babies. 55g tube.',
   '/products/75024230.png', 'skincare', 12.20, 10.98),

  -- OTRIVIN (cold_flu)
  ('Otrivin Nasal Congestion Drops 0.05% (10ml)',
   'Decongestant nasal drops for babies and children — fast relief from blocked nose. 10ml bottle.',
   '/products/76025847.png', 'cold_flu', 12.75, 11.48),

  -- CENTRUM (vitamins)
  ('Centrum Advance Multivitamin (60 tablets)',
   'Complete daily multivitamin for adults with 24 nutrients for energy, immunity and metabolism. 60 tablets.',
   '/products/78010231.png', 'vitamins', 38.95, 35.06),
  ('Centrum Silver Multivitamin 50+ (60 tablets)',
   'Multivitamin tailored for adults 50+ — heart, brain and eye support. 60 tablets.',
   '/products/78010255.png', 'vitamins', 44.50, 40.05),
  ('Centrum Advance Multivitamin (100 tablets)',
   'Complete daily multivitamin for adults — 24 nutrients for energy and immunity. Value pack of 100 tablets.',
   '/products/78010013.png', 'vitamins', 59.50, 53.55),
  ('Centrum Silver Multivitamin 50+ (100 tablets)',
   'Multivitamin for adults 50+ — heart, brain and eye support. Value pack of 100 tablets.',
   '/products/78010456.png', 'vitamins', 67.95, 61.16),
  ('Centrum for Men Multivitamin (60 tablets)',
   'Men''s multivitamin with nutrients for energy, muscle function and heart health. 60 tablets.',
   '/products/78010517.png', 'vitamins', 45.50, 40.95),
  ('Centrum for Women Multivitamin (60 tablets)',
   'Women''s multivitamin with iron, calcium, B vitamins and more. 60 tablets.',
   '/products/78010531.png', 'vitamins', 45.50, 40.95),
  ('Centrum for Men 50+ Multivitamin (60 tablets)',
   'Multivitamin for men 50+ with nutrients supporting heart, muscle and prostate health. 60 tablets.',
   '/products/78011385.png', 'vitamins', 49.95, 44.96),
  ('Centrum for Women 50+ Multivitamin (60 tablets)',
   'Multivitamin for women 50+ with nutrients for heart, bone and metabolism support. 60 tablets.',
   '/products/78011415.png', 'vitamins', 49.95, 44.96),
  ('Centrum for Men Multivitamin (100 tablets)',
   'Men''s daily multivitamin — value pack of 100 tablets.',
   '/products/78012443.png', 'vitamins', 68.50, 61.65),
  ('Centrum for Women Multivitamin (100 tablets)',
   'Women''s daily multivitamin — value pack of 100 tablets.',
   '/products/78012436.png', 'vitamins', 68.50, 61.65),
  ('Centrum for Men 50+ Multivitamin (100 tablets)',
   'Multivitamin for men 50+ — value pack of 100 tablets.',
   '/products/78012948.png', 'vitamins', 76.50, 68.85),
  ('Centrum for Women 50+ Multivitamin (100 tablets)',
   'Multivitamin for women 50+ — value pack of 100 tablets.',
   '/products/78012931.png', 'vitamins', 76.50, 68.85),

  -- CALTRATE (supplements)
  ('Caltrate 600+D3 Triple Action Bone & Muscle Health (60 tablets)',
   'Calcium 600mg + vitamin D3 500IU + magnesium + zinc — triple action for bones and muscles. 60 tablets.',
   '/products/78020821.png', 'supplements', 37.95, 34.16),
  ('Caltrate 600+D3 Dual Action Bone & Muscle Health (60 tablets)',
   'Calcium 600mg + vitamin D3 500IU — dual action for stronger bones and muscles. 60 tablets.',
   '/products/78020814.png', 'supplements', 33.95, 30.56),
  ('Caltrate 600+D3 Triple Action Bone & Muscle Health (100 tablets)',
   'Calcium + vitamin D3 + magnesium + zinc — triple action. Value pack of 100 tablets.',
   '/products/78021392.png', 'supplements', 57.95, 52.16),
  ('Caltrate 600+D3 Dual Action Bone & Muscle Health (100 tablets)',
   'Calcium 600mg + vitamin D3 500IU for bone and muscle health. Value pack of 100 tablets.',
   '/products/78021385.png', 'supplements', 51.50, 46.35),
  ('Caltrate 600+D 1000IU Bone & Muscle Health (60 tablets)',
   'Calcium 600mg + high-strength vitamin D 1000IU for bones and muscles. 60 tablets.',
   '/products/78021637.png', 'supplements', 43.50, 39.15),
  ('Caltrate 1000IU Vitamin D Bone & Muscle Health (60 softgels)',
   'High-strength vitamin D 1000IU softgels — supports calcium absorption and muscle function. 60 softgels.',
   '/products/78023600.png', 'supplements', 21.50, 19.35),
  ('Caltrate Joint Health UC-II Collagen (30 tablets)',
   'UC-II undenatured type II collagen for joint comfort and flexibility. 30 tablets.',
   '/products/78023479.png', 'supplements', 50.50, 45.45),
  ('Caltrate Joint Health UC-II Collagen (90 tablets)',
   'UC-II collagen for joint comfort — 3-month supply. 90 tablets.',
   '/products/78023334.png', 'supplements', 136.50, 122.85),
  ('Caltrate Joint Speed Hops UC-II Collagen (42 tablets)',
   'Fast-acting joint support with UC-II collagen plus hops extract. 42 tablets.',
   '/products/78023654.png', 'supplements', 67.95, 61.16),

  -- ROBITUSSIN (cold_flu)
  ('Robitussin EX Expectorant Syrup (100ml)',
   'Expectorant cough syrup that helps loosen and clear chesty coughs. 100ml bottle.',
   '/products/78031117.png', 'cold_flu', 12.95, 11.66),

  -- IMEDEEN (supplements)
  ('Imedeen Time Perfection (60 tablets)',
   'Beauty-from-within supplement with BioMarine Complex — supports skin firmness and radiance. 60 tablets.',
   '/products/78055818.png', 'supplements', 206.95, 186.26),
  ('Imedeen Prime Renewal (120 tablets)',
   'Advanced skin supplement for women 50+ — supports density, firmness and smoothness. 120 tablets.',
   '/products/78051253.png', 'supplements', 259.95, 233.96)
) as v (name, description, image_url, category, original_price, sale_price)
where not exists (
  select 1 from products p where p.name = v.name
);

commit;

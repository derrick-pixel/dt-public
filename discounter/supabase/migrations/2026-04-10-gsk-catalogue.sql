-- ============================================================
-- 2026-04-10  GSK catalogue swap
-- ============================================================
-- 1. Widens the products.category check constraint to include the GSK
--    pharma categories (pain_relief, oral_care, denture_care).
-- 2. Takes all pre-existing SKUs out of stock (stock_qty = 0) so the
--    /out-of-stock page can still display them while the main store hides
--    them (the store filters stock_qty > 0).
-- 3. Inserts 42 new SKUs sourced from Chuan Seng Leong's "GSK - Products
--    Catalogue 2026" PDF (pages 1-5: Panadol / Panaflex / Voltaren /
--    Aquafresh / Parodontax / Polident). Prices use the PDF's RSP column
--    as original_price and apply a flat 10% discount.
-- ============================================================

begin;

-- 1. Expand category check constraint.
alter table products drop constraint if exists products_category_check;
alter table products add constraint products_category_check check (category in (
  'beverages', 'snacks', 'instant_noodles', 'canned_goods',
  'rice_grains', 'cooking_essentials', 'personal_care', 'dairy', 'other',
  'pain_relief', 'oral_care', 'denture_care'
));

-- 2. Take all legacy SKUs out of stock.
update products
set stock_qty = 0
where created_at < '2026-04-10';

-- 3. Insert new GSK SKUs. Idempotent: skips any name that already exists.
insert into products (
  name, description, image_url, category,
  original_price, sale_price, discount_pct,
  expiry_date, stock_qty, is_active
)
select v.name, v.description, v.image_url, v.category,
       v.original_price, v.sale_price, 10,
       date '2027-12-31', 1000, true
from (values
  -- PANADOL (pain_relief)
  ('Panadol Optizorb 500mg (20 caplets)',
   'Paracetamol 500mg with Optizorb technology — fast relief for headache, body ache and fever. Pack of 20 caplets.',
   '/products/71010362.png', 'pain_relief', 7.95, 7.16),
  ('Panadol Extra Optizorb 500mg (20 caplets)',
   'Paracetamol 500mg + caffeine 65mg. Extra-strength relief with Optizorb fast-absorption technology. Pack of 20 caplets.',
   '/products/71010430.png', 'pain_relief', 9.95, 8.96),
  ('Panadol Extra Optizorb 500mg (120 caplets)',
   'Paracetamol 500mg + caffeine 65mg for extra-strength relief. Family value pack of 120 caplets.',
   '/products/71080447.png', 'pain_relief', 55.75, 50.18),
  ('Panadol Extra Optizorb 500mg (30 caplets)',
   'Paracetamol 500mg + caffeine 65mg with Optizorb fast-absorption technology. Pack of 30 caplets.',
   '/products/71011284.png', 'pain_relief', 13.25, 11.93),
  ('Panadol Actifast 500mg (20 caplets)',
   'Paracetamol 500mg with sodium bicarbonate for faster absorption — relief in minutes. Pack of 20 caplets.',
   '/products/71010515.png', 'pain_relief', 11.75, 10.58),
  ('Panadol Extend 665mg (18 caplets)',
   'Extended-release paracetamol 665mg for up to 8 hours of relief from muscle and joint pain. Pack of 18 caplets.',
   '/products/71010608.png', 'pain_relief', 9.95, 8.96),
  ('Panadol Menstrual 500mg (20 caplets)',
   'Paracetamol 500mg + pamabrom to relieve menstrual cramps, bloating and headache. Pack of 20 caplets.',
   '/products/71012013.png', 'pain_relief', 9.95, 8.96),
  ('Panadol Cold & Flu Hot Remedy 500mg (5 sachets)',
   'Hot lemon drink with paracetamol, phenylephrine and vitamin C to relieve cold and flu symptoms. Pack of 5 sachets.',
   '/products/71010110.png', 'pain_relief', 8.75, 7.88),
  ('Panadol Cold & Flu Cold Relief 500mg (12 caplets)',
   'Paracetamol, phenylephrine and caffeine to relieve blocked nose, headache and body ache from a cold. Pack of 12 caplets.',
   '/products/71010294.png', 'pain_relief', 11.95, 10.76),
  ('Panadol Cold & Flu Cough & Cold (16 caplets)',
   'Paracetamol 500mg + phenylephrine + dextromethorphan — relieves cold symptoms plus dry cough. Pack of 16 caplets.',
   '/products/71001414.png', 'pain_relief', 14.45, 13.01),
  ('Panadol Cold & Flu Sinus Max 500mg (12 caplets)',
   'Paracetamol 500mg + phenylephrine targets sinus pressure, headache and congestion. Pack of 12 caplets.',
   '/products/71010899.png', 'pain_relief', 11.95, 10.76),
  ('Panadol MiniCaps 500mg (12 caplets)',
   'Smaller, smooth-coated paracetamol 500mg caplets — easier to swallow. Pack of 12 caplets.',
   '/products/71010561.png', 'pain_relief', 8.75, 7.88),
  ('Panadol Baby Suspension 1 month+ Strawberry (60ml)',
   'Paracetamol 120mg/5ml oral suspension for babies from 1 month. Sugar-free strawberry flavour. 60ml bottle.',
   '/products/71019302.png', 'pain_relief', 9.75, 8.78),
  ('Panadol Kids Suspension 1-12 years (60ml)',
   'Paracetamol 120mg/5ml oral suspension for children aged 1 to 12. Gentle on little tummies. 60ml bottle.',
   '/products/71010691.png', 'pain_relief', 10.75, 9.68),
  ('Panadol Kid Chewable 120mg Cherry (24 tablets)',
   'Chewable paracetamol 120mg tablets for children — cherry flavour. Pack of 24 tablets.',
   '/products/71010315.png', 'pain_relief', 8.75, 7.88),

  -- PANAFLEX (pain_relief)
  ('Panadol Panaflex Hydro Heat Patch (2 patches)',
   'Hydrogel heat patch delivers soothing warmth to relieve muscle and joint pain. 2 patches per pack.',
   '/products/71011025.png', 'pain_relief', 4.05, 3.65),
  ('Panadol Panaflex Heat Gel Patch (4 patches)',
   'Cooling-to-warming gel patch for targeted relief of back, neck and shoulder pain. 4 patches per pack.',
   '/products/71011056.png', 'pain_relief', 7.30, 6.57),
  ('Panadol Panaflex Hot Patch (5 patches)',
   'Self-heating patch that loosens stiff muscles and soothes aches. 5 patches per pack.',
   '/products/71014536.png', 'pain_relief', 6.60, 5.94),

  -- VOLTAREN (pain_relief)
  ('Voltaren Emulgel 2% (50g)',
   'Diclofenac diethylammonium 2% topical gel — 12-hour relief for back, muscle and joint pain. 50g tube.',
   '/products/71021784.png', 'pain_relief', 25.15, 22.64),

  -- AQUAFRESH (oral_care)
  ('Aquafresh Kids Little Teeth Toothpaste 3-5 yrs (50ml)',
   'Fluoride toothpaste with a mild mint flavour, formulated for children''s baby teeth. 50ml tube.',
   '/products/72016713.png', 'oral_care', 7.60, 6.84),
  ('Aquafresh Kids Big Teeth Toothpaste 6+ yrs (50ml)',
   'Fluoride toothpaste for children transitioning to adult teeth. Gentle mint flavour. 50ml tube.',
   '/products/72016720.png', 'oral_care', 7.60, 6.84),
  ('Aquafresh Kids Little Teeth Toothpaste 3-5 yrs Value Pack (2 x 50ml)',
   'Twin-pack of Aquafresh Little Teeth — fluoride toothpaste for kids aged 3-5. 2 x 50ml tubes.',
   '/products/72018810.png', 'oral_care', 12.35, 11.12),
  ('Aquafresh Kids Big Teeth Toothpaste 6+ yrs Value Pack (2 x 50ml)',
   'Twin-pack of Aquafresh Big Teeth — fluoride toothpaste for kids 6 and above. 2 x 50ml tubes.',
   '/products/72018827.png', 'oral_care', 12.35, 11.12),
  ('Aquafresh Kids Milk Teeth Toothbrush 0-2 yrs',
   'Ultra-soft toothbrush with a small head and easy-grip handle, designed for baby''s first teeth.',
   '/products/72010929.png', 'oral_care', 6.45, 5.81),
  ('Aquafresh Kids Little Teeth Toothbrush 3-5 yrs',
   'Soft-bristle toothbrush with a chunky handle, sized for little hands and little teeth.',
   '/products/72011759.png', 'oral_care', 6.45, 5.81),
  ('Aquafresh Clean & Control Toothbrush Soft (3-pack)',
   'Soft-bristle toothbrush with raised cleaning tips to reach between teeth. Pack of 3.',
   '/products/72011480.png', 'oral_care', 5.85, 5.27),
  ('Aquafresh Clean & Control Toothbrush Medium (3-pack)',
   'Medium-bristle toothbrush with raised cleaning tips for everyday plaque removal. Pack of 3.',
   '/products/72011473.png', 'oral_care', 5.85, 5.27),
  ('Aquafresh Clean & Flex Toothbrush Soft (3-pack)',
   'Flexible-neck toothbrush with soft bristles — gentle cleaning without gum irritation. Pack of 3.',
   '/products/72010142.png', 'oral_care', 5.85, 5.27),
  ('Aquafresh Clean & Flex Toothbrush Medium (3-pack)',
   'Flexible-neck toothbrush with medium bristles for thorough daily cleaning. Pack of 3.',
   '/products/72010159.png', 'oral_care', 5.85, 5.27),

  -- PARODONTAX (oral_care)
  ('Parodontax Daily Fluoride Toothpaste (90g)',
   'Daily toothpaste with fluoride and stannous salts — helps stop and prevent bleeding gums. 90g tube.',
   '/products/72028506.png', 'oral_care', 9.65, 8.69),
  ('Parodontax Daily Whitening Toothpaste (90g)',
   'Whitening toothpaste that also helps prevent bleeding gums. Gently removes surface stains. 90g tube.',
   '/products/72023423.png', 'oral_care', 9.20, 8.28),
  ('Parodontax Herbal Toothpaste (90g)',
   'Herbal formulation with ginger, mint and eucalyptus — helps fight plaque and improve gum health. 90g tube.',
   '/products/72023447.png', 'oral_care', 9.65, 8.69),

  -- POLIDENT (denture_care)
  ('Polident 3-Minute Daily Denture Cleanser (36 tablets)',
   'Effervescent cleansing tablets kill 99.9% of odour-causing bacteria on dentures in just 3 minutes. 36 tablets.',
   '/products/72065160.png', 'denture_care', 9.10, 8.19),
  ('Polident Whitening Daily Denture Cleanser (36 tablets)',
   'Whitening effervescent tablets lift stains and freshen dentures daily. 36 tablets.',
   '/products/72061107.png', 'denture_care', 9.85, 8.87),
  ('Polident Pro Retainer Daily Cleanser (36 tablets)',
   'Gentle effervescent tablets formulated for retainers, aligners and mouth guards. 36 tablets.',
   '/products/72034758.png', 'denture_care', 10.50, 9.45),
  ('Polident 3-Minute Daily Denture Cleanser Twin Pack (2 x 36 tablets)',
   'Twin pack of Polident 3-Minute — effervescent tablets that clean dentures in minutes. 2 x 36 tablets.',
   '/products/72038292.png', 'denture_care', 13.85, 12.47),
  ('Polident Whitening Denture Cleanser Twin Pack (2 x 36 tablets)',
   'Twin pack of Polident Whitening — lifts stains and freshens dentures daily. 2 x 36 tablets.',
   '/products/72038285.png', 'denture_care', 14.95, 13.46),
  ('Polident 3-Minute Daily Denture Cleanser Value Pack (16 + 2 tablets)',
   'Starter value pack — 18 effervescent cleansing tablets for dentures. Cleans in 3 minutes.',
   '/products/72035922.png', 'denture_care', 5.00, 4.50),
  ('Polident Denture Adhesive Cream Fresh Mint (60g)',
   'All-day hold denture adhesive with a fresh mint flavour. Seals out food particles. 60g tube.',
   '/products/72035382.png', 'denture_care', 14.00, 12.60),
  ('Polident Denture Adhesive Cream Flavour Free (60g)',
   'All-day hold denture adhesive with no added flavour — for sensitive palates. 60g tube.',
   '/products/72039381.png', 'denture_care', 14.00, 12.60),
  ('Polident Max Hold & Seal Denture Adhesive (40g)',
   'Extra-strong hold and seal formula — locks out food particles all day. 40g tube.',
   '/products/72037841.png', 'denture_care', 11.90, 10.71),
  ('Polident Max Hold & Seal Denture Adhesive (70g)',
   'Extra-strong hold and seal formula in a larger value tube. Locks out food particles all day. 70g tube.',
   '/products/72037827.png', 'denture_care', 18.90, 17.01)
) as v (name, description, image_url, category, original_price, sale_price)
where not exists (
  select 1 from products p where p.name = v.name
);

commit;

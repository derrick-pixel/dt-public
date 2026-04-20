-- ============================================================
-- Discounter SG — Seed data
-- ============================================================
-- Legacy FMCG/grocery SKUs are seeded with stock_qty = 0 so they
-- appear on the hidden /out-of-stock page while the main store hides
-- them (the store filters stock_qty > 0).
--
-- GSK catalogue SKUs (pages 1-5 of Chuan Seng Leong's "GSK - Products
-- Catalogue 2026") use RSP as original_price with a flat 10% discount.
-- ============================================================

-- ── LEGACY GROCERY SKUs (all out of stock) ────────────────────
insert into products (name, description, category, original_price, sale_price, discount_pct, expiry_date, stock_qty, image_url, is_active) values

-- Beverages
('Coca-Cola Classic 24 x 320ml', 'Refreshing classic cola drink, 24 cans', 'beverages', 15.90, 5.90, 63, '2025-09-30', 0, null, true),
('Red Bull Energy Drink 4 x 250ml', 'Original energy drink with caffeine & taurine, 4 cans', 'beverages', 9.70, 3.50, 64, '2025-08-15', 0, null, true),
('Pokka Green Tea 24 x 300ml', 'Japanese-style green tea, no preservatives, 24 bottles', 'beverages', 14.40, 5.50, 62, '2025-10-20', 0, null, true),
('Milo 3-in-1 Instant Drink 15 sachets x 27g', 'Chocolate malt drink with milk, just add hot water', 'beverages', 7.95, 2.90, 64, '2025-11-10', 0, null, true),
('Tata Tea Premium Leaf Tea 250g', 'Strong Indian-style black tea, loose leaf', 'beverages', 5.30, 2.10, 60, '2025-12-05', 0, null, true),
('100Plus Isotonic Drink 24 x 325ml', 'Isotonic sports drink with electrolytes, 24 cans', 'beverages', 14.90, 5.50, 63, '2025-09-20', 0, null, true),

-- Instant noodles
('Indomie Mi Goreng Fried Noodles 5 x 80g', 'Indonesia''s most popular instant fried noodles, spicy', 'instant_noodles', 2.25, 0.90, 60, '2025-07-15', 0, null, true),
('Maggi 2-Minute Noodles Curry Flavour 5 x 79g', 'Classic curry-flavoured instant noodles', 'instant_noodles', 2.57, 1.00, 61, '2025-08-10', 0, null, true),
('Maggi 2-Minute Noodles Chicken Flavour 5 x 77g', 'Chicken-flavoured instant noodles, quick to cook', 'instant_noodles', 2.57, 1.00, 61, '2025-07-30', 0, null, true),
('Nissin Cup Noodles Seafood 6 x 75g', 'Japanese-style seafood cup noodles, just add hot water', 'instant_noodles', 6.90, 2.80, 59, '2025-09-05', 0, null, true),

-- Canned goods
('Ayam Brand Sardines in Tomato Sauce 215g', 'Tender sardines in rich tomato sauce, ready to eat', 'canned_goods', 2.15, 0.85, 60, '2025-12-20', 0, null, true),
('Ayam Brand Tuna Chunks in Water 185g', 'Skipjack tuna chunks in spring water, high protein', 'canned_goods', 2.40, 0.95, 60, '2025-11-30', 0, null, true),
('Ligo Sardines in Corn Oil 155g', 'Tender sardines in corn oil, popular Filipino-style brand', 'canned_goods', 1.60, 0.65, 59, '2025-10-15', 0, null, true),
('FairPrice Baked Beans in Tomato Sauce 420g', 'Hearty baked beans in tomato sauce, great with rice', 'canned_goods', 1.25, 0.50, 60, '2026-01-10', 0, null, true),

-- Rice & grains
('Royal Umbrella Thai Jasmine Rice 5kg', 'Premium Thai hom mali fragrant rice, long grain', 'rice_grains', 11.25, 4.50, 60, '2025-12-15', 0, null, true),
('India Gate Basmati Rice (Classic) 2kg', 'Extra-long aged basmati rice from India, fragrant', 'rice_grains', 8.95, 3.50, 61, '2025-11-20', 0, null, true),

-- Cooking essentials
('Knife Brand Cooking Oil 2L', 'Refined palm olein cooking oil, suitable for deep frying', 'cooking_essentials', 5.40, 2.10, 61, '2025-10-10', 0, null, true),
('Maggi Oyster Sauce 510g', 'Rich umami oyster sauce, essential for Asian cooking', 'cooking_essentials', 3.15, 1.25, 60, '2025-12-01', 0, null, true),
('Knorr Chicken Stock Cubes 60g (6 cubes)', 'Flavour-packed chicken stock cubes for soups and stews', 'cooking_essentials', 2.10, 0.85, 60, '2025-11-15', 0, null, true),
('FairPrice Instant Curry Powder 250g', 'Fragrant curry powder blend, suitable for meat & vegetable curries', 'cooking_essentials', 2.95, 1.15, 61, '2025-09-25', 0, null, true),

-- Personal care
('Lifebuoy Antibacterial Body Wash 900ml', 'Sea minerals & salt formula, 10x better germ protection', 'personal_care', 6.45, 2.60, 60, '2025-08-20', 0, null, true),
('Dove Deeply Nourishing Body Wash 1L', 'Gentle nourishing body wash with 1/4 moisturising cream', 'personal_care', 8.50, 3.40, 60, '2025-07-25', 0, null, true),
('Sunsilk Smooth & Manageable Shampoo 650ml', 'Anti-frizz shampoo with keratin & argan oil', 'personal_care', 6.90, 2.75, 60, '2025-09-15', 0, null, true),
('Head & Shoulders Anti-Dandruff Shampoo 650ml', 'Classic anti-dandruff formula with Pyrithione Zinc', 'personal_care', 11.90, 4.80, 60, '2025-08-05', 0, null, true),
('Glow & Lovely Advanced Multivitamin Face Cream 50g', 'Daily face cream with Vitamin B3 for radiant glow', 'personal_care', 4.50, 1.80, 60, '2025-07-10', 0, null, true),
('Vaseline Intensive Care Body Lotion 400ml', 'Deep moisturising lotion with micro-droplets of Vaseline jelly', 'personal_care', 7.90, 3.15, 60, '2025-10-30', 0, null, true),
('Colgate Anticavity Toothpaste 225g', 'Fluoride toothpaste for strong teeth & fresh breath', 'personal_care', 4.15, 1.65, 60, '2026-01-20', 0, null, true),

-- Snacks
('Lay''s Classic Potato Chips 170g', 'Crispy classic salted potato chips, popular party snack', 'snacks', 5.35, 2.10, 61, '2025-08-30', 0, null, true),
('Britannia Good Day Butter Cookies 216g', 'Crunchy buttery cookies, popular Indian biscuit brand', 'snacks', 3.50, 1.40, 60, '2025-10-05', 0, null, true),

-- Dairy
('Dutch Lady Full Cream UHT Milk 1L', 'Full cream UHT milk, long shelf life, rich & creamy', 'dairy', 2.70, 1.05, 61, '2025-09-10', 0, null, true);


-- ── GSK CATALOGUE SKUs (pages 1-5, 10% off RSP, in stock) ─────
-- Source: Chuan Seng Leong "GSK - Products Catalogue 2026" (March 2026).
-- original_price = RSP (9% GST); sale_price = round(RSP * 0.9, 2); discount_pct = 10.
insert into products (name, description, category, original_price, sale_price, discount_pct, expiry_date, stock_qty, image_url, is_active) values

-- Panadol (pain_relief)
('Panadol Optizorb 500mg (20 caplets)', 'Paracetamol 500mg with Optizorb technology — fast relief for headache, body ache and fever. Pack of 20 caplets.', 'pain_relief', 7.95, 7.16, 10, '2027-12-31', 1000, '/products/71010362.png', true),
('Panadol Extra Optizorb 500mg (20 caplets)', 'Paracetamol 500mg + caffeine 65mg. Extra-strength relief with Optizorb fast-absorption technology. Pack of 20 caplets.', 'pain_relief', 9.95, 8.96, 10, '2027-12-31', 1000, '/products/71010430.png', true),
('Panadol Extra Optizorb 500mg (120 caplets)', 'Paracetamol 500mg + caffeine 65mg for extra-strength relief. Family value pack of 120 caplets.', 'pain_relief', 55.75, 50.18, 10, '2027-12-31', 1000, '/products/71080447.png', true),
('Panadol Extra Optizorb 500mg (30 caplets)', 'Paracetamol 500mg + caffeine 65mg with Optizorb fast-absorption technology. Pack of 30 caplets.', 'pain_relief', 13.25, 11.93, 10, '2027-12-31', 1000, '/products/71011284.png', true),
('Panadol Actifast 500mg (20 caplets)', 'Paracetamol 500mg with sodium bicarbonate for faster absorption — relief in minutes. Pack of 20 caplets.', 'pain_relief', 11.75, 10.58, 10, '2027-12-31', 1000, '/products/71010515.png', true),
('Panadol Extend 665mg (18 caplets)', 'Extended-release paracetamol 665mg for up to 8 hours of relief from muscle and joint pain. Pack of 18 caplets.', 'pain_relief', 9.95, 8.96, 10, '2027-12-31', 1000, '/products/71010608.png', true),
('Panadol Menstrual 500mg (20 caplets)', 'Paracetamol 500mg + pamabrom to relieve menstrual cramps, bloating and headache. Pack of 20 caplets.', 'pain_relief', 9.95, 8.96, 10, '2027-12-31', 1000, '/products/71012013.png', true),
('Panadol Cold & Flu Hot Remedy 500mg (5 sachets)', 'Hot lemon drink with paracetamol, phenylephrine and vitamin C to relieve cold and flu symptoms. Pack of 5 sachets.', 'pain_relief', 8.75, 7.88, 10, '2027-12-31', 1000, '/products/71010110.png', true),
('Panadol Cold & Flu Cold Relief 500mg (12 caplets)', 'Paracetamol, phenylephrine and caffeine to relieve blocked nose, headache and body ache from a cold. Pack of 12 caplets.', 'pain_relief', 11.95, 10.76, 10, '2027-12-31', 1000, '/products/71010294.png', true),
('Panadol Cold & Flu Cough & Cold (16 caplets)', 'Paracetamol 500mg + phenylephrine + dextromethorphan — relieves cold symptoms plus dry cough. Pack of 16 caplets.', 'pain_relief', 14.45, 13.01, 10, '2027-12-31', 1000, '/products/71001414.png', true),
('Panadol Cold & Flu Sinus Max 500mg (12 caplets)', 'Paracetamol 500mg + phenylephrine targets sinus pressure, headache and congestion. Pack of 12 caplets.', 'pain_relief', 11.95, 10.76, 10, '2027-12-31', 1000, '/products/71010899.png', true),
('Panadol MiniCaps 500mg (12 caplets)', 'Smaller, smooth-coated paracetamol 500mg caplets — easier to swallow. Pack of 12 caplets.', 'pain_relief', 8.75, 7.88, 10, '2027-12-31', 1000, '/products/71010561.png', true),
('Panadol Baby Suspension 1 month+ Strawberry (60ml)', 'Paracetamol 120mg/5ml oral suspension for babies from 1 month. Sugar-free strawberry flavour. 60ml bottle.', 'pain_relief', 9.75, 8.78, 10, '2027-12-31', 1000, '/products/71019302.png', true),
('Panadol Kids Suspension 1-12 years (60ml)', 'Paracetamol 120mg/5ml oral suspension for children aged 1 to 12. Gentle on little tummies. 60ml bottle.', 'pain_relief', 10.75, 9.68, 10, '2027-12-31', 1000, '/products/71010691.png', true),
('Panadol Kid Chewable 120mg Cherry (24 tablets)', 'Chewable paracetamol 120mg tablets for children — cherry flavour. Pack of 24 tablets.', 'pain_relief', 8.75, 7.88, 10, '2027-12-31', 1000, '/products/71010315.png', true),

-- Panaflex (pain_relief)
('Panadol Panaflex Hydro Heat Patch (2 patches)', 'Hydrogel heat patch delivers soothing warmth to relieve muscle and joint pain. 2 patches per pack.', 'pain_relief', 4.05, 3.65, 10, '2027-12-31', 1000, '/products/71011025.png', true),
('Panadol Panaflex Heat Gel Patch (4 patches)', 'Cooling-to-warming gel patch for targeted relief of back, neck and shoulder pain. 4 patches per pack.', 'pain_relief', 7.30, 6.57, 10, '2027-12-31', 1000, '/products/71011056.png', true),
('Panadol Panaflex Hot Patch (5 patches)', 'Self-heating patch that loosens stiff muscles and soothes aches. 5 patches per pack.', 'pain_relief', 6.60, 5.94, 10, '2027-12-31', 1000, '/products/71014536.png', true),

-- Voltaren (pain_relief)
('Voltaren Emulgel 2% (50g)', 'Diclofenac diethylammonium 2% topical gel — 12-hour relief for back, muscle and joint pain. 50g tube.', 'pain_relief', 25.15, 22.64, 10, '2027-12-31', 1000, '/products/71021784.png', true),

-- Aquafresh (oral_care)
('Aquafresh Kids Little Teeth Toothpaste 3-5 yrs (50ml)', 'Fluoride toothpaste with a mild mint flavour, formulated for children''s baby teeth. 50ml tube.', 'oral_care', 7.60, 6.84, 10, '2027-12-31', 1000, '/products/72016713.png', true),
('Aquafresh Kids Big Teeth Toothpaste 6+ yrs (50ml)', 'Fluoride toothpaste for children transitioning to adult teeth. Gentle mint flavour. 50ml tube.', 'oral_care', 7.60, 6.84, 10, '2027-12-31', 1000, '/products/72016720.png', true),
('Aquafresh Kids Little Teeth Toothpaste 3-5 yrs Value Pack (2 x 50ml)', 'Twin-pack of Aquafresh Little Teeth — fluoride toothpaste for kids aged 3-5. 2 x 50ml tubes.', 'oral_care', 12.35, 11.12, 10, '2027-12-31', 1000, '/products/72018810.png', true),
('Aquafresh Kids Big Teeth Toothpaste 6+ yrs Value Pack (2 x 50ml)', 'Twin-pack of Aquafresh Big Teeth — fluoride toothpaste for kids 6 and above. 2 x 50ml tubes.', 'oral_care', 12.35, 11.12, 10, '2027-12-31', 1000, '/products/72018827.png', true),
('Aquafresh Kids Milk Teeth Toothbrush 0-2 yrs', 'Ultra-soft toothbrush with a small head and easy-grip handle, designed for baby''s first teeth.', 'oral_care', 6.45, 5.81, 10, '2027-12-31', 1000, '/products/72010929.png', true),
('Aquafresh Kids Little Teeth Toothbrush 3-5 yrs', 'Soft-bristle toothbrush with a chunky handle, sized for little hands and little teeth.', 'oral_care', 6.45, 5.81, 10, '2027-12-31', 1000, '/products/72011759.png', true),
('Aquafresh Clean & Control Toothbrush Soft (3-pack)', 'Soft-bristle toothbrush with raised cleaning tips to reach between teeth. Pack of 3.', 'oral_care', 5.85, 5.27, 10, '2027-12-31', 1000, '/products/72011480.png', true),
('Aquafresh Clean & Control Toothbrush Medium (3-pack)', 'Medium-bristle toothbrush with raised cleaning tips for everyday plaque removal. Pack of 3.', 'oral_care', 5.85, 5.27, 10, '2027-12-31', 1000, '/products/72011473.png', true),
('Aquafresh Clean & Flex Toothbrush Soft (3-pack)', 'Flexible-neck toothbrush with soft bristles — gentle cleaning without gum irritation. Pack of 3.', 'oral_care', 5.85, 5.27, 10, '2027-12-31', 1000, '/products/72010142.png', true),
('Aquafresh Clean & Flex Toothbrush Medium (3-pack)', 'Flexible-neck toothbrush with medium bristles for thorough daily cleaning. Pack of 3.', 'oral_care', 5.85, 5.27, 10, '2027-12-31', 1000, '/products/72010159.png', true),

-- Parodontax (oral_care)
('Parodontax Daily Fluoride Toothpaste (90g)', 'Daily toothpaste with fluoride and stannous salts — helps stop and prevent bleeding gums. 90g tube.', 'oral_care', 9.65, 8.69, 10, '2027-12-31', 1000, '/products/72028506.png', true),
('Parodontax Daily Whitening Toothpaste (90g)', 'Whitening toothpaste that also helps prevent bleeding gums. Gently removes surface stains. 90g tube.', 'oral_care', 9.20, 8.28, 10, '2027-12-31', 1000, '/products/72023423.png', true),
('Parodontax Herbal Toothpaste (90g)', 'Herbal formulation with ginger, mint and eucalyptus — helps fight plaque and improve gum health. 90g tube.', 'oral_care', 9.65, 8.69, 10, '2027-12-31', 1000, '/products/72023447.png', true),

-- Polident (denture_care)
('Polident 3-Minute Daily Denture Cleanser (36 tablets)', 'Effervescent cleansing tablets kill 99.9% of odour-causing bacteria on dentures in just 3 minutes. 36 tablets.', 'denture_care', 9.10, 8.19, 10, '2027-12-31', 1000, '/products/72065160.png', true),
('Polident Whitening Daily Denture Cleanser (36 tablets)', 'Whitening effervescent tablets lift stains and freshen dentures daily. 36 tablets.', 'denture_care', 9.85, 8.87, 10, '2027-12-31', 1000, '/products/72061107.png', true),
('Polident Pro Retainer Daily Cleanser (36 tablets)', 'Gentle effervescent tablets formulated for retainers, aligners and mouth guards. 36 tablets.', 'denture_care', 10.50, 9.45, 10, '2027-12-31', 1000, '/products/72034758.png', true),
('Polident 3-Minute Daily Denture Cleanser Twin Pack (2 x 36 tablets)', 'Twin pack of Polident 3-Minute — effervescent tablets that clean dentures in minutes. 2 x 36 tablets.', 'denture_care', 13.85, 12.47, 10, '2027-12-31', 1000, '/products/72038292.png', true),
('Polident Whitening Denture Cleanser Twin Pack (2 x 36 tablets)', 'Twin pack of Polident Whitening — lifts stains and freshens dentures daily. 2 x 36 tablets.', 'denture_care', 14.95, 13.46, 10, '2027-12-31', 1000, '/products/72038285.png', true),
('Polident 3-Minute Daily Denture Cleanser Value Pack (16 + 2 tablets)', 'Starter value pack — 18 effervescent cleansing tablets for dentures. Cleans in 3 minutes.', 'denture_care', 5.00, 4.50, 10, '2027-12-31', 1000, '/products/72035922.png', true),
('Polident Denture Adhesive Cream Fresh Mint (60g)', 'All-day hold denture adhesive with a fresh mint flavour. Seals out food particles. 60g tube.', 'denture_care', 14.00, 12.60, 10, '2027-12-31', 1000, '/products/72035382.png', true),
('Polident Denture Adhesive Cream Flavour Free (60g)', 'All-day hold denture adhesive with no added flavour — for sensitive palates. 60g tube.', 'denture_care', 14.00, 12.60, 10, '2027-12-31', 1000, '/products/72039381.png', true),
('Polident Max Hold & Seal Denture Adhesive (40g)', 'Extra-strong hold and seal formula — locks out food particles all day. 40g tube.', 'denture_care', 11.90, 10.71, 10, '2027-12-31', 1000, '/products/72037841.png', true),
('Polident Max Hold & Seal Denture Adhesive (70g)', 'Extra-strong hold and seal formula in a larger value tube. Locks out food particles all day. 70g tube.', 'denture_care', 18.90, 17.01, 10, '2027-12-31', 1000, '/products/72037827.png', true);


-- ── GSK CATALOGUE SKUs (pages 6-16, 10% off RSP, in stock) ────
-- Continuation of the pages 1-5 set above.
insert into products (name, description, category, original_price, sale_price, discount_pct, expiry_date, stock_qty, image_url, is_active) values

-- Sensodyne (oral_care)
('Sensodyne Complete Protection Cool Mint Toothpaste (100g)', 'Daily protection toothpaste for sensitive teeth — 10 benefits in one, with cool mint flavour. 100g tube.', 'oral_care', 10.20, 9.18, 10, '2027-12-31', 1000, '/products/72049689.png', true),
('Sensodyne Complete Protection Fresh Breath Toothpaste (100g)', 'Daily sensitivity toothpaste with extra-fresh breath formula. 100g tube.', 'oral_care', 10.20, 9.18, 10, '2027-12-31', 1000, '/products/72049719.png', true),
('Sensodyne Repair & Protect Toothpaste (100g)', 'Clinically proven to repair sensitive areas and build a protective layer. 100g tube.', 'oral_care', 10.20, 9.18, 10, '2027-12-31', 1000, '/products/72046328.png', true),
('Sensodyne Repair & Protect Extra Fresh Toothpaste (100g)', 'Repairs sensitive teeth with an extra-fresh mint flavour. 100g tube.', 'oral_care', 10.20, 9.18, 10, '2027-12-31', 1000, '/products/72047486.png', true),
('Sensodyne Repair & Protect Whitening Toothpaste (100g)', 'Repairs sensitive teeth while gently whitening daily. 100g tube.', 'oral_care', 10.20, 9.18, 10, '2027-12-31', 1000, '/products/72047011.png', true),
('Sensodyne Rapid Relief Original Toothpaste (100g)', 'Rapid-acting sensitivity relief in 60 seconds — original mint flavour. 100g tube.', 'oral_care', 10.20, 9.18, 10, '2027-12-31', 1000, '/products/72049503.png', true),
('Sensodyne Rapid Relief Whitening Toothpaste (100g)', 'Rapid 60-second sensitivity relief with daily whitening action. 100g tube.', 'oral_care', 10.20, 9.18, 10, '2027-12-31', 1000, '/products/72049527.png', true),
('Sensodyne Sensitivity & Gum Toothpaste (100g)', 'Twin-action toothpaste for sensitive teeth and healthier gums. 100g tube.', 'oral_care', 10.20, 9.18, 10, '2027-12-31', 1000, '/products/72042341.png', true),
('Sensodyne Sensitivity & Gum Whitening Toothpaste (100g)', 'Daily care for sensitive teeth and gums — with whitening. 100g tube.', 'oral_care', 10.20, 9.18, 10, '2027-12-31', 1000, '/products/72042365.png', true),
('Sensodyne Sensitivity & Gum Extra Fresh Toothpaste (100g)', 'Sensitive teeth and gum protection with an extra-fresh flavour. 100g tube.', 'oral_care', 10.20, 9.18, 10, '2027-12-31', 1000, '/products/72043357.png', true),
('Sensodyne Sensitivity & Gum Enamel Mint Toothpaste (100g)', 'Protects sensitive teeth, gums and enamel with a cooling mint flavour. 100g tube.', 'oral_care', 11.00, 9.90, 10, '2027-12-31', 1000, '/products/72047636.png', true),
('Sensodyne Clinical White Stain Protector Toothpaste (100g)', 'Clinically proven to whiten and protect sensitive teeth from stains. 100g tube.', 'oral_care', 13.00, 11.70, 10, '2027-12-31', 1000, '/products/72041908.png', true),
('Sensodyne Clinical White Enamel Strengthening Toothpaste (100g)', 'Clinical whitening formula that also strengthens enamel. 100g tube.', 'oral_care', 13.00, 11.70, 10, '2027-12-31', 1000, '/products/72042196.png', true),
('Sensodyne Clinical White Stain Protector Travel Toothpaste (20g)', 'Travel-size Sensodyne Clinical White stain-protection toothpaste. 20g tube.', 'oral_care', 2.95, 2.66, 10, '2027-12-31', 1000, '/products/72041878.png', true),
('Sensodyne Fresh Mint Toothpaste Twin Pack (2 x 100g)', 'Twin-pack of Sensodyne Fresh Mint daily sensitivity toothpaste. 2 x 100g tubes.', 'oral_care', 6.05, 5.45, 10, '2027-12-31', 1000, '/products/72046134.png', true),
('Sensodyne Gum Care Toothpaste Twin Pack (2 x 100g)', 'Twin-pack of Sensodyne Gum Care — sensitivity and gum health. 2 x 100g tubes.', 'oral_care', 6.05, 5.45, 10, '2027-12-31', 1000, '/products/72046141.png', true),
('Sensodyne Gentle Whitening Toothpaste Twin Pack (2 x 100g)', 'Twin-pack of Sensodyne Gentle Whitening — sensitivity with daily whitening. 2 x 100g tubes.', 'oral_care', 6.05, 5.45, 10, '2027-12-31', 1000, '/products/72044672.png', true),
('Sensodyne Multi Care Toothpaste Twin Pack (2 x 100g)', 'Twin-pack of Sensodyne Multi Care — all-round sensitivity protection. 2 x 100g tubes.', 'oral_care', 6.05, 5.45, 10, '2027-12-31', 1000, '/products/72043508.png', true),
('Sensodyne Fresh Mint Toothpaste (75g)', 'Daily fresh-mint toothpaste for sensitive teeth. 75g tube.', 'oral_care', 4.00, 3.60, 10, '2027-12-31', 1000, '/products/72042976.png', true),
('Sensodyne Multicare Toothbrush Soft (3-pack)', 'Soft-bristle toothbrush designed for sensitive teeth and gums. Pack of 3.', 'oral_care', 4.20, 3.78, 10, '2027-12-31', 1000, '/products/72042860.png', true),
('Sensodyne Complete Protection Toothbrush Soft (Buy 2 Free 1)', 'Soft-bristle sensitivity toothbrush — buy 2 get 1 free promotional pack.', 'oral_care', 14.00, 12.60, 10, '2027-12-31', 1000, '/products/72041191.png', true),
('Sensodyne Sensitivity & Gum Toothbrush Soft (Buy 2 Free 1)', 'Soft-bristle toothbrush for sensitive teeth and gums — buy 2 get 1 free promotional pack.', 'oral_care', 14.00, 12.60, 10, '2027-12-31', 1000, '/products/72043249.png', true),

-- Scott's (supplements)
('Scott''s Cod Liver Oil Capsules (500 capsules)', 'Classic cod liver oil capsules — omega-3, vitamin A and D for daily immunity. 500 capsules per bottle.', 'supplements', 36.10, 32.49, 10, '2027-12-31', 1000, '/products/74016028.png', true),
('Scott''s Vitamin C Mix Berries Pastilles (100g)', 'Chewable vitamin C pastilles in mixed-berries flavour — daily immunity support. 100g bottle.', 'supplements', 11.95, 10.76, 10, '2027-12-31', 1000, '/products/74011049.png', true),
('Scott''s Vitamin C Orange Pastilles (100g)', 'Chewable vitamin C pastilles in orange flavour — daily immunity support. 100g bottle.', 'supplements', 11.95, 10.76, 10, '2027-12-31', 1000, '/products/74011629.png', true),
('Scott''s Vitamin C Black Currant Pastilles (100g)', 'Chewable vitamin C pastilles in black currant flavour — daily immunity support. 100g bottle.', 'supplements', 11.95, 10.76, 10, '2027-12-31', 1000, '/products/74016103.png', true),
('Scott''s Vitamin C Mix Berries Zipper Pack (30g)', 'Resealable snack pack of mixed-berries vitamin C pastilles. 30g pouch.', 'supplements', 4.15, 3.74, 10, '2027-12-31', 1000, '/products/74011360.png', true),
('Scott''s Vitamin C Orange Zipper Pack (30g)', 'Resealable snack pack of orange vitamin C pastilles. 30g pouch.', 'supplements', 4.15, 3.74, 10, '2027-12-31', 1000, '/products/74011643.png', true),
('Scott''s Vitamin C Black Currant Zipper Pack (30g)', 'Resealable snack pack of black currant vitamin C pastilles. 30g pouch.', 'supplements', 4.15, 3.74, 10, '2027-12-31', 1000, '/products/74016097.png', true),
('Scott''s DHA Gummies Black Currant (60 gummies)', 'Soft chewable DHA gummies for kids — brain-boosting omega-3 with a black-currant twist. 60 gummies per bottle.', 'supplements', 24.50, 22.05, 10, '2027-12-31', 1000, '/products/74013005.png', true),
('Scott''s DHA Gummies Orange (60 gummies)', 'Soft chewable DHA gummies for kids — brain-boosting omega-3 in orange flavour. 60 gummies per bottle.', 'supplements', 24.50, 22.05, 10, '2027-12-31', 1000, '/products/74012305.png', true),
('Scott''s DHA Gummies Strawberry (60 gummies)', 'Soft chewable DHA gummies for kids — brain-boosting omega-3 in strawberry flavour. 60 gummies per bottle.', 'supplements', 24.50, 22.05, 10, '2027-12-31', 1000, '/products/74012381.png', true),
('Scott''s DHA Gummies Black Currant Zipper Pack (15 gummies)', 'Resealable snack pack of kids'' DHA gummies in black-currant flavour. 15 gummies.', 'supplements', 6.50, 5.85, 10, '2027-12-31', 1000, '/products/74012978.png', true),
('Scott''s DHA Gummies Orange Zipper Pack (15 gummies)', 'Resealable snack pack of kids'' DHA gummies in orange flavour. 15 gummies.', 'supplements', 6.50, 5.85, 10, '2027-12-31', 1000, '/products/74012329.png', true),
('Scott''s DHA Gummies Strawberry Zipper Pack (15 gummies)', 'Resealable snack pack of kids'' DHA gummies in strawberry flavour. 15 gummies.', 'supplements', 6.50, 5.85, 10, '2027-12-31', 1000, '/products/74012404.png', true),

-- Eno (digestive)
('Eno Fruit Salt Plain (100g)', 'Fast-acting antacid fruit salt — relieves heartburn, indigestion and acidity. 100g bottle.', 'digestive', 6.50, 5.85, 10, '2027-12-31', 1000, '/products/74020017.png', true),
('Eno Fruit Salt Orange (100g)', 'Fast-acting antacid fruit salt with a refreshing orange flavour. 100g bottle.', 'digestive', 6.50, 5.85, 10, '2027-12-31', 1000, '/products/74020055.png', true),
('Eno Fruit Salt Lemon (100g)', 'Fast-acting antacid fruit salt with a zesty lemon flavour. 100g bottle.', 'digestive', 6.50, 5.85, 10, '2027-12-31', 1000, '/products/74020031.png', true),
('Eno Fruit Salt Lemon Sachets (48 x 4.3g)', 'Portable single-dose sachets of lemon-flavoured antacid fruit salt. Box of 48.', 'digestive', 49.20, 44.28, 10, '2027-12-31', 1000, '/products/74000086.png', true),

-- Drapolene (skincare)
('Drapolene Cream (55g)', 'Gentle antiseptic cream that prevents and treats nappy rash. Suitable for babies. 55g tube.', 'skincare', 12.20, 10.98, 10, '2027-12-31', 1000, '/products/75024230.png', true),

-- Otrivin (cold_flu)
('Otrivin Nasal Congestion Drops 0.05% (10ml)', 'Decongestant nasal drops for babies and children — fast relief from blocked nose. 10ml bottle.', 'cold_flu', 12.75, 11.48, 10, '2027-12-31', 1000, '/products/76025847.png', true),

-- Centrum (vitamins)
('Centrum Advance Multivitamin (60 tablets)', 'Complete daily multivitamin for adults with 24 nutrients for energy, immunity and metabolism. 60 tablets.', 'vitamins', 38.95, 35.06, 10, '2027-12-31', 1000, '/products/78010231.png', true),
('Centrum Silver Multivitamin 50+ (60 tablets)', 'Multivitamin tailored for adults 50+ — heart, brain and eye support. 60 tablets.', 'vitamins', 44.50, 40.05, 10, '2027-12-31', 1000, '/products/78010255.png', true),
('Centrum Advance Multivitamin (100 tablets)', 'Complete daily multivitamin for adults — 24 nutrients for energy and immunity. Value pack of 100 tablets.', 'vitamins', 59.50, 53.55, 10, '2027-12-31', 1000, '/products/78010013.png', true),
('Centrum Silver Multivitamin 50+ (100 tablets)', 'Multivitamin for adults 50+ — heart, brain and eye support. Value pack of 100 tablets.', 'vitamins', 67.95, 61.16, 10, '2027-12-31', 1000, '/products/78010456.png', true),
('Centrum for Men Multivitamin (60 tablets)', 'Men''s multivitamin with nutrients for energy, muscle function and heart health. 60 tablets.', 'vitamins', 45.50, 40.95, 10, '2027-12-31', 1000, '/products/78010517.png', true),
('Centrum for Women Multivitamin (60 tablets)', 'Women''s multivitamin with iron, calcium, B vitamins and more. 60 tablets.', 'vitamins', 45.50, 40.95, 10, '2027-12-31', 1000, '/products/78010531.png', true),
('Centrum for Men 50+ Multivitamin (60 tablets)', 'Multivitamin for men 50+ with nutrients supporting heart, muscle and prostate health. 60 tablets.', 'vitamins', 49.95, 44.96, 10, '2027-12-31', 1000, '/products/78011385.png', true),
('Centrum for Women 50+ Multivitamin (60 tablets)', 'Multivitamin for women 50+ with nutrients for heart, bone and metabolism support. 60 tablets.', 'vitamins', 49.95, 44.96, 10, '2027-12-31', 1000, '/products/78011415.png', true),
('Centrum for Men Multivitamin (100 tablets)', 'Men''s daily multivitamin — value pack of 100 tablets.', 'vitamins', 68.50, 61.65, 10, '2027-12-31', 1000, '/products/78012443.png', true),
('Centrum for Women Multivitamin (100 tablets)', 'Women''s daily multivitamin — value pack of 100 tablets.', 'vitamins', 68.50, 61.65, 10, '2027-12-31', 1000, '/products/78012436.png', true),
('Centrum for Men 50+ Multivitamin (100 tablets)', 'Multivitamin for men 50+ — value pack of 100 tablets.', 'vitamins', 76.50, 68.85, 10, '2027-12-31', 1000, '/products/78012948.png', true),
('Centrum for Women 50+ Multivitamin (100 tablets)', 'Multivitamin for women 50+ — value pack of 100 tablets.', 'vitamins', 76.50, 68.85, 10, '2027-12-31', 1000, '/products/78012931.png', true),

-- Caltrate (supplements)
('Caltrate 600+D3 Triple Action Bone & Muscle Health (60 tablets)', 'Calcium 600mg + vitamin D3 500IU + magnesium + zinc — triple action for bones and muscles. 60 tablets.', 'supplements', 37.95, 34.16, 10, '2027-12-31', 1000, '/products/78020821.png', true),
('Caltrate 600+D3 Dual Action Bone & Muscle Health (60 tablets)', 'Calcium 600mg + vitamin D3 500IU — dual action for stronger bones and muscles. 60 tablets.', 'supplements', 33.95, 30.56, 10, '2027-12-31', 1000, '/products/78020814.png', true),
('Caltrate 600+D3 Triple Action Bone & Muscle Health (100 tablets)', 'Calcium + vitamin D3 + magnesium + zinc — triple action. Value pack of 100 tablets.', 'supplements', 57.95, 52.16, 10, '2027-12-31', 1000, '/products/78021392.png', true),
('Caltrate 600+D3 Dual Action Bone & Muscle Health (100 tablets)', 'Calcium 600mg + vitamin D3 500IU for bone and muscle health. Value pack of 100 tablets.', 'supplements', 51.50, 46.35, 10, '2027-12-31', 1000, '/products/78021385.png', true),
('Caltrate 600+D 1000IU Bone & Muscle Health (60 tablets)', 'Calcium 600mg + high-strength vitamin D 1000IU for bones and muscles. 60 tablets.', 'supplements', 43.50, 39.15, 10, '2027-12-31', 1000, '/products/78021637.png', true),
('Caltrate 1000IU Vitamin D Bone & Muscle Health (60 softgels)', 'High-strength vitamin D 1000IU softgels — supports calcium absorption and muscle function. 60 softgels.', 'supplements', 21.50, 19.35, 10, '2027-12-31', 1000, '/products/78023600.png', true),
('Caltrate Joint Health UC-II Collagen (30 tablets)', 'UC-II undenatured type II collagen for joint comfort and flexibility. 30 tablets.', 'supplements', 50.50, 45.45, 10, '2027-12-31', 1000, '/products/78023479.png', true),
('Caltrate Joint Health UC-II Collagen (90 tablets)', 'UC-II collagen for joint comfort — 3-month supply. 90 tablets.', 'supplements', 136.50, 122.85, 10, '2027-12-31', 1000, '/products/78023334.png', true),
('Caltrate Joint Speed Hops UC-II Collagen (42 tablets)', 'Fast-acting joint support with UC-II collagen plus hops extract. 42 tablets.', 'supplements', 67.95, 61.16, 10, '2027-12-31', 1000, '/products/78023654.png', true),

-- Robitussin (cold_flu)
('Robitussin EX Expectorant Syrup (100ml)', 'Expectorant cough syrup that helps loosen and clear chesty coughs. 100ml bottle.', 'cold_flu', 12.95, 11.66, 10, '2027-12-31', 1000, '/products/78031117.png', true),

-- Imedeen (supplements)
('Imedeen Time Perfection (60 tablets)', 'Beauty-from-within supplement with BioMarine Complex — supports skin firmness and radiance. 60 tablets.', 'supplements', 206.95, 186.26, 10, '2027-12-31', 1000, '/products/78055818.png', true),
('Imedeen Prime Renewal (120 tablets)', 'Advanced skin supplement for women 50+ — supports density, firmness and smoothness. 120 tablets.', 'supplements', 259.95, 233.96, 10, '2027-12-31', 1000, '/products/78051253.png', true);

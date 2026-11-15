-- ---------------------------------------------------------------------------
-- Tatra Budič (TABU) – produkty Classic / Exotic / Tropical (ako na webe)
-- Spustenie: Supabase → SQL Editor → vložiť → Run. Idempotentné.
-- ---------------------------------------------------------------------------

-- Pôvodný testovací produkt zo schémy sa zmení na Classic (id sa zachová,
-- takže staré testovacie objednávky ostanú platné).
UPDATE products
   SET slug = 'classic',
       name = 'Tatra Budič Classic',
       image_url = '/cans/classic.webp',
       sort_order = 1
 WHERE slug = 'tatra-budic';

INSERT INTO products (slug, name, description, ingredients, image_url, price, sort_order)
VALUES
    ('classic',
     'Tatra Budič Classic',
     'Prírodný energetický nápoj inšpirovaný Vysokými Tatrami a tradíciou horských bylín.',
     ARRAY['mäta', 'horské byliny', 'guarana', 'extrakt zo zeleného čaju'],
     '/cans/classic.webp', 2.90, 1),
    ('exotic',
     'Tatra Budič Exotic',
     'Klasické zloženie Tatra Budič obohatené o yuzu a liči – citrusovo-sladký, exotickejší profil.',
     ARRAY['mäta', 'horské byliny', 'guarana', 'extrakt zo zeleného čaju', 'yuzu', 'liči'],
     '/cans/exotic.webp', 2.90, 2),
    ('tropical',
     'Tatra Budič Tropical',
     'Klasické zloženie Tatra Budič obohatené o mango a marakuju – ovocnejšia, tropická verzia.',
     ARRAY['mäta', 'horské byliny', 'guarana', 'extrakt zo zeleného čaju', 'mango', 'marakuja'],
     '/cans/tropical.webp', 2.90, 3)
ON CONFLICT (slug) DO NOTHING;

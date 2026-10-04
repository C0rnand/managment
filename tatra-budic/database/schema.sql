-- ---------------------------------------------------------------------------
-- Tatra Budič (TABU) – databázová schéma (PostgreSQL / Supabase)
--
-- Spustenie: Supabase → SQL Editor → vložiť celý súbor → Run.
-- Skript je idempotentný (dá sa pustiť opakovane bez duplicít).
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS products (
    id          SERIAL PRIMARY KEY,
    slug        TEXT UNIQUE NOT NULL,
    name        VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    ingredients TEXT[] NOT NULL DEFAULT '{}',
    image_url   VARCHAR(500),
    price       NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    is_active   BOOLEAN NOT NULL DEFAULT true,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
    id            SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL,
    message       TEXT,
    total_items   INTEGER NOT NULL CHECK (total_items BETWEEN 1 AND 99),
    total_price   NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
    -- testovacie / spamové objednávky sa vylúčia z KPI (WHERE NOT is_test)
    is_test       BOOLEAN NOT NULL DEFAULT false,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
    id         SERIAL PRIMARY KEY,
    order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity   INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 99),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0)
);

CREATE INDEX IF NOT EXISTS idx_orders_email       ON orders (email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at  ON orders (created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order  ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_prod   ON order_items (product_id);

-- ---------------------------------------------------------------------------
-- Zabezpečenie: Row Level Security zapnuté a ŽIADNE politiky.
-- Verejný (anon) kľúč tak nevidí nič. Server používa service/secret kľúč,
-- ktorý RLS obchádza. V tabuľke orders sú osobné údaje (emaily).
-- ---------------------------------------------------------------------------
ALTER TABLE products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Explicitné práva len pre serverový kľúč (service_role). Potrebné, ak je pri
-- vytváraní projektu vypnuté "Automatically expose new tables"; ak je zapnuté,
-- príkazy nič nepokazia. Roly anon/authenticated žiadne práva nedostanú.
GRANT USAGE ON SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON products, orders, order_items TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ---------------------------------------------------------------------------
-- create_order: vytvorí objednávku + položky v jednej transakcii.
-- Cena sa berie z tabuľky products (nie od klienta).
-- p_items = [{"product_id": 1, "quantity": 3}, ...]
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION create_order(
    p_customer_name TEXT,
    p_email         TEXT,
    p_message       TEXT,
    p_items         JSONB
)
RETURNS orders
LANGUAGE plpgsql
AS $$
DECLARE
    v_order       orders;
    v_matched     INTEGER;
    v_total_items INTEGER;
    v_total_price NUMERIC(10, 2);
BEGIN
    IF p_items IS NULL
       OR jsonb_typeof(p_items) <> 'array'
       OR jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'Objednávka musí obsahovať aspoň jednu položku';
    END IF;

    SELECT count(*), sum(s.q), sum(s.q * s.price)
      INTO v_matched, v_total_items, v_total_price
      FROM (
          SELECT (i->>'quantity')::INTEGER AS q, p.price AS price
            FROM jsonb_array_elements(p_items) AS i
            JOIN products p
              ON p.id = (i->>'product_id')::INTEGER
             AND p.is_active
      ) AS s;

    IF v_matched <> jsonb_array_length(p_items) THEN
        RAISE EXCEPTION 'Neplatný alebo neaktívny produkt v objednávke';
    END IF;

    INSERT INTO orders (customer_name, email, message, total_items, total_price)
    VALUES (p_customer_name, p_email, p_message, v_total_items, v_total_price)
    RETURNING * INTO v_order;

    INSERT INTO order_items (order_id, product_id, quantity, unit_price)
    SELECT v_order.id,
           (i->>'product_id')::INTEGER,
           (i->>'quantity')::INTEGER,
           p.price
      FROM jsonb_array_elements(p_items) AS i
      JOIN products p ON p.id = (i->>'product_id')::INTEGER;

    RETURN v_order;
END;
$$;

-- Funkciu smie volať iba server (service_role), nie verejný API kľúč.
REVOKE EXECUTE ON FUNCTION create_order(TEXT, TEXT, TEXT, JSONB) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION create_order(TEXT, TEXT, TEXT, JSONB) TO service_role;

-- ---------------------------------------------------------------------------
-- Počiatočné dáta
-- ---------------------------------------------------------------------------
INSERT INTO products (slug, name, description, ingredients, image_url, price, sort_order)
VALUES (
    'tatra-budic',
    'Tatra Budič',
    'Prírodný energetický nápoj inšpirovaný Vysokými Tatrami a tradíciou horských bylín.',
    ARRAY['mäta', 'horské byliny', 'guarana', 'extrakt zo zeleného čaju'],
    '/old/product-can.svg',
    2.90,
    1
)
ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------------------
-- KPI: priemerný počet kusov na jednu prijatú predobjednávku (cieľ > 4)
--
--   SELECT ROUND(SUM(total_items)::NUMERIC / COUNT(*), 2) AS avg_cans_per_order,
--          COUNT(*)                                       AS orders,
--          ROUND(100.0 * COUNT(*) FILTER (WHERE total_items > 4) / COUNT(*), 1)
--                                                         AS pct_orders_over_4
--     FROM orders
--    WHERE NOT is_test;
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- Tatra Budič (TABU) – návrh databázovej schémy
-- Kompatibilné s PostgreSQL – funguje bez zmeny vo Vercel Postgres aj v Supabase.
--
-- Spustenie:
--   Vercel Postgres → záložka "Query" v dashboarde, alebo `psql "$POSTGRES_URL" -f database/schema.sql`
--   Supabase        → SQL Editor v dashboarde a vložiť obsah tohto súboru
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS products (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    ingredients TEXT[] NOT NULL DEFAULT '{}',
    image_url   VARCHAR(500),
    price       NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
    id            SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL,
    quantity      INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    -- `message` a `product_id` idú nad rámec minimálnej schémy zo zadania,
    -- ale sú užitočné pre reálnu kontaktnú/objednávkovú funkciu formulára.
    message       TEXT,
    product_id    INTEGER REFERENCES products(id),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_email      ON orders (email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at);

-- Počiatočné dáta – produkt Tatra Budič
INSERT INTO products (name, description, ingredients, image_url, price)
VALUES (
    'Tatra Budič',
    'Prírodný energetický nápoj inšpirovaný Vysokými Tatrami a tradíciou horských bylín.',
    ARRAY['mäta', 'horské byliny', 'guarana', 'extrakt zo zeleného čaju'],
    '/tatra-budic-can.png',
    2.90
)
ON CONFLICT DO NOTHING;

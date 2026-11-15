-- ---------------------------------------------------------------------------
-- Tatra Budič (TABU) – admin KPI (PostgreSQL / Supabase)
-- Spustenie: Supabase → SQL Editor → vložiť → Run. Idempotentné.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION admin_kpi(p_include_test BOOLEAN DEFAULT false)
RETURNS JSONB
LANGUAGE sql
STABLE
AS $$
WITH o AS (
    SELECT * FROM orders WHERE p_include_test OR NOT is_test
)
SELECT jsonb_build_object(
    -- hlavné KPI: priemer kusov na predobjednávku (cieľ > 4)
    'orders',        (SELECT count(*) FROM o),
    'total_cans',    (SELECT COALESCE(sum(total_items), 0) FROM o),
    'revenue',       (SELECT COALESCE(sum(total_price), 0) FROM o),
    'avg_cans',      (SELECT COALESCE(round(sum(total_items)::NUMERIC / NULLIF(count(*), 0), 2), 0) FROM o),
    'pct_over_4',    (SELECT COALESCE(round(100.0 * count(*) FILTER (WHERE total_items > 4) / NULLIF(count(*), 0), 1), 0) FROM o),

    -- druhé KPI: opakovaní zákazníci (viac ako 1 objednávka na ten istý email)
    'unique_emails', (SELECT count(DISTINCT lower(email)) FROM o),
    'repeat_emails', (SELECT count(*) FROM (
                         SELECT lower(email) FROM o GROUP BY 1 HAVING count(*) > 1) r),

    -- rozdelenie objednávok podľa počtu kusov
    'distribution',  (SELECT COALESCE(jsonb_agg(jsonb_build_object('items', total_items, 'orders', c)
                                                ORDER BY total_items), '[]'::JSONB)
                        FROM (SELECT total_items, count(*) AS c FROM o GROUP BY total_items) d),

    -- predaj podľa produktu (pripravené na ďalšie drinky)
    'by_product',    (SELECT COALESCE(jsonb_agg(jsonb_build_object('name', name, 'cans', cans, 'revenue', revenue)
                                                ORDER BY cans DESC), '[]'::JSONB)
                        FROM (SELECT p.name, sum(oi.quantity) AS cans,
                                     sum(oi.quantity * oi.unit_price) AS revenue
                                FROM order_items oi
                                JOIN o ON o.id = oi.order_id
                                JOIN products p ON p.id = oi.product_id
                               GROUP BY p.name) x),

    -- objednávky po dňoch (posledných 30 dní)
    'by_day',        (SELECT COALESCE(jsonb_agg(jsonb_build_object('day', day, 'orders', n, 'cans', cans)
                                                ORDER BY day), '[]'::JSONB)
                        FROM (SELECT created_at::DATE AS day, count(*) AS n, sum(total_items) AS cans
                                FROM o
                               WHERE created_at >= now() - INTERVAL '30 days'
                               GROUP BY 1) t)
);
$$;

REVOKE EXECUTE ON FUNCTION admin_kpi(BOOLEAN) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION admin_kpi(BOOLEAN) TO service_role;

-- ---------------------------------------------------------------------------
-- Tatra Budič (TABU) – heslo do administrácie uložené v databáze (bcrypt hash)
-- Spustenie: Supabase → SQL Editor → vložiť → Run. Idempotentné.
-- Heslo sa NEnastavuje v tomto súbore – pozri krok 2 nižšie.
-- ---------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS admin_settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON admin_settings FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON admin_settings TO service_role;

CREATE OR REPLACE FUNCTION admin_check_password(p_password TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
    SELECT EXISTS (
        SELECT 1 FROM admin_settings
         WHERE key = 'password_hash'
           AND value = crypt(p_password, value)
    );
$$;

REVOKE EXECUTE ON FUNCTION admin_check_password(TEXT) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION admin_check_password(TEXT) TO service_role;

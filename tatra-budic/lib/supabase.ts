import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Iba na serveri! Secret/service kľúč obchádza RLS – nikdy ho nedávaj do NEXT_PUBLIC_*.
// Rovnaké názvy premenných ako v lib/db.ts (podporuje nový aj starý systém názvov).
//
// Klient sa vytvorí až pri prvom použití (nie pri importe modulu). Vďaka tomu build
// a verejná časť webu fungujú aj keď premenné nie sú nastavené – chyba sa objaví
// len na /admin.
let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!client) {
    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("Chýba SUPABASE_URL alebo SUPABASE_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY");
    }
    client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return client;
}

export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const c = getClient();
    const value = Reflect.get(c, prop, c);
    return typeof value === "function" ? value.bind(c) : value;
  },
});
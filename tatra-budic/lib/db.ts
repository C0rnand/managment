/**
 * lib/db.ts
 * ---------------------------------------------------------------------------
 * Dátová vrstva aplikácie Tatra Budič (TABU).
 *
 * Tento súbor je naozaj pripojený na Supabase (PostgreSQL) – stačí v ňom
 * nastaviť prístupové premenné prostredia (pozri nižšie) a `getProducts()` /
 * `createOrder()` / `getOrders()` začnú čítať a zapisovať priamo do databázy.
 * Pokiaľ tie premenné nie sú nastavené (napr. lokálny vývoj bez `.env.local`,
 * alebo nasadenie ešte pred prepojením databázy), appka automaticky spadne
 * späť na dátové úložisko v pamäti nižšie, takže nikdy nepadne – len nebude
 * nič trvalo ukladať.
 *
 * Komponenty a API route (app/api/orders/route.ts) volajú len funkcie
 * `getProducts` / `createOrder` / `getOrders`, nikdy priamo SQL ani Supabase
 * klienta – vďaka tomu je celá databázová logika na jednom mieste.
 *
 * ---------------------------------------------------------------------------
 * Ako pripojiť Supabase (keď je projekt na Vercel prepojený so Supabase cez
 * Vercel Marketplace integráciu, kroky 2–3 spraví Vercel automaticky):
 * ---------------------------------------------------------------------------
 * 1. V Supabase projekte: záložka "SQL Editor" → vložiť a spustiť celý obsah
 *    `database/schema.sql` (vytvorí tabuľky `products` a `orders` + naplní
 *    3 produkty Classic/Exotic/Tropical).
 * 2. Vo Vercel projekte: Settings → Integrations → pridať Supabase
 *    (alebo Storage → Connect Database → Supabase) a vybrať tento Supabase
 *    projekt. Vercel sám doplní premenné prostredia (SUPABASE_URL,
 *    SUPABASE_SECRET_KEY a pod.) – nie je treba nič ručne kopírovať.
 * 3. Redeploy (Vercel to po pripojení integrácie zvyčajne spustí sám).
 *    Od tejto chvíle appka číta produkty aj ukladá objednávky priamo do
 *    Supabase – over si to v Supabase: Table Editor → `orders`.
 *
 * Bez Vercel integrácie funguje aj ručné nastavenie – skopírujte URL a kľúč
 * zo Supabase (Project Settings → API) do premenných prostredia vo Vercel
 * (Settings → Environment Variables) alebo do `.env.local` lokálne; presné
 * názvy premenných nájdete v `.env.example`.
 * ---------------------------------------------------------------------------
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface Product {
  id: number;
  name: string;
  description: string;
  ingredients: string[];
  image_url: string;
  price: number;
}

export interface Order {
  id: number;
  customer_name: string;
  email: string;
  quantity: number;
  message?: string;
  created_at: string;
}

export type NewOrder = Pick<Order, "customer_name" | "email" | "quantity"> & {
  message?: string;
};

// ---------------------------------------------------------------------------
// Supabase klient (server-only)
// ---------------------------------------------------------------------------
// Tento súbor sa nikdy neimportuje z "use client" komponentu (ContactForm.tsx
// volá len fetch("/api/orders"), nie priamo lib/db.ts), takže je bezpečné
// použiť secret/service kľúč s plným prístupom bez nutnosti nastavovať Row
// Level Security policies – kľúč sa nikdy nedostane do kódu bežiaceho
// v prehliadači.
//
// Podporujeme obidva názvoslovné systémy Supabase premenných, pretože podľa
// toho, kedy bol Supabase projekt a Vercel integrácia vytvorené, môžete mať
// jeden alebo druhý: novší SUPABASE_URL / SUPABASE_SECRET_KEY (sb_secret_…),
// alebo starší NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (eyJ…
// JWT). Oba fungujú rovnako dobre.
const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase: SupabaseClient | null =
  supabaseUrl && supabaseSecretKey
    ? createClient(supabaseUrl, supabaseSecretKey, { auth: { persistSession: false } })
    : null;

if (!supabase) {
  console.warn(
    "[lib/db] Supabase nie je nakonfigurované (chýba SUPABASE_URL / SUPABASE_SECRET_KEY) – " +
      "používam dočasné mock dáta v pamäti. Pozri komentár na začiatku lib/db.ts."
  );
}

// PostgREST (API vrstva, cez ktorú Supabase klient komunikuje) vracia typ
// NUMERIC ako reťazec, nie číslo, aby sa nestratila presnosť – `price` preto
// treba pri čítaní vždy explicitne previesť na number, inak by napr.
// `product.price.toFixed(2)` v ProductSection.tsx/Ponuka.tsx zhodilo appku.
function mapProductRow(row: Record<string, unknown>): Product {
  return {
    id: Number(row.id),
    name: String(row.name),
    description: String(row.description),
    ingredients: Array.isArray(row.ingredients) ? (row.ingredients as string[]) : [],
    image_url: String(row.image_url ?? ""),
    price: Number(row.price),
  };
}

function mapOrderRow(row: Record<string, unknown>): Order {
  return {
    id: Number(row.id),
    customer_name: String(row.customer_name),
    email: String(row.email),
    quantity: Number(row.quantity),
    message: row.message == null ? undefined : String(row.message),
    created_at: String(row.created_at),
  };
}

// ---------------------------------------------------------------------------
// Mock dáta – záložné riešenie, kým nie je pripojená databáza (pozri hlavičku
// súboru). Rovnaké 3 produkty ako v database/schema.sql.
// ---------------------------------------------------------------------------

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Tatra Budič Classic",
    description:
      "Prírodný energetický nápoj inšpirovaný Vysokými Tatrami a tradíciou horských bylín.",
    ingredients: ["mäta", "horské byliny", "guarana", "extrakt zo zeleného čaju"],
    image_url: "/cans/classic.webp",
    price: 2.9,
  },
  {
    id: 2,
    name: "Tatra Budič Exotic",
    description:
      "Klasické zloženie Tatra Budič obohatené o yuzu a liči – citrusovo-sladký, exotickejší profil.",
    ingredients: [
      "mäta",
      "horské byliny",
      "guarana",
      "extrakt zo zeleného čaju",
      "yuzu",
      "liči",
    ],
    image_url: "/cans/exotic.webp",
    price: 2.9,
  },
  {
    id: 3,
    name: "Tatra Budič Tropical",
    description:
      "Klasické zloženie Tatra Budič obohatené o mango a marakuju – ovocnejšia, tropická verzia.",
    ingredients: [
      "mäta",
      "horské byliny",
      "guarana",
      "extrakt zo zeleného čaju",
      "mango",
      "marakuja",
    ],
    image_url: "/cans/tropical.webp",
    price: 2.9,
  },
];

// Mock objednávky existujú len počas behu servera (resetnú sa pri reštarte /
// novom nasadení) – používa sa to len pokiaľ Supabase nie je nakonfigurované.
const ORDERS: Order[] = [];
let nextOrderId = 1;

export async function getProducts(): Promise<Product[]> {
  if (!supabase) return PRODUCTS;

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("[lib/db] getProducts zo Supabase zlyhalo, používam mock dáta:", error.message);
    return PRODUCTS;
  }
  if (!data || data.length === 0) return PRODUCTS;
  return data.map(mapProductRow);
}

export async function getProductById(id: number): Promise<Product | undefined> {
  if (!supabase) return PRODUCTS.find((product) => product.id === id);

  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();

  if (error) {
    console.error("[lib/db] getProductById zo Supabase zlyhalo:", error.message);
    return PRODUCTS.find((product) => product.id === id);
  }
  return data ? mapProductRow(data) : undefined;
}

export async function createOrder(input: NewOrder): Promise<Order> {
  if (!supabase) {
    const order: Order = {
      id: nextOrderId++,
      created_at: new Date().toISOString(),
      ...input,
    };
    ORDERS.push(order);
    return order;
  }

  const { data, error } = await supabase
    .from("orders")
    .insert({
      customer_name: input.customer_name,
      email: input.email,
      quantity: input.quantity,
      message: input.message ?? null,
    })
    .select()
    .single();

  if (error) {
    // Tu (na rozdiel od getProducts) vedome NEpadáme späť na mock úložisko –
    // objednávka, ktorá sa "uloží" len do pamäte servera, by sa pri ďalšom
    // nasadení nenávratne stratila a appka by pritom hlásila úspech. Radšej
    // nech API route (app/api/orders/route.ts) vráti chybu, ktorú už vie
    // zobraziť ContactForm.tsx.
    console.error("[lib/db] createOrder do Supabase zlyhalo:", error.message);
    throw new Error("Objednávku sa nepodarilo uložiť do databázy.");
  }

  return mapOrderRow(data);
}

export async function getOrders(): Promise<Order[]> {
  if (!supabase) return ORDERS;

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[lib/db] getOrders zo Supabase zlyhalo, používam mock dáta:", error.message);
    return ORDERS;
  }
  return (data ?? []).map(mapOrderRow);
}

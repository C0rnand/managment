/**
 * lib/db.ts
 * ---------------------------------------------------------------------------
 * Dátová vrstva Tatra Budič (TABU).
 *
 * - Ak sú nastavené SUPABASE_URL a SUPABASE_SERVICE_ROLE_KEY, používa Supabase
 *   (PostgreSQL – schéma v database/schema.sql).
 * - Ak nie sú, použije sa úložisko v pamäti (ako doteraz), takže web beží aj
 *   bez databázy (lokálny vývoj, preview bez premenných).
 *
 * POZOR: kľúč je len serverový (nikdy NEXT_PUBLIC_*). Súbor sa nesmie
 * importovať z client komponentov – o to sa stará `server-only`.
 * ---------------------------------------------------------------------------
 */
import "server-only";
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
  /** celkový počet kusov v objednávke (orders.total_items) */
  quantity: number;
  message?: string;
  created_at: string;
}

export type NewOrder = Pick<Order, "customer_name" | "email" | "quantity"> & {
  message?: string;
  /** ak nie je zadaný, použije sa prvý aktívny produkt */
  product_id?: number;
};

// ---------------------------------------------------------------------------
// Klient
// ---------------------------------------------------------------------------

let client: SupabaseClient | null | undefined;
let warned = false;

function getClient(): SupabaseClient | null {
  if (client !== undefined) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    if (!warned) {
      warned = true;
      console.warn(
        "[db] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY nie sú nastavené – používa sa úložisko v pamäti (dáta sa nestratia len počas behu servera)."
      );
    }
    client = null;
    return client;
  }

  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

export function isDatabaseConfigured(): boolean {
  return getClient() !== null;
}

// ---------------------------------------------------------------------------
// Fallback dáta (bez databázy)
// ---------------------------------------------------------------------------

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Tatra Budič",
    description:
      "Prírodný energetický nápoj inšpirovaný Vysokými Tatrami a tradíciou horských bylín.",
    ingredients: ["mäta", "horské byliny", "guarana", "extrakt zo zeleného čaju"],
    image_url: "/old/product-can.svg",
    price: 2.9,
  },
];

const MEMORY_ORDERS: Order[] = [];
let nextMemoryOrderId = 1;

// ---------------------------------------------------------------------------
// Produkty
// ---------------------------------------------------------------------------

export async function getProducts(): Promise<Product[]> {
  const db = getClient();
  if (!db) return FALLBACK_PRODUCTS;

  const { data, error } = await db
    .from("products")
    .select("id, name, description, ingredients, image_url, price")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  // Čítanie nesmie zhodiť stránku ani build – radšej záložné dáta.
  if (error) {
    console.error("[db] getProducts zlyhalo:", error.message);
    return FALLBACK_PRODUCTS;
  }
  if (!data || data.length === 0) return FALLBACK_PRODUCTS;

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    ingredients: row.ingredients ?? [],
    image_url: row.image_url ?? "",
    price: Number(row.price),
  }));
}

export async function getProductById(id: number): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((product) => product.id === id);
}

// ---------------------------------------------------------------------------
// Objednávky
// ---------------------------------------------------------------------------

export async function createOrder(input: NewOrder): Promise<Order> {
  const db = getClient();

  if (!db) {
    const order: Order = {
      id: nextMemoryOrderId++,
      created_at: new Date().toISOString(),
      customer_name: input.customer_name,
      email: input.email,
      quantity: input.quantity,
      message: input.message,
    };
    MEMORY_ORDERS.push(order);
    return order;
  }

  // Zápis NIKDY nepadá potichu na záložné dáta – chyba sa musí vrátiť klientovi,
  // inak by sa objednávka stratila a formulár by ukázal "Ďakujeme".
  const productId = input.product_id ?? (await getProducts())[0]?.id;
  if (!productId) throw new Error("Nie je dostupný žiadny produkt.");

  const { data, error } = await db.rpc("create_order", {
    p_customer_name: input.customer_name,
    p_email: input.email,
    p_message: input.message ?? null,
    p_items: [{ product_id: productId, quantity: input.quantity }],
  });

  if (error) throw new Error(`create_order zlyhalo: ${error.message}`);

  const row = Array.isArray(data) ? data[0] : data;
  return {
    id: row.id,
    customer_name: row.customer_name,
    email: row.email,
    quantity: row.total_items,
    message: row.message ?? undefined,
    created_at: row.created_at,
  };
}

export async function getOrders(): Promise<Order[]> {
  const db = getClient();
  if (!db) return MEMORY_ORDERS;

  const { data, error } = await db
    .from("orders")
    .select("id, customer_name, email, total_items, message, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) throw new Error(`getOrders zlyhalo: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    customer_name: row.customer_name,
    email: row.email,
    quantity: row.total_items,
    message: row.message ?? undefined,
    created_at: row.created_at,
  }));
}

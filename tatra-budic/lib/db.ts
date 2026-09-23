/**
 * lib/db.ts
 * ---------------------------------------------------------------------------
 * Dátová vrstva aplikácie Tatra Budič (TABU).
 *
 * V tomto stave projekt NEPOUŽÍVA žiadnu reálnu databázu – `getProducts()`
 * a `createOrder()` pracujú nad dátovým úložiskom v pamäti (pole v tomto
 * súbore), takže appka beží okamžite po `npm install && npm run dev` bez
 * akejkoľvek ďalšej konfigurácie.
 *
 * Súbor je ale zámerne napísaný tak, aby sa dal neskôr pripojiť na skutočnú
 * PostgreSQL databázu bez zmeny čo i len jedného riadku mimo tohto súboru –
 * komponenty a API route (app/api/orders/route.ts) volajú len funkcie
 * `getProducts` / `createOrder`, nikdy priamo SQL.
 *
 * Návrh schémy nájdete v database/schema.sql.
 *
 * ---------------------------------------------------------------------------
 * MOŽNOSŤ A – Vercel Postgres
 * ---------------------------------------------------------------------------
 * 1. npm install @vercel/postgres
 * 2. Vo Vercel projekte: Storage → Create Database → Postgres → prepojiť.
 * 3. Vercel automaticky doplní premenné POSTGRES_URL a pod. (pozri .env.example)
 * 4. Nahraďte telo funkcií týmto:
 *
 *   import { sql } from '@vercel/postgres';
 *
 *   export async function getProducts(): Promise<Product[]> {
 *     const { rows } = await sql<Product>`SELECT * FROM products ORDER BY id`;
 *     return rows;
 *   }
 *
 *   export async function createOrder(input: NewOrder): Promise<Order> {
 *     const { rows } = await sql<Order>`
 *       INSERT INTO orders (customer_name, email, quantity, message)
 *       VALUES (${input.customer_name}, ${input.email}, ${input.quantity}, ${input.message ?? null})
 *       RETURNING *`;
 *     return rows[0];
 *   }
 *
 * ---------------------------------------------------------------------------
 * MOŽNOSŤ B – Supabase
 * ---------------------------------------------------------------------------
 * 1. npm install @supabase/supabase-js
 * 2. V Supabase projekte: Project Settings → API → skopírovať URL a kľúče
 *    do .env.local (pozri .env.example).
 * 3. Vytvorte klienta a nahraďte telo funkcií:
 *
 *   import { createClient } from '@supabase/supabase-js';
 *
 *   const supabase = createClient(
 *     process.env.NEXT_PUBLIC_SUPABASE_URL!,
 *     process.env.SUPABASE_SERVICE_ROLE_KEY!
 *   );
 *
 *   export async function getProducts(): Promise<Product[]> {
 *     const { data, error } = await supabase.from('products').select('*');
 *     if (error) throw error;
 *     return data as Product[];
 *   }
 *
 *   export async function createOrder(input: NewOrder): Promise<Order> {
 *     const { data, error } = await supabase
 *       .from('orders')
 *       .insert(input)
 *       .select()
 *       .single();
 *     if (error) throw error;
 *     return data as Order;
 *   }
 * ---------------------------------------------------------------------------
 */

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
// Mock dáta (nahraďte databázovým dotazom podľa návodu vyššie)
// ---------------------------------------------------------------------------

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Tatra Budič",
    description:
      "Prírodný energetický nápoj inšpirovaný Vysokými Tatrami a tradíciou horských bylín.",
    ingredients: ["mäta", "horské byliny", "guarana", "extrakt zo zeleného čaju"],
    image_url: "/product-can.svg",
    price: 2.9,
  },
];

// Objednávky existujú len počas behu servera (resetnú sa pri reštarte /
// novom nasadení). Toto je zámerné zjednodušenie pre potreby zadania –
// v produkcii nahraďte skutočnou tabuľkou `orders`.
const ORDERS: Order[] = [];
let nextOrderId = 1;

export async function getProducts(): Promise<Product[]> {
  return PRODUCTS;
}

export async function getProductById(id: number): Promise<Product | undefined> {
  return PRODUCTS.find((product) => product.id === id);
}

export async function createOrder(input: NewOrder): Promise<Order> {
  const order: Order = {
    id: nextOrderId++,
    created_at: new Date().toISOString(),
    ...input,
  };
  ORDERS.push(order);
  return order;
}

export async function getOrders(): Promise<Order[]> {
  return ORDERS;
}

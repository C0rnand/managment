import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/requireAdmin";

export const dynamic = "force-dynamic";

const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export async function GET() {
  await requireAdmin();
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("id, created_at, customer_name, email, message, total_items, total_price, is_test")
    .order("created_at", { ascending: false });
  if (error) return new Response(error.message, { status: 500 });

  const head = "id,created_at,customer_name,email,message,total_items,total_price,is_test";
  const rows = (data ?? []).map((o) =>
    [o.id, o.created_at, o.customer_name, o.email, o.message, o.total_items, o.total_price, o.is_test]
      .map(esc)
      .join(",")
  );
  return new Response("\uFEFF" + [head, ...rows].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="tabu-orders.csv"',
    },
  });
}

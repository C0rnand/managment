import { supabaseAdmin } from "@/lib/supabase";
import { deleteOrder, logout, toggleTest } from "./actions";
import DeleteOrderButton from "./DeleteOrderButton";

export const dynamic = "force-dynamic";

const KPI_TARGET = 4; // cieľ: priemer kusov na predobjednávku > 4

type Kpi = {
  orders: number;
  total_cans: number;
  revenue: number;
  avg_cans: number;
  pct_over_4: number;
  unique_emails: number;
  repeat_emails: number;
  distribution: { items: number; orders: number }[];
  by_product: { name: string; cans: number; revenue: number }[];
  by_day: { day: string; orders: number; cans: number }[];
};

type OrderRow = {
  id: number;
  created_at: string;
  customer_name: string;
  email: string;
  message: string | null;
  total_items: number;
  total_price: number;
  is_test: boolean;
  order_items: { quantity: number; unit_price: number; products: { name: string } | null }[];
};

const eur = (n: number) =>
  new Intl.NumberFormat("sk-SK", { style: "currency", currency: "EUR" }).format(Number(n));
const dt = (s: string) =>
  new Intl.DateTimeFormat("sk-SK", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Bratislava" }).format(new Date(s));

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ test?: string }>;
}) {
  const includeTest = (await searchParams).test === "1";

  const [kpiRes, ordersRes] = await Promise.all([
    supabaseAdmin.rpc("admin_kpi", { p_include_test: includeTest }),
    supabaseAdmin
      .from("orders")
      .select("*, order_items(quantity, unit_price, products(name))")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  if (kpiRes.error || ordersRes.error) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <p>Chyba databázy: {kpiRes.error?.message ?? ordersRes.error?.message}</p>
        <p>Spustil si supabase/002_admin_kpi.sql?</p>
      </main>
    );
  }

  const kpi = kpiRes.data as Kpi;
  const orders = (ordersRes.data ?? []) as unknown as OrderRow[];
  const reached = Number(kpi.avg_cans) > KPI_TARGET;
  const maxDist = Math.max(1, ...kpi.distribution.map((d) => d.orders));
  const repeatPct = kpi.unique_emails ? Math.round((100 * kpi.repeat_emails) / kpi.unique_emails) : 0;

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: 24, fontFamily: "system-ui", color: "#1a1a1a" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ fontSize: 24, margin: 0 }}>TABU – administrácia</h1>
        <nav style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <a href={includeTest ? "/admin" : "/admin?test=1"}>
            {includeTest ? "Skryť testovacie" : "Zobraziť aj testovacie"}
          </a>
          <a href="/admin/export">Export CSV</a>
          <form action={logout}>
            <button type="submit">Odhlásiť</button>
          </form>
        </nav>
      </header>

      <section style={{ marginTop: 24 }}>
        <p style={{ margin: 0, color: "#555" }}>Priemerný počet kusov na predobjednávku (cieľ &gt; {KPI_TARGET})</p>
        <p style={{ fontSize: 56, fontWeight: 700, margin: "4px 0", color: reached ? "#1b7f3b" : "#b45309" }}>
          {Number(kpi.avg_cans).toFixed(2)}
        </p>
        <div style={{ background: "#e5e5e5", height: 10, borderRadius: 5, maxWidth: 480 }} aria-hidden>
          <div
            style={{
              width: `${Math.min(100, (Number(kpi.avg_cans) / KPI_TARGET) * 100)}%`,
              height: "100%",
              borderRadius: 5,
              background: reached ? "#1b7f3b" : "#b45309",
            }}
          />
        </div>
        <p style={{ color: "#555" }}>
          {reached ? "Cieľ splnený." : `Do cieľa chýba ${(KPI_TARGET - Number(kpi.avg_cans)).toFixed(2)} ks.`}{" "}
          {kpi.pct_over_4} % objednávok má viac ako {KPI_TARGET} ks.
        </p>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginTop: 8 }}>
        {[
          ["Objednávky", kpi.orders],
          ["Kusy spolu", kpi.total_cans],
          ["Tržby", eur(kpi.revenue)],
          ["Unikátne emaily", kpi.unique_emails],
          ["Opakovaní zákazníci", `${kpi.repeat_emails} (${repeatPct} %)`],
        ].map(([label, value]) => (
          <div key={String(label)} style={{ border: "1px solid #ddd", padding: 12 }}>
            <div style={{ color: "#555", fontSize: 13 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>{value}</div>
          </div>
        ))}
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginTop: 32 }}>
        <div>
          <h2 style={{ fontSize: 18 }}>Rozdelenie podľa počtu kusov</h2>
          {kpi.distribution.length === 0 && <p>Zatiaľ žiadne objednávky.</p>}
          {kpi.distribution.map((d) => (
            <div key={d.items} style={{ display: "grid", gridTemplateColumns: "48px 1fr 32px", gap: 8, alignItems: "center", margin: "4px 0" }}>
              <span>{d.items} ks</span>
              <div style={{ background: d.items > KPI_TARGET ? "#1b7f3b" : "#9ca3af", height: 14, width: `${(d.orders / maxDist) * 100}%` }} />
              <span>{d.orders}</span>
            </div>
          ))}
        </div>
        <div>
          <h2 style={{ fontSize: 18 }}>Predaj podľa produktu</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {kpi.by_product.map((p) => (
                <tr key={p.name} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "6px 0" }}>{p.name}</td>
                  <td>{p.cans} ks</td>
                  <td style={{ textAlign: "right" }}>{eur(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 18 }}>Objednávky (posledných 200)</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "2px solid #ccc" }}>
                <th>#</th><th>Dátum</th><th>Meno</th><th>Email</th><th>Položky</th><th>Ks</th><th>Cena</th><th>Správa</th><th></th>
              </tr>
            </thead>
            <tbody>
              {orders
                .filter((o) => includeTest || !o.is_test)
                .map((o) => (
                  <tr key={o.id} style={{ borderBottom: "1px solid #eee", opacity: o.is_test ? 0.5 : 1, verticalAlign: "top" }}>
                    <td>{o.id}</td>
                    <td>{dt(o.created_at)}</td>
                    <td>{o.customer_name}</td>
                    <td>{o.email}</td>
                    <td>{o.order_items.map((i) => `${i.quantity}× ${i.products?.name ?? "?"}`).join(", ")}</td>
                    <td>{o.total_items}</td>
                    <td>{eur(o.total_price)}</td>
                    <td style={{ maxWidth: 220 }}>{o.message}</td>
                    <td>
                      <div style={{ display: "grid", gap: 6, justifyItems: "start" }}>
                        <form action={toggleTest}>
                          <input type="hidden" name="id" value={o.id} />
                          <input type="hidden" name="next" value={String(!o.is_test)} />
                          <button type="submit">{o.is_test ? "Vrátiť do KPI" : "Označiť ako test"}</button>
                        </form>
                        <form action={deleteOrder}>
                          <input type="hidden" name="id" value={o.id} />
                          <DeleteOrderButton orderId={o.id} />
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

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
const shortDay = (s: string) =>
  new Intl.DateTimeFormat("sk-SK", { day: "numeric", month: "numeric", timeZone: "UTC" }).format(new Date(s));

const focus = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2";
const navLink = `rounded-full px-3 py-2 text-sm text-forest-700 transition-colors hover:bg-forest-50 hover:text-forest-950 ${focus}`;
const smallBtn = `rounded-full border border-forest-200 px-3 py-1.5 text-xs font-medium text-forest-700 transition-colors hover:bg-forest-50 ${focus}`;
const card = "rounded-2xl border border-forest-100 bg-white p-5 sm:p-6";

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
      <main className="grid min-h-screen place-items-center bg-forest-50 p-6 text-forest-900">
        <div className={`${card} max-w-md`}>
          <h1 className="font-display text-xl font-semibold text-forest-950">Chyba databázy</h1>
          <p className="mt-2 text-sm text-forest-700">{kpiRes.error?.message ?? ordersRes.error?.message}</p>
          <p className="mt-2 text-sm text-forest-700">Spustil si v Supabase súbory 002 až 004 z priečinka database?</p>
        </div>
      </main>
    );
  }

  const kpi = kpiRes.data as Kpi;
  const orders = (ordersRes.data ?? []) as unknown as OrderRow[];
  const visibleOrders = orders.filter((o) => includeTest || !o.is_test);

  const avg = Number(kpi.avg_cans);
  const reached = avg > KPI_TARGET;
  const gaugeMax = Math.max(KPI_TARGET * 1.5, avg * 1.15);
  const fillPct = Math.min(100, (avg / gaugeMax) * 100);
  const targetPct = (KPI_TARGET / gaugeMax) * 100;
  const maxDist = Math.max(1, ...kpi.distribution.map((d) => d.orders));
  const maxDayCans = Math.max(1, ...kpi.by_day.map((d) => Number(d.cans)));
  const repeatPct = kpi.unique_emails ? Math.round((100 * kpi.repeat_emails) / kpi.unique_emails) : 0;

  const tiles: [string, string | number][] = [
    ["Objednávky", kpi.orders],
    ["Kusy spolu", kpi.total_cans],
    ["Tržby", eur(kpi.revenue)],
    ["Unikátne emaily", kpi.unique_emails],
    ["Opakovaní zákazníci", `${kpi.repeat_emails} (${repeatPct} %)`],
  ];

  return (
    <div className="min-h-screen bg-forest-50 font-sans text-forest-900">
      <header className="border-b border-forest-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-6 py-3">
          <div className="flex items-center gap-2.5">
            <img src="/logo-mark.svg" alt="" aria-hidden="true" className="h-8 w-8" />
            <span className="font-display text-lg font-semibold tracking-tight text-forest-950">TABU</span>
            <span className="hidden text-sm text-forest-500 sm:inline">administrácia</span>
          </div>
          <nav className="flex flex-wrap items-center justify-end gap-1">
            <a href="/" className={navLink}>Web</a>
            <a href={includeTest ? "/admin" : "/admin?test=1"} className={navLink}>
              {includeTest ? "Skryť testovacie" : "Zobraziť testovacie"}
            </a>
            <a href="/admin/export" className={navLink}>Export CSV</a>
            <form action={logout}>
              <button
                type="submit"
                className={`ml-1 rounded-full bg-forest-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-forest-800 ${focus}`}
              >
                Odhlásiť
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        {/* Hlavné KPI */}
        <section className="relative overflow-hidden rounded-3xl bg-forest-950 p-6 text-white sm:p-10">
          <div className="pointer-events-none absolute inset-0 bg-radial-glow" aria-hidden="true" />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-end">
            <div>
              <p className="text-sm text-forest-300">Priemerný počet kusov na predobjednávku</p>
              <p className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">{avg.toFixed(2)}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
                <span
                  className={`rounded-full px-3 py-1 font-medium ${
                    reached ? "bg-emerald-400/15 text-emerald-300" : "bg-amber-400/15 text-amber-300"
                  }`}
                >
                  {reached ? "Cieľ splnený" : `Do cieľa chýba ${(KPI_TARGET - avg).toFixed(2)} ks`}
                </span>
                <span className="text-forest-300">{kpi.pct_over_4} % objednávok má viac ako {KPI_TARGET} ks</span>
              </div>
            </div>

            <div>
              <div className="relative h-3 rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full ${reached ? "bg-emerald-400" : "bg-amber-400"}`}
                  style={{ width: `${fillPct}%` }}
                />
                <div
                  className="absolute -top-2 h-7 w-0.5 rounded bg-white"
                  style={{ left: `${targetPct}%` }}
                  aria-hidden="true"
                />
              </div>
              <div className="relative mt-3 h-5 text-xs text-forest-300">
                <span className="absolute left-0">0</span>
                <span className="absolute -translate-x-1/2 text-white" style={{ left: `${targetPct}%` }}>
                  cieľ {KPI_TARGET}
                </span>
                <span className="absolute right-0">{gaugeMax.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Ďalšie čísla */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {tiles.map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-forest-100 bg-white p-4">
              <div className="text-sm text-forest-600">{label}</div>
              <div className="mt-1 font-display text-2xl font-semibold text-forest-950">{value}</div>
            </div>
          ))}
        </section>

        {/* Rozdelenie a produkty */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className={card}>
            <h2 className="font-display text-lg font-semibold text-forest-950">Rozdelenie podľa počtu kusov</h2>
            <p className="mt-1 text-sm text-forest-600">Zelené objednávky majú viac ako {KPI_TARGET} ks.</p>
            <div className="mt-4 space-y-2">
              {kpi.distribution.length === 0 && <p className="text-sm text-forest-600">Zatiaľ žiadne objednávky.</p>}
              {kpi.distribution.map((d) => (
                <div key={d.items} className="grid grid-cols-[3rem_1fr_2rem] items-center gap-3 text-sm">
                  <span className="text-forest-700">{d.items} ks</span>
                  <div className="h-3 rounded-full bg-forest-50">
                    <div
                      className={`h-full rounded-full ${d.items > KPI_TARGET ? "bg-emerald-500" : "bg-forest-300"}`}
                      style={{ width: `${(d.orders / maxDist) * 100}%` }}
                    />
                  </div>
                  <span className="text-right font-medium text-forest-950">{d.orders}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={card}>
            <h2 className="font-display text-lg font-semibold text-forest-950">Predaj podľa produktu</h2>
            {kpi.by_product.length === 0 ? (
              <p className="mt-4 text-sm text-forest-600">Zatiaľ žiadny predaj.</p>
            ) : (
              <table className="mt-4 w-full text-sm">
                <tbody>
                  {kpi.by_product.map((p) => (
                    <tr key={p.name} className="border-t border-forest-100 first:border-t-0">
                      <td className="py-2.5 text-forest-950">{p.name}</td>
                      <td className="py-2.5 text-forest-700">{p.cans} ks</td>
                      <td className="py-2.5 text-right font-medium text-forest-950">{eur(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Posledných 30 dní */}
        {kpi.by_day.length > 0 && (
          <section className={card}>
            <h2 className="font-display text-lg font-semibold text-forest-950">Kusy po dňoch (30 dní)</h2>
            <div className="mt-4 flex h-32 items-end gap-1.5 overflow-x-auto">
              {kpi.by_day.map((d) => (
                <div key={d.day} className="flex h-full min-w-6 flex-1 flex-col items-center justify-end gap-1.5">
                  <div
                    className="w-full rounded-t bg-emerald-500"
                    style={{ height: `${(Number(d.cans) / maxDayCans) * 100}%`, minHeight: 4 }}
                    title={`${shortDay(d.day)}: ${d.cans} ks, ${d.orders} obj.`}
                  />
                  <span className="text-[10px] text-forest-500">{shortDay(d.day)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Objednávky */}
        <section className={`${card} !p-0 overflow-hidden`}>
          <div className="flex items-baseline justify-between gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
            <h2 className="font-display text-lg font-semibold text-forest-950">Objednávky</h2>
            <span className="text-sm text-forest-600">posledných 200</span>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-y border-forest-100 bg-forest-50 text-forest-600">
                  <th className="px-5 py-2.5 font-medium sm:px-6">#</th>
                  <th className="px-3 py-2.5 font-medium">Dátum</th>
                  <th className="px-3 py-2.5 font-medium">Zákazník</th>
                  <th className="px-3 py-2.5 font-medium">Položky</th>
                  <th className="px-3 py-2.5 font-medium">Ks</th>
                  <th className="px-3 py-2.5 font-medium">Cena</th>
                  <th className="px-3 py-2.5 font-medium">Správa</th>
                  <th className="px-5 py-2.5 sm:px-6"><span className="sr-only">Akcie</span></th>
                </tr>
              </thead>
              <tbody>
                {visibleOrders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-forest-600">
                      Zatiaľ žiadne objednávky.
                    </td>
                  </tr>
                )}
                {visibleOrders.map((o) => (
                  <tr key={o.id} className={`border-b border-forest-100 align-top last:border-b-0 ${o.is_test ? "bg-forest-50/60 text-forest-600" : ""}`}>
                    <td className="px-5 py-3.5 text-forest-500 sm:px-6">{o.id}</td>
                    <td className="whitespace-nowrap px-3 py-3.5">{dt(o.created_at)}</td>
                    <td className="px-3 py-3.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-forest-950">{o.customer_name}</span>
                        {o.is_test && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">test</span>
                        )}
                      </div>
                      <div className="text-forest-600">{o.email}</div>
                    </td>
                    <td className="px-3 py-3.5">
                      {o.order_items.map((i) => `${i.quantity}× ${i.products?.name ?? "?"}`).join(", ")}
                    </td>
                    <td className="px-3 py-3.5 font-medium text-forest-950">{o.total_items}</td>
                    <td className="whitespace-nowrap px-3 py-3.5">{eur(o.total_price)}</td>
                    <td className="max-w-[220px] px-3 py-3.5 text-forest-700">{o.message}</td>
                    <td className="px-5 py-3.5 sm:px-6">
                      <div className="flex flex-col items-start gap-2">
                        <form action={toggleTest}>
                          <input type="hidden" name="id" value={o.id} />
                          <input type="hidden" name="next" value={String(!o.is_test)} />
                          <button type="submit" className={smallBtn}>
                            {o.is_test ? "Vrátiť do KPI" : "Označiť ako test"}
                          </button>
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
    </div>
  );
}

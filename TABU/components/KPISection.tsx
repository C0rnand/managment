import Reveal from "./Reveal";
import MountainBackground from "./MountainBackground";

const KPIS = [
  {
    metric: "> 4 ks",
    metricLabel: "cieľ na jednu objednávku",
    title: "Zákaznícky dopyt po väčšom objeme",
    measures: "Priemerný počet objednaných plechoviek na jednu objednávku.",
    method: "Ukladanie objednávok v PostgreSQL databáze (Supabase alebo Neon).",
  },
  {
    metric: "≥ 8 %",
    metricLabel: "cieľová konverzia",
    title: "Konverzný pomer objednávkového formulára",
    measures:
      "Podiel návštevníkov sekcie Kontakt, ktorí formulár aj odošlú (odoslané objednávky ÷ návštevy sekcie).",
    method:
      "Počet záznamov v tabuľke orders v pomere k návštevnosti sekcie #kontakt vo Vercel Analytics.",
  },
  {
    metric: "≥ 20 %",
    metricLabel: "cieľ do 30 dní",
    title: "Počet vracajúcich sa návštevníkov",
    measures: "Podiel návštevníkov, ktorí sa na web vrátia do 30 dní od prvej návštevy.",
    method:
      "Vercel Analytics (unikátni vs. opakovaní návštevníci), pri MVP verzii náhradne cez localStorage.",
  },
];

export default function KPISection() {
  return (
    <section id="kpi" className="relative overflow-hidden bg-forest-950 py-24 text-white">
      {/* Only the bottom portion of the backdrop is shown — that's where
          the mountain ridgelines sit. The full-height crop also pulled in
          the decorative "moon" circle from the hero's sky, which reads as
          an unexplained blob rather than a mountain once the surrounding
          night-sky context is gone. */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 opacity-40">
        <MountainBackground />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 sm:px-8">
        <Reveal className="max-w-2xl">
          <h2 className="font-display text-4xl font-semibold tracking-tight">
            Ako meriame úspech
          </h2>
          <p className="mt-4 leading-relaxed text-forest-200">
            Tri metriky, ktoré nám v najskoršej fáze startupu povedia, či má Tatra Budič
            skutočný zákaznícky dopyt – nie len návštevnosť.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {KPIS.map((kpi, index) => (
            <Reveal key={kpi.title} delayMs={index * 110}>
              <article className="glass-dark h-full rounded-2xl p-7">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-forest-300">
                  KPI {index + 1}
                </p>

                <p className="mt-4 font-display text-4xl font-semibold text-emerald-300">
                  {kpi.metric}
                </p>
                <p className="mt-1 text-xs text-forest-300">{kpi.metricLabel}</p>

                <h3 className="mt-5 font-display text-lg font-semibold leading-snug text-white">
                  {kpi.title}
                </h3>

                <dl className="mt-5 space-y-4 border-t border-white/10 pt-5">
                  <div>
                    <dt className="text-xs text-forest-300">Čo meriame</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-forest-100/90">{kpi.measures}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-forest-300">Spôsob merania</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-forest-100/90">{kpi.method}</dd>
                  </div>
                </dl>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

import Reveal from "./Reveal";

const ITERATIONS = [
  {
    label: "Modul 1",
    title: "Statické používateľské rozhranie",
    description:
      "Vytvorenie statického používateľského rozhrania pomocou Next.js a Tailwind CSS vrátane marketingového webu.",
    status: "Hotovo",
    statusTone: "done" as const,
  },
  {
    label: "Modul 2",
    title: "Databáza produktov a objednávok",
    description:
      "Integrácia PostgreSQL databázy (preferovane Neon alebo Supabase PostgreSQL) pre správu produktov a objednávok.",
    status: "Pripravené na pripojenie",
    statusTone: "ready" as const,
  },
  {
    label: "Modul 3",
    title: "Autentifikácia a administrácia",
    description:
      "Implementácia autentifikácie a administrátorského rozhrania pre správu objednávok.",
    status: "Plánované",
    statusTone: "planned" as const,
  },
];

const STATUS_STYLES = {
  done: "bg-emerald-100 text-emerald-700",
  ready: "bg-amber-100 text-amber-700",
  planned: "bg-forest-100 text-forest-600",
};

export default function Timeline() {
  return (
    <section id="realizacia" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <Reveal className="max-w-2xl">
          <h2 className="font-display text-4xl font-semibold tracking-tight text-forest-950">
            Realizácia projektu
          </h2>
          <p className="mt-5 leading-relaxed text-forest-700">
            Pre vývoj aplikácie Tatra Budič (TABU) sme zvolili <strong className="font-semibold text-forest-950">inkrementálny model</strong>,
            pretože máme jasnú víziu o cieľovej funkcionalite, no z technologického hľadiska je
            najefektívnejšie systém budovať po ucelených funkčných celkoch (prírastkoch). Po
            každom module existuje funkčná a nasaditeľná verzia systému.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-0">
          {ITERATIONS.map((iteration, index) => (
            <Reveal key={iteration.label} delayMs={index * 100}>
              <div className="grid grid-cols-[2.5rem_1fr] gap-x-6 sm:grid-cols-[3rem_1fr]">
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest-950 font-display text-sm font-semibold text-white sm:h-12 sm:w-12">
                    {index + 1}
                  </div>
                  {index < ITERATIONS.length - 1 && (
                    <div className="mt-1 w-px flex-1 bg-forest-200" aria-hidden="true" />
                  )}
                </div>

                <div className={index < ITERATIONS.length - 1 ? "pb-12" : ""}>
                  <div className="flex flex-wrap items-center gap-3 pt-1.5">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-forest-500">
                      {iteration.label}
                    </p>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[iteration.statusTone]}`}>
                      {iteration.status}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-xl font-semibold text-forest-950">
                    {iteration.title}
                  </h3>
                  <p className="mt-2 max-w-xl leading-relaxed text-forest-600">
                    {iteration.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

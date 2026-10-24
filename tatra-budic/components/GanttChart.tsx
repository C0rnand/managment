import Reveal from "./Reveal";

// Časová os je presná (dni od 21. 9. 2026), nie zarovnaná na celé týždne –
// úlohy v zadaní nemajú rovnako dlhé fázy, takže pozície/šírky pruhov sú
// počítané ako % z celkového rozsahu 21. 9. – 1. 12. 2026 (72 dní).
const TOTAL_DAYS = 72;

const TICKS: { pct: number; label: string }[] = [
  { pct: 0, label: "21. 9." },
  { pct: 9.72, label: "28. 9." },
  { pct: 29.17, label: "12. 10." },
  { pct: 38.89, label: "19. 10." },
  { pct: 48.61, label: "26. 10." },
  { pct: 68.06, label: "9. 11." },
  { pct: 88.89, label: "24. 11." },
  { pct: 100, label: "1. 12." },
];

type Status = "done" | "current" | "planned";

interface Task {
  id: number;
  name: string;
  description: string;
  dates: string;
  note: string;
  status: Status;
  /** true = súbežná úloha, nie je na kritickej ceste */
  parallel?: boolean;
  left: number;
  width: number;
}

const TASKS: Task[] = [
  {
    id: 1,
    name: "Základný web",
    description: "Inicializácia Next.js repozitára, nastavenie prostredia a vytvorenie hrubej kostry podstránok.",
    dates: "21. 9. – 27. 9.",
    note: "štart projektu",
    status: "done",
    left: 0,
    width: 9.72,
  },
  {
    id: 2,
    name: "Vylepšenie UI/UX",
    description: "Pridanie animácií, responzívneho dizajnu a doladenie globálnych štýlov webu.",
    dates: "28. 9. – 11. 10.",
    note: "nadväzuje na #1",
    status: "done",
    left: 9.72,
    width: 19.44,
  },
  {
    id: 3,
    name: "Návrh databázy",
    description: "Teoretický návrh relačnej SQL schémy pre produkty a objednávky.",
    dates: "28. 9. – 11. 10.",
    note: "súbežne s #2 · mimo kritickej cesty",
    status: "done",
    parallel: true,
    left: 9.72,
    width: 19.44,
  },
  {
    id: 4,
    name: "Integrácia 3 príchutí",
    description: "Nasadenie vizuálov plechoviek (Classic, Exotic, Tropical) a vytvorenie produktových detailov.",
    dates: "12. 10. – 18. 10.",
    note: "nadväzuje na #2, #3",
    status: "done",
    left: 29.17,
    width: 9.72,
  },
  {
    id: 5,
    name: "Nákupný košík",
    description: "Programovanie logiky košíka a používateľského rozhrania pre objednávkový formulár.",
    dates: "19. 10. – 25. 10.",
    note: "nadväzuje na #4",
    status: "current",
    left: 38.89,
    width: 9.72,
  },
  {
    id: 6,
    name: "Vývoj API a DB",
    description: "Vytvorenie serverových ciest a reálne prepojenie nakódovaného frontendu s databázou.",
    dates: "26. 10. – 8. 11.",
    note: "nadväzuje na #5",
    status: "planned",
    left: 48.61,
    width: 19.44,
  },
  {
    id: 7,
    name: "Administrátorský panel",
    description: "Implementácia zabezpečeného rozhrania pre správu produktov, prebiehajúca čiastočne mimo hlavného vývoja pre zákazníkov.",
    dates: "9. 11. – 23. 11.",
    note: "nadväzuje na #6",
    status: "planned",
    left: 68.06,
    width: 20.83,
  },
  {
    id: 8,
    name: "Testovanie a nasadenie",
    description: "Finálne odlaďovanie chýb na rôznych zariadeniach a nasadenie ostrej verzie webu na produkčný server.",
    dates: "24. 11. – 1. 12.",
    note: "nadväzuje na #7 · koniec projektu",
    status: "planned",
    left: 88.89,
    width: 11.11,
  },
];

const SOLID_FILL: Record<Status, string> = {
  done: "bg-emerald-600",
  current: "bg-amber-500",
  planned: "border-2 border-forest-200 bg-forest-50",
};

const DASHED_FILL: Record<Status, string> = {
  done: "border-2 border-dashed border-emerald-500 bg-emerald-50",
  current: "border-2 border-dashed border-amber-500 bg-amber-50",
  planned: "border-2 border-dashed border-forest-300 bg-forest-50",
};

function barClass(task: Task) {
  const fill = task.parallel ? DASHED_FILL[task.status] : SOLID_FILL[task.status];
  return `absolute inset-y-0 rounded-md ${fill}`;
}

const LABEL_COL = "w-[260px] sm:w-[300px]";

export default function GanttChart() {
  return (
    <section id="gantt" className="bg-forest-50 py-24">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <Reveal className="max-w-2xl">
          <h2 className="font-display text-4xl font-semibold tracking-tight text-forest-950">
            Ganttov diagram
          </h2>
          <p className="mt-5 leading-relaxed text-forest-700">
            Rozdelenie úloh a časový plán vývoja – od inicializácie repozitára po nasadenie na
            produkčný server. 7 z 8 úloh tvorí kritickú cestu; návrh databázy (#3) prebieha
            súbežne s vylepšovaním UI/UX a kritickú cestu nepredlžuje.
          </p>
        </Reveal>

        <Reveal delayMs={100}>
          <div className="mt-12 overflow-x-auto rounded-2xl border border-forest-100 bg-white p-6">
            <div className="min-w-[920px]">
              {/* časová os */}
              <div className="flex pb-3">
                <div className={`${LABEL_COL} shrink-0`} />
                <div className="relative h-4 flex-1">
                  {TICKS.map((tick, index) => (
                    <span
                      key={tick.label}
                      className="absolute top-0 whitespace-nowrap text-[11px] font-medium text-forest-400"
                      style={{
                        left: `${tick.pct}%`,
                        transform:
                          index === 0
                            ? "translateX(0%)"
                            : index === TICKS.length - 1
                              ? "translateX(-100%)"
                              : "translateX(-50%)",
                      }}
                    >
                      {tick.label}
                    </span>
                  ))}
                </div>
              </div>

              {TASKS.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center border-t border-forest-100 py-3"
                >
                  <div className={`${LABEL_COL} shrink-0 pr-4`}>
                    <p className="text-sm font-medium text-forest-950">
                      {task.id}. {task.name}
                    </p>
                    <p className="mt-0.5 text-xs leading-snug text-forest-600">
                      {task.description}
                    </p>
                    <p className="mt-1 text-[11px] text-forest-400">
                      {task.dates} · {task.note}
                    </p>
                  </div>
                  <div className="relative h-6 flex-1">
                    <div
                      style={{ left: `${task.left}%`, width: `${task.width}%` }}
                      className={barClass(task)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delayMs={150}>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-forest-600">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-5 rounded-sm bg-emerald-600" aria-hidden="true" />
              Odovzdané
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-5 rounded-sm bg-amber-500" aria-hidden="true" />
              Aktuálny termín
            </span>
            <span className="inline-flex items-center gap-2">
              <span
                className="h-2.5 w-5 rounded-sm border-2 border-forest-200 bg-forest-50"
                aria-hidden="true"
              />
              Plánované
            </span>
            <span className="inline-flex items-center gap-2">
              <span
                className="h-2.5 w-5 rounded-sm border-2 border-dashed border-forest-300 bg-forest-50"
                aria-hidden="true"
              />
              Súbežná úloha (mimo kritickej cesty)
            </span>
          </div>
          <p className="mt-3 text-xs text-forest-400">
            Kritická cesta: #1 → #2 → #4 → #5 → #6 → #7 → #8. Úloha #3 (návrh databázy) beží
            súbežne s #2 a projekt nepredlžuje, aj keby trvala dlhšie.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

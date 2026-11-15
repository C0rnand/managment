/**
 * Spoločný harmonogram projektu Tatra Budič (TABU).
 *
 * JEDINÉ miesto, kde sa upravujú dátumy a stav úloh. Číta ho:
 *   • components/GanttChart.tsx   – pozície pruhov a časová os sa dopočítajú z dátumov,
 *   • lib/businessCaseContent.ts  – časť „Časová uskutočniteľnosť“ (počty dní, posun, rezerva).
 *
 * Ako posunúť termín: zmeň `start` / `end` (a prípadne `status`) a pôvodný termín nechaj
 * v `baseline` – diagram potom sám ukáže, o koľko sa úloha posunula. Dátumy sa píšu ako
 * "RRRR-MM-DD" a `end` je POSLEDNÝ deň úlohy (vrátane). Rovnako zmeň STATUS_DATE, keď
 * aktualizuješ stav (zvislá čiara „Stav k …“ v diagrame).
 */

export type TaskStatus = "done" | "current" | "planned";

export interface DateRange {
  /** prvý deň, "RRRR-MM-DD" */
  start: string;
  /** posledný deň (vrátane), "RRRR-MM-DD" */
  end: string;
}

export interface ScheduleTask extends DateRange {
  id: number;
  name: string;
  description: string;
  status: TaskStatus;
  /** krátka poznámka k nadväznosti */
  note: string;
  /** true = súbežná úloha, nie je na kritickej ceste */
  parallel?: boolean;
  /** pôvodný termín pred posunom – diagram ho ukáže ako „pôvodne …“ a tenkú čiaru */
  baseline?: DateRange;
}

/**
 * Dátum, ku ktorému platí stav úloh (v diagrame zvislá čiara „Stav k …“). Teraz 23. 11. 2026:
 * diagram ukazuje projekt, akoby bolo hotové všetko po tento dátum (úlohy #1 – #6, vrátane
 * pripojenia databázy). Ak chceš ukázať skutočný dnešný stav, vráť sem dnešný dátum a úlohe #6
 * nastav `status: "current"`.
 */
export const STATUS_DATE = "2026-11-23";

export const TASKS: ScheduleTask[] = [
  {
    id: 1,
    name: "Základný web",
    description:
      "Inicializácia Next.js repozitára, nastavenie prostredia a vytvorenie hrubej kostry podstránok.",
    start: "2026-09-21",
    end: "2026-09-27",
    status: "done",
    note: "štart projektu",
  },
  {
    id: 2,
    name: "Vylepšenie UI/UX",
    description: "Pridanie animácií, responzívneho dizajnu a doladenie globálnych štýlov webu.",
    start: "2026-09-28",
    end: "2026-10-11",
    status: "done",
    note: "nadväzuje na #1",
  },
  {
    id: 3,
    name: "Návrh databázy",
    description: "Teoretický návrh relačnej SQL schémy pre produkty a objednávky.",
    start: "2026-09-28",
    end: "2026-10-11",
    status: "done",
    parallel: true,
    note: "súbežne s #2 · mimo kritickej cesty",
  },
  {
    id: 4,
    name: "Integrácia 3 príchutí",
    description:
      "Nasadenie vizuálov plechoviek (Classic, Exotic, Tropical) a vytvorenie produktových detailov.",
    start: "2026-10-12",
    end: "2026-10-18",
    status: "done",
    note: "nadväzuje na #2, #3",
  },
  {
    id: 5,
    name: "Nákupný košík",
    description:
      "Programovanie logiky košíka a používateľského rozhrania pre objednávkový formulár.",
    start: "2026-10-19",
    end: "2026-10-25",
    status: "done",
    note: "nadväzuje na #4 · formulár hotový, bez platieb",
  },
  {
    id: 6,
    name: "Vývoj API a DB",
    description:
      "Vytvorenie serverových ciest a reálne prepojenie nakódovaného frontendu s databázou.",
    start: "2026-11-09",
    end: "2026-11-23",
    status: "done",
    note: "nadväzuje na #5 · databáza pripojená 23. 11.",
    baseline: { start: "2026-10-26", end: "2026-11-08" },
  },
  {
    id: 7,
    name: "Administrátorský panel",
    description:
      "Implementácia zabezpečeného rozhrania pre správu produktov, prebiehajúca čiastočne mimo hlavného vývoja pre zákazníkov.",
    start: "2026-11-24",
    end: "2026-12-07",
    status: "planned",
    note: "nadväzuje na #6",
    baseline: { start: "2026-11-09", end: "2026-11-23" },
  },
  {
    id: 8,
    name: "Testovanie a nasadenie",
    description:
      "Finálne odlaďovanie chýb na rôznych zariadeniach a nasadenie ostrej verzie webu na produkčný server.",
    start: "2026-12-08",
    end: "2026-12-15",
    status: "planned",
    note: "nadväzuje na #7 · koniec projektu",
    baseline: { start: "2026-11-24", end: "2026-12-01" },
  },
];

/** Kritická cesta (id úloh v poradí). Úloha #3 beží súbežne a cestu nepredlžuje. */
export const CRITICAL_PATH = [1, 2, 4, 5, 6, 7, 8] as const;

// ---------------------------------------------------------------------------
// Výpočty nad dátumami (všetko v UTC, takže letný čas nič nepokazí)
// ---------------------------------------------------------------------------

const DAY_MS = 86_400_000;

function toDay(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / DAY_MS;
}

function fromDay(day: number): string {
  return new Date(day * DAY_MS).toISOString().slice(0, 10);
}

/** Prvý a posledný deň celého harmonogramu – odvodené z úloh, nemusia sa písať zvlášť. */
export const SCHEDULE_START: string = TASKS.map((task) => task.start).sort()[0];
export const SCHEDULE_END: string = TASKS.map((task) => task.end).sort().slice(-1)[0];

/** Počet dní od prvého po posledný deň (vrátane). */
export const TOTAL_DAYS: number = toDay(SCHEDULE_END) - toDay(SCHEDULE_START) + 1;

/** Index dňa od začiatku harmonogramu (prvý deň = 0). */
export function dayIndex(iso: string): number {
  return toDay(iso) - toDay(SCHEDULE_START);
}

/** Počet dní prepočítaný na pozíciu na osi v % (0–100). */
export function pctOf(days: number): number {
  return (days / TOTAL_DAYS) * 100;
}

export function addDays(iso: string, days: number): string {
  return fromDay(toDay(iso) + days);
}

/** Počet dní od `from` po `to` (to − from). */
export function daysBetween(from: string, to: string): number {
  return toDay(to) - toDay(from);
}

/** "2026-11-09" → "9. 11." */
export function formatDM(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${d}. ${m}.`;
}

/** "2026-11-09" → "9. 11. 2026" */
export function formatDMY(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d}. ${m}. ${y}`;
}

/** → "9. 11. – 23. 11." */
export function formatRange(start: string, end: string): string {
  return `${formatDM(start)} – ${formatDM(end)}`;
}

/** Trvanie v dňoch (vrátane prvého aj posledného dňa). */
export function durationDays(range: DateRange): number {
  return dayIndex(range.end) - dayIndex(range.start) + 1;
}

/** Ľavý okraj a šírka pruhu v % šírky osi. */
export function barPosition(range: DateRange): { left: number; width: number } {
  return { left: pctOf(dayIndex(range.start)), width: pctOf(durationDays(range)) };
}

/** O koľko dní sa začiatok úlohy posunul oproti pôvodnému termínu. */
export function shiftDays(task: ScheduleTask): number {
  return task.baseline ? dayIndex(task.start) - dayIndex(task.baseline.start) : 0;
}

/** Popisky osi: každých 14 dní od začiatku + posledný deň projektu na pravom okraji. */
export function axisTicks(): { pct: number; label: string }[] {
  const ticks: { pct: number; label: string }[] = [];
  for (let i = 0; i < TOTAL_DAYS - 7; i += 14) {
    ticks.push({ pct: pctOf(i), label: formatDM(addDays(SCHEDULE_START, i)) });
  }
  ticks.push({ pct: 100, label: formatDM(SCHEDULE_END) });
  return ticks;
}

/** Slovenské desatinné číslo: 61.6 → "61,6". */
export function sk(value: number): string {
  return String(value).replace(".", ",");
}

/** Súhrnné čísla pre text o časovej uskutočniteľnosti a úvod Ganttovho diagramu. */
export function scheduleStats() {
  const total = TASKS.length;
  const done = TASKS.filter((task) => task.status === "done");
  const current = TASKS.filter((task) => task.status === "current");
  const planned = TASKS.filter((task) => task.status === "planned");
  const shifted = TASKS.filter((task) => task.baseline);

  // dni od začiatku po STATUS_DATE vrátane a zvyšok do konca harmonogramu
  const elapsedDays = Math.min(TOTAL_DAYS, dayIndex(STATUS_DATE) + 1);
  const remainingDays = TOTAL_DAYS - elapsedDays;

  const originalEnd: string = TASKS.map((task) => task.baseline?.end ?? task.end)
    .sort()
    .slice(-1)[0];

  // úlohy, ktoré mali byť podľa pôvodného plánu k STATUS_DATE už hotové
  const dueByBaseline = TASKS.filter((task) => (task.baseline?.end ?? task.end) <= STATUS_DATE);

  // dni práce, ktoré zostávajú po STATUS_DATE, v každej nehotovej úlohe
  const firstOpenDay = dayIndex(STATUS_DATE) + 1;
  const openDays = TASKS.filter((task) => task.status !== "done").map((task) => ({
    id: task.id,
    days: Math.max(0, dayIndex(task.end) - Math.max(dayIndex(task.start), firstOpenDay) + 1),
  }));

  return {
    total,
    doneCount: done.length,
    currentCount: current.length,
    plannedCount: planned.length,
    elapsedDays,
    remainingDays,
    elapsedPct: Math.round((elapsedDays / TOTAL_DAYS) * 1000) / 10,
    donePct: Math.round((done.length / total) * 1000) / 10,
    originalEnd,
    endShiftDays: daysBetween(originalEnd, SCHEDULE_END),
    shiftedIds: shifted.map((task) => task.id),
    dueByBaselineCount: dueByBaseline.length,
    openDays,
  };
}

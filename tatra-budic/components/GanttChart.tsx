import Reveal from "./Reveal";
import {
  CRITICAL_PATH,
  SCHEDULE_END,
  STATUS_DATE,
  TASKS,
  addDays,
  axisTicks,
  barPosition,
  dayIndex,
  formatDM,
  formatDMY,
  formatRange,
  pctOf,
  scheduleStats,
  type ScheduleTask,
  type TaskStatus,
} from "@/lib/schedule";

// Časová os je presná (dni od začiatku harmonogramu), nie zarovnaná na celé týždne –
// úlohy nemajú rovnako dlhé fázy. Dátumy, stav a posuny sa upravujú v lib/schedule.ts,
// tento súbor ich len vykresľuje.

const SOLID_FILL: Record<TaskStatus, string> = {
  done: "bg-emerald-600",
  current: "bg-amber-500",
  planned: "border-2 border-forest-200 bg-forest-50",
};

const DASHED_FILL: Record<TaskStatus, string> = {
  done: "border-2 border-dashed border-emerald-500 bg-emerald-50",
  current: "border-2 border-dashed border-amber-500 bg-amber-50",
  planned: "border-2 border-dashed border-forest-300 bg-forest-50",
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  done: "hotovo",
  current: "prebieha",
  planned: "plánované",
};

function barClass(task: ScheduleTask) {
  const fill = task.parallel ? DASHED_FILL[task.status] : SOLID_FILL[task.status];
  return `absolute inset-y-0 rounded-md ${fill}`;
}

const LABEL_COL = "w-[260px] sm:w-[300px]";

export default function GanttChart() {
  const stats = scheduleStats();
  const ticks = axisTicks();
  // zvislá čiara „Stav k …“ stojí v strede dňa, ku ktorému platí stav úloh
  const todayPct = pctOf(dayIndex(STATUS_DATE) + 0.5);
  const currentIds = TASKS.filter((task) => task.status === "current").map((task) => `#${task.id}`);
  const nextPlanned = TASKS.find((task) => task.status === "planned");
  const shiftedIds = stats.shiftedIds.map((id) => `#${id}`).join(", ");

  // prestávka na kritickej ceste medzi #5 a #6 (ak nejaká vznikla posunom)
  const task5 = TASKS.find((task) => task.id === 5);
  const task6 = TASKS.find((task) => task.id === 6);
  const dbDone = task6?.status === "done";
  const gap =
    task5 && task6 && dayIndex(task6.start) - dayIndex(task5.end) > 1
      ? formatRange(addDays(task5.end, 1), addDays(task6.start, -1))
      : null;

  return (
    <section id="gantt" className="bg-forest-50 py-24">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <Reveal className="max-w-2xl">
          <h2 className="font-display text-4xl font-semibold tracking-tight text-forest-950">
            Ganttov diagram
          </h2>
          <p className="mt-5 leading-relaxed text-forest-700">
            Rozdelenie úloh a časový plán vývoja – od inicializácie repozitára po nasadenie na
            produkčný server. Stav k {formatDMY(STATUS_DATE)}: {stats.doneCount} z {stats.total}{" "}
            úloh je hotových
            {currentIds.length > 0
              ? `, prebieha ${currentIds.join(", ")}`
              : nextPlanned
                ? `, nasleduje #${nextPlanned.id}`
                : ""}
            .
          </p>
          {stats.shiftedIds.length > 0 && (
            <p className="mt-3 leading-relaxed text-forest-700">
              Harmonogram sme posunuli: na cvičení 9. 11. sme prezentovali nový dizajn a príchute a
              databázu {dbDone ? "sme pripojili" : "pripájame"} až po ňom
              {task6 ? ` (${formatDM(task6.end)})` : ""}, preto sa úlohy {shiftedIds}{" "}
              {dbDone ? "posunuli" : "posúvajú"} približne o dva týždne a projekt končí{" "}
              {formatDMY(SCHEDULE_END)} (pôvodne {formatDMY(stats.originalEnd)}).{" "}
              {CRITICAL_PATH.length} z {stats.total} úloh tvorí kritickú cestu; návrh databázy (#3)
              beží súbežne s vylepšovaním UI/UX a kritickú cestu nepredlžuje.
            </p>
          )}
        </Reveal>

        <Reveal delayMs={100}>
          <p className="mt-10 text-xs text-forest-500 lg:hidden">
            Diagram sa dá posúvať do strany.
          </p>
          <div className="mt-3 overflow-x-auto rounded-2xl border border-forest-100 bg-white p-6 lg:mt-12">
            <div className="min-w-[920px]">
              {/* značka „Stav k …“ */}
              <div className="flex pb-1">
                <div className={`${LABEL_COL} shrink-0`} />
                <div className="relative h-5 flex-1">
                  <span
                    className="absolute top-0 -translate-x-1/2 whitespace-nowrap rounded-full bg-rose-600 px-2 py-1 text-[10px] font-semibold leading-none text-white"
                    style={{ left: `${todayPct}%` }}
                  >
                    Stav k {formatDM(STATUS_DATE)}
                  </span>
                </div>
              </div>

              {/* časová os */}
              <div className="flex pb-3">
                <div className={`${LABEL_COL} shrink-0`} />
                <div className="relative h-4 flex-1">
                  {ticks.map((tick, index) => (
                    <span
                      key={tick.label}
                      className="absolute top-0 whitespace-nowrap text-[11px] font-medium text-forest-400"
                      style={{
                        left: `${tick.pct}%`,
                        transform:
                          index === 0
                            ? "translateX(0%)"
                            : index === ticks.length - 1
                              ? "translateX(-100%)"
                              : "translateX(-50%)",
                      }}
                    >
                      {tick.label}
                    </span>
                  ))}
                </div>
              </div>

              {TASKS.map((task) => {
                const bar = barPosition(task);
                return (
                  <div
                    key={task.id}
                    className="flex items-stretch border-t border-forest-100"
                  >
                    <div className={`${LABEL_COL} shrink-0 py-3 pr-4`}>
                      <p className="text-sm font-medium text-forest-950">
                        {task.id}. {task.name}
                      </p>
                      <p className="mt-0.5 text-xs leading-snug text-forest-600">
                        {task.description}
                      </p>
                      <p className="mt-1 text-[11px] text-forest-400">
                        {formatRange(task.start, task.end)} · {task.note}
                      </p>
                      {task.baseline && (
                        <p className="mt-0.5 text-[11px] font-medium text-amber-700">
                          pôvodne {formatRange(task.baseline.start, task.baseline.end)}
                        </p>
                      )}
                    </div>

                    <div className="relative flex-1">
                      <div className="absolute inset-x-0 top-1/2 h-6 -translate-y-1/2">
                        {task.baseline && (
                          <div
                            className="absolute top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-forest-300"
                            style={{
                              left: `${barPosition(task.baseline).left}%`,
                              width: `${barPosition(task.baseline).width}%`,
                            }}
                            aria-hidden="true"
                          />
                        )}
                        <div
                          role="img"
                          aria-label={`${task.name}, ${formatRange(task.start, task.end)}, ${STATUS_LABEL[task.status]}`}
                          style={{ left: `${bar.left}%`, width: `${bar.width}%` }}
                          className={barClass(task)}
                        />
                      </div>
                      {/* zvislá čiara „Stav k …“ cez všetky riadky */}
                      <div
                        className="pointer-events-none absolute inset-y-0 w-px bg-rose-600/80"
                        style={{ left: `${todayPct}%` }}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>

        <Reveal delayMs={150}>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-forest-600">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-5 rounded-sm bg-emerald-600" aria-hidden="true" />
              Hotovo
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-5 rounded-sm bg-amber-500" aria-hidden="true" />
              Prebieha
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
            <span className="inline-flex items-center gap-2">
              <span className="h-0.5 w-5 rounded-full bg-forest-300" aria-hidden="true" />
              Pôvodný termín (pred posunom)
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3.5 w-0.5 rounded-full bg-rose-600" aria-hidden="true" />
              Stav k {formatDM(STATUS_DATE)}
            </span>
          </div>
          <p className="mt-3 text-xs text-forest-400">
            Kritická cesta: {CRITICAL_PATH.map((id) => `#${id}`).join(" → ")}. Úloha #3 (návrh
            databázy) beží súbežne s #2 a projekt nepredlžuje, aj keby trvala dlhšie.
            {gap ? ` Medzi #5 a #6 je v pláne prestávka (${gap}), ktorú zatiaľ neobsadzuje žiadna úloha.` : ""}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

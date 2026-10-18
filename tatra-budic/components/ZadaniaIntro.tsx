import Reveal from "./Reveal";

/**
 * Shared umbrella heading for the "Zadania" nav group. Realizácia (Timeline),
 * KPI (KPISection), SWOT and – later – the Gantt diagram all live one after
 * another right below this intro; the top nav links to #zadania (this
 * section) instead of listing each sub-deliverable separately.
 */
export default function ZadaniaIntro() {
  return (
    <section id="zadania" className="bg-white pt-24 pb-4">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <Reveal className="max-w-2xl">
          <h2 className="font-display text-4xl font-semibold tracking-tight text-forest-950">
            Zadania
          </h2>
          <p className="mt-5 leading-relaxed text-forest-700">
            Priebežné výstupy a analýzy, ktoré počas semestra postupne pribúdajú: realizácia
            projektu, sledované KPI metriky, SWOT analýza a Ganttov diagram.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

import Reveal from "./Reveal";

const QUADRANTS = [
  {
    key: "S",
    label: "Silné stránky",
    tone: "emerald",
    items: [
      "Jedinečná pozícia na trhu – bylinný energetický nápoj z Vysokých Tatier namiesto syntetických prísad bežných značiek.",
      "Next.js web s pripraveným reálnym napojením na Supabase databázu priamo v kóde – stačí ju pripojiť a appka automaticky prejde z testovacích dát na skutočné objednávky.",
      "Hotová vizuálna identita a 3 odlišné príchute (Classic, Exotic, Tropical).",
      "Nízke prevádzkové náklady študentského tímu a rýchla iterácia webu.",
    ],
  },
  {
    key: "W",
    label: "Slabé stránky",
    tone: "ink",
    items: [
      "Chýbajúca reálna výrobná kapacita – zatiaľ žiadny zazmluvnený výrobca ani stáčanie nápoja.",
      "Nulová znalosť značky na trhu – žiadna história ani recenzie oproti etablovaným hráčom.",
      "Obmedzený rozpočet – chýbajú prostriedky na platenú reklamu, influencerov či distribúciu do obchodov.",
      "Reálna databáza (Supabase) je zatiaľ len pripravená v kóde, nie pripojená; administrácia a prihlasovanie (Modul 3) sú zatiaľ len naplánované, nie hotové.",
    ],
  },
  {
    key: "O",
    label: "Príležitosti",
    tone: "amber",
    items: [
      "Rastúci dopyt po „čistých“ energetických nápojoch s prírodnými zložkami.",
      "Univerzita ako hotová testovacia skupina – stovky potenciálnych zákazníkov priamo na kampuse.",
      "Marketingový príbeh „Made in Slovensko“ a rastúca podpora lokálnych výrobcov.",
      "Priamy predaj cez vlastný web (e-shop) bez nutnosti získať miesto na regáli v obchode.",
    ],
  },
  {
    key: "T",
    label: "Hrozby",
    tone: "rose",
    items: [
      "Silní etablovaní konkurenti (Red Bull, Monster, Tiger) s obrovským marketingovým rozpočtom.",
      "Legislatívne požiadavky na potravinársky výrobok – certifikácia, označovanie, zdravotné tvrdenia.",
      "Vysoké náklady na získanie zákazníka v preplnenej kategórii energetických nápojov.",
      "Sezónna dostupnosť a cena prírodných tatranských bylín ako riziko pre dodávateľský reťazec.",
    ],
  },
] as const;

const TONE_STYLES: Record<(typeof QUADRANTS)[number]["tone"], { card: string; badge: string; dot: string }> = {
  emerald: {
    card: "border-emerald-200 bg-emerald-50",
    badge: "bg-emerald-500 text-forest-950",
    dot: "bg-emerald-500",
  },
  ink: {
    card: "border-ink-200 bg-ink-50",
    badge: "bg-ink-700 text-white",
    dot: "bg-ink-400",
  },
  amber: {
    card: "border-amber-200 bg-amber-50",
    badge: "bg-amber-500 text-forest-950",
    dot: "bg-amber-500",
  },
  rose: {
    card: "border-rose-200 bg-rose-50",
    badge: "bg-rose-600 text-white",
    dot: "bg-rose-500",
  },
};

export default function SWOT() {
  return (
    <section id="swot" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <Reveal className="max-w-2xl">
          <h2 className="font-display text-4xl font-semibold tracking-tight text-forest-950">
            SWOT analýza
          </h2>
          <p className="mt-5 leading-relaxed text-forest-700">
            Kľúčové faktory, ktoré ovplyvňujú projekt Tatra Budič – pozitívne aj negatívne,
            interné aj externé.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {QUADRANTS.map((quadrant, index) => {
            const tone = TONE_STYLES[quadrant.tone];
            return (
              <Reveal key={quadrant.key} delayMs={index * 100}>
                <article className={`h-full rounded-2xl border p-7 ${tone.card}`}>
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-sm font-semibold ${tone.badge}`}
                      aria-hidden="true"
                    >
                      {quadrant.key}
                    </span>
                    <h3 className="font-display text-lg font-semibold text-forest-950">
                      {quadrant.label}
                    </h3>
                  </div>
                  <ul className="mt-5 space-y-3">
                    {quadrant.items.map((item) => (
                      <li key={item} className="flex gap-3 text-sm leading-relaxed text-forest-700">
                        <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${tone.dot}`} aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

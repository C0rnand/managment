import HeroVideo from "./HeroVideo";

const ANNOTATION =
  "TABU (Tatra Budič) je prírodný energetický nápoj z bylinných extraktov Vysokých Tatier, ktorý dodáva udržateľnú energiu bez umelých látok a náhleho poklesu výkonu.";

const QUICK_FACTS = [
  { value: "100 %", label: "prírodné ingrediencie" },
  { value: "4", label: "tatranské byliny a extrakty" },
  { value: "0", label: "umelých farbív" },
];

export default function Hero() {
  return (
    <section id="domov" className="relative flex min-h-screen items-center overflow-hidden bg-forest-950 text-white">
      <HeroVideo />

      {/* Legibility + brand-tone layers over the video */}
      <div className="absolute inset-0 bg-forest-950/55" />
      <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/35 to-forest-950/10" />
      <div className="absolute inset-0 bg-radial-glow" />

      <div className="relative mx-auto w-full max-w-6xl px-6 pt-28 pb-20 sm:px-8">
        <div className="max-w-xl">
          <div className="flex items-center gap-3 animate-rise-in">
            <img src="/logo-mark.svg" alt="" aria-hidden="true" className="h-11 w-11" />
            <p className="text-sm text-forest-200">
              Univerzitný startupový projekt s akronymom <span className="font-semibold text-white">TABU</span>.
            </p>
          </div>

          <h1 className="mt-6 animate-rise-in font-display text-6xl font-semibold leading-[1.02] tracking-tight sm:text-7xl [animation-delay:80ms]">
            Tatra Budič
          </h1>
          <p className="mt-3 animate-rise-in font-display text-xl font-medium text-emerald-300 [animation-delay:150ms]">
            Energia priamo z Tatier.
          </p>

          <p className="mt-6 max-w-md animate-rise-in text-base leading-relaxed text-forest-100/90 [animation-delay:220ms]">
            {ANNOTATION}
          </p>

          <div className="mt-9 flex flex-wrap gap-4 animate-rise-in [animation-delay:300ms]">
            <a
              href="#kontakt"
              className="rounded-full bg-emerald-500 px-7 py-3.5 text-sm font-semibold text-forest-950 transition-transform hover:-translate-y-0.5 hover:bg-emerald-400"
            >
              Objednať
            </a>
            <a
              href="#produkt"
              className="rounded-full border border-white/25 px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Pozrieť zloženie
            </a>
          </div>

          <dl className="mt-12 flex max-w-md animate-rise-in gap-6 border-t border-white/15 pt-6 [animation-delay:380ms]">
            {QUICK_FACTS.map((fact) => (
              <div key={fact.label}>
                <dt className="font-display text-2xl font-semibold text-white">{fact.value}</dt>
                <dd className="mt-1 text-xs leading-snug text-forest-300">{fact.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

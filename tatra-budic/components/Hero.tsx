import MountainBackground from "./MountainBackground";

const ANNOTATION =
  "TABU (Tatra Budič) je prírodný energetický nápoj z bylinných extraktov Vysokých Tatier, ktorý dodáva udržateľnú energiu bez umelých látok a náhleho poklesu výkonu.";

export default function Hero() {
  return (
    <section id="domov" className="relative overflow-hidden bg-forest-950 text-white">
      <MountainBackground />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 sm:px-8 md:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
        <div>
          <p className="animate-rise-in text-sm text-forest-300">
            Univerzitný semestrálny projekt s akronymom TABU.
          </p>

          <h1 className="mt-5 animate-rise-in font-display text-5xl font-semibold leading-[1.05] sm:text-6xl [animation-delay:80ms]">
            Tatra Budič
          </h1>
          <p className="mt-1 animate-rise-in font-display text-2xl italic text-forest-200 sm:text-3xl [animation-delay:150ms]">
            Energia priamo z Tatier.
          </p>

          <p className="mt-6 max-w-md animate-rise-in text-base leading-relaxed text-forest-100/90 [animation-delay:220ms]">
            {ANNOTATION}
          </p>

          <div className="mt-9 flex flex-wrap gap-4 animate-rise-in [animation-delay:300ms]">
            <a
              href="#kontakt"
              className="rounded-full bg-emerald-400 px-7 py-3.5 text-sm font-medium text-forest-950 transition-transform hover:-translate-y-0.5 hover:bg-emerald-300"
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
        </div>

        <div className="flex justify-center lg:justify-end">
          <img
            src="/product-can.svg"
            alt="Plechovka nápoja Tatra Budič s motívom tatranských štítov"
            className="w-48 animate-float drop-shadow-2xl sm:w-60 lg:w-72"
          />
        </div>
      </div>
    </section>
  );
}

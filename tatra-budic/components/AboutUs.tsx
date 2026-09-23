const STATS = [
  { value: "100 %", label: "prírodné suroviny" },
  { value: "4", label: "tatranské byliny a extrakty" },
  { value: "0", label: "umelých farbív" },
  { value: "330 ml", label: "v jednej plechovke" },
];

export default function AboutUs() {
  return (
    <section id="o-nas" className="bg-forest-950 py-24 text-white">
      <div className="mx-auto grid max-w-6xl gap-16 px-6 sm:px-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <h2 className="font-display text-4xl font-semibold">Odkiaľ sme prišli</h2>
          <p className="mt-6 leading-relaxed text-forest-100/90">
            Tatra Budič je univerzitný startupový projekt postavený na jednoduchej myšlienke:
            energetický nápoj môže byť aj prírodný. Recept sme poskladali z bylinkárskych
            tradícií našich starých rodičov z podhoria Vysokých Tatier a spojili sme ich
            s modernými prísadami – guaranou a extraktom zo zeleného čaju.
          </p>
          <p className="mt-4 leading-relaxed text-forest-100/90">
            Vznikol pre študentov pred skúškovým obdobím, hráčov počas dlhých herných relácií,
            športovcov pri tréningu aj turistov na ceste na vrchol. Naším cieľom je ponúknuť
            alternatívu k sladeným energetickým nápojom plným umelých látok.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-10">
          {STATS.map((stat) => (
            <div key={stat.label} className="border-t border-white/15 pt-4">
              <p className="font-display text-4xl font-semibold text-emerald-300">{stat.value}</p>
              <p className="mt-1.5 text-sm text-forest-200">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

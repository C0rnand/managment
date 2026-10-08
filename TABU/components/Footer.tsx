const LINKS = [
  { href: "#domov", label: "Domov" },
  { href: "#produkt", label: "Produkt" },
  { href: "#ponuka", label: "Ponuka" },
  { href: "#vyhody", label: "Výhody" },
  { href: "#o-nas", label: "O nás" },
  { href: "#tim", label: "Náš tím" },
  { href: "#realizacia", label: "Realizácia" },
  { href: "#kpi", label: "KPI" },
  { href: "#kontakt", label: "Kontakt" },
];

export default function Footer() {
  return (
    <footer className="bg-forest-950 py-12 text-forest-300">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <img src="/logo-mark.svg" alt="" aria-hidden="true" className="h-9 w-9" />
              <span className="font-display text-lg font-semibold text-white">Tatra Budič</span>
            </div>
            <p className="mt-3 max-w-xs text-sm">
              Prírodný energetický nápoj z bylín Vysokých Tatier. Univerzitný startupový
              projekt (TABU).
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:flex sm:flex-wrap sm:gap-x-6">
            {LINKS.map((link) => (
              <a key={link.href} href={link.href} className="transition-colors hover:text-white">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="text-sm">
            <p>info@tatrabudic.sk</p>
            <p className="mt-1">Vysoké Tatry, Slovensko</p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-forest-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Tatra Budič (TABU). Všetky práva vyhradené.</p>
          <p>Vyvinuté v spolupráci s AI asistentom Claude ako univerzitný semestrálny projekt postavený na Next.js a Tailwind CSS.</p>
        </div>
      </div>
    </footer>
  );
}

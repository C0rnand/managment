const LINKS = [
  { href: "#domov", label: "Domov" },
  { href: "#produkt", label: "Produkt" },
  { href: "#vyhody", label: "Výhody" },
  { href: "#o-nas", label: "O nás" },
  { href: "#kontakt", label: "Kontakt" },
];

export default function Footer() {
  return (
    <footer className="bg-forest-950 py-12 text-forest-300">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400 font-display text-sm font-semibold text-forest-950">
                T
              </span>
              <span className="font-display text-lg font-semibold text-white">Tatra Budič</span>
            </div>
            <p className="mt-3 max-w-xs text-sm">
              Prírodný energetický nápoj z bylín Vysokých Tatier. Univerzitný startupový
              projekt (TABU).
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
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
          <p>Vytvorené ako univerzitný semestrálny projekt · Next.js a Tailwind CSS</p>
        </div>
      </div>
    </footer>
  );
}

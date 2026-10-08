"use client";

import { useEffect, useState } from "react";

const LINKS = [
  { href: "#produkt", label: "Produkt" },
  { href: "#ponuka", label: "Ponuka" },
  { href: "#vyhody", label: "Výhody" },
  { href: "#o-nas", label: "O nás" },
  { href: "#tim", label: "Tím" },
  { href: "#realizacia", label: "Realizácia" },
  { href: "#kpi", label: "KPI" },
  { href: "#kontakt", label: "Kontakt" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Transparent-over-hero → frosted-on-scroll is the navbar's one animated
  // moment; it answers the person's own scrolling rather than running on a
  // timer, so it stays within the "motion responds to an action" guidance.
  const barTone = scrolled || open
    ? "border-forest-100 bg-white/80 backdrop-blur-md"
    : "border-transparent bg-transparent";
  const linkTone = scrolled || open ? "text-forest-700 hover:text-forest-950" : "text-white/80 hover:text-white";
  const wordmarkTone = scrolled || open ? "text-forest-950" : "text-white";

  return (
    <header className={`fixed top-0 z-50 w-full border-b transition-colors duration-300 ${barTone}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5 sm:px-8">
        <a href="#domov" className="flex items-center gap-2.5">
          <img src="/logo-mark.svg" alt="" aria-hidden="true" className="h-9 w-9" />
          <span className={`font-display text-lg font-semibold tracking-tight transition-colors ${wordmarkTone}`}>
            TABU
          </span>
        </a>

        <nav className="hidden items-center gap-6 lg:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${linkTone}`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="#kontakt"
          className="hidden rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-forest-950 transition-colors hover:bg-emerald-400 lg:inline-flex"
        >
          Objednať
        </a>

        <button
          type="button"
          aria-label={open ? "Zavrieť menu" : "Otvoriť menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors lg:hidden ${wordmarkTone}`}
        >
          {open ? (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-forest-100 bg-white px-6 py-4 lg:hidden">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm text-forest-700 hover:bg-forest-50"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#kontakt"
            onClick={() => setOpen(false)}
            className="mt-2 rounded-full bg-forest-950 px-5 py-2.5 text-center text-sm font-medium text-white"
          >
            Objednať
          </a>
        </nav>
      )}
    </header>
  );
}

"use client";

import { useState } from "react";

const LINKS = [
  { href: "#domov", label: "Domov" },
  { href: "#produkt", label: "Produkt" },
  { href: "#vyhody", label: "Výhody" },
  { href: "#o-nas", label: "O nás" },
  { href: "#kontakt", label: "Kontakt" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-forest-100 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
        <a href="#domov" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-950 font-display text-sm font-semibold text-white">
            T
          </span>
          <span className="font-display text-lg font-semibold text-forest-950">
            Tatra Budič
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-forest-700 transition-colors hover:text-forest-950"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="#kontakt"
          className="hidden rounded-full bg-forest-950 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-forest-800 md:inline-flex"
        >
          Objednať
        </a>

        <button
          type="button"
          aria-label={open ? "Zavrieť menu" : "Otvoriť menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-forest-950 md:hidden"
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
        <nav className="flex flex-col gap-1 border-t border-forest-100 bg-white px-6 py-4 md:hidden">
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

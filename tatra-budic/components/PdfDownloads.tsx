import Reveal from "./Reveal";

/**
 * Zadania 5 – 7 (Business case, Finančná analýza, Analýza rizík) sa na webe
 * zobrazujú už len ako tlačidlá na hotové PDF. Súbory PDF ležia v /public a
 * obsluhuje ich priamo Vercel na adrese /<názov>.pdf.
 */
const DOWNLOADS = [
  {
    label: "5. zadanie",
    title: "Business case a uskutočniteľnosť",
    href: "/TABU-5-zadanie-business-case.pdf",
  },
  {
    label: "6. zadanie",
    title: "Finančná analýza",
    href: "/TABU-6-zadanie-financna-analyza.pdf",
  },
  {
    label: "7. zadanie",
    title: "Analýza rizík",
    href: "/TABU-7-zadanie-analyza-rizik.pdf",
  },
];

export default function PdfDownloads() {
  return (
    <section id="zadania-pdf" className="bg-white pb-4 pt-20">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <Reveal>
          <ul className="space-y-4">
            {DOWNLOADS.map((item) => (
              <li
                key={item.href}
                className="flex flex-col gap-5 rounded-2xl border border-forest-100 bg-forest-50 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
                    {item.label}
                  </p>
                  <p className="mt-1 font-display text-xl font-semibold text-forest-950">
                    {item.title}
                  </p>
                </div>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Otvoriť PDF – ${item.label}: ${item.title}`}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-forest-950 px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-forest-800"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                    <path d="M14 3v5h5" />
                    <path d="M9 13h6M9 17h4" />
                  </svg>
                  Otvoriť PDF
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

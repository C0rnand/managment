import Reveal from "./Reveal";

const TEAM = [
  {
    name: "Richard Baran",
    role: "Team Lead / Project Manager",
    Icon: FlagIcon,
  },
  {
    name: "Maximilián Rastislav Petrič",
    role: "Analysis / Research",
    Icon: MagnifierIcon,
  },
  {
    name: "Bohdan Titenko",
    role: "Development / Technology",
    Icon: CodeIcon,
  },
  {
    name: "Vladyslav Humenetskyi",
    role: "Design / Creative",
    Icon: PenIcon,
  },
];

export default function Team() {
  return (
    <section id="tim" className="bg-grain relative overflow-hidden bg-ink-950 py-24 text-white">
      <div className="relative mx-auto max-w-6xl px-6 sm:px-8">
        <Reveal className="max-w-md">
          <h2 className="font-display text-4xl font-semibold tracking-tight">Náš tím</h2>
          <p className="mt-4 leading-relaxed text-ink-200">
            Štyria ľudia, štyri zodpovednosti. Takto je rozdelený tím, ktorý Tatra Budič
            vedie od nápadu po nasadenú aplikáciu.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM.map(({ name, role, Icon }, index) => (
            <Reveal key={name} delayMs={index * 90}>
              <article className="group h-full rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-400/40 hover:bg-white/[0.07]">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300 transition-colors duration-300 group-hover:bg-emerald-400/20">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold leading-snug text-white">
                  {name}
                </h3>
                <p className="mt-1.5 text-sm text-ink-300">{role}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FlagIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 21V4" />
      <path d="M6 4l12 3.2L11 11l7 3.6L6 18" />
    </svg>
  );
}

function MagnifierIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m20 20-4.4-4.4" />
      <path d="M8 10.5h5" />
    </svg>
  );
}

function CodeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m9 7-5 5 5 5" />
      <path d="m15 7 5 5-5 5" />
    </svg>
  );
}

function PenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 20l3.5-1 11-11a2 2 0 0 0-3-3l-11 11L3 19Z" />
      <path d="m13 6 3 3" />
    </svg>
  );
}

const BENEFITS = [
  {
    title: "Prírodné byliny",
    description: "Mäta a horské byliny, ktoré sa v podhorí Tatier zbierajú celé generácie.",
    Icon: LeafIcon,
  },
  {
    title: "Energia bez pádu",
    description: "Guarana a zelený čaj uvoľňujú energiu postupne, bez výkyvov počas dňa.",
    Icon: BoltIcon,
  },
  {
    title: "Slovenská inšpirácia",
    description: "Recept vychádza z bylinkárskych tradícií našich starých rodičov z Tatier.",
    Icon: MountainIcon,
  },
  {
    title: "Udržateľné suroviny",
    description: "Zodpovedne vyberané ingrediencie a recyklovateľná plechovka.",
    Icon: SproutIcon,
  },
];

export default function Benefits() {
  return (
    <section id="vyhody" className="bg-forest-50 py-24">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <h2 className="max-w-md font-display text-4xl font-semibold text-forest-950">
          Načo je to dobré
        </h2>

        <div className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-forest-200 lg:gap-y-0">
          {BENEFITS.map(({ title, description, Icon }) => (
            <div key={title} className="lg:pl-8 lg:first:pl-0">
              <Icon className="h-7 w-7 text-forest-700" />
              <h3 className="mt-4 font-display text-lg font-semibold text-forest-950">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-forest-600">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LeafIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 13c0-5 4-9 9-9h7v2c0 7-5 12-12 12H4v-5z" />
      <path d="M4 18c4-4 9-7 16-9" />
    </svg>
  );
}

function BoltIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />
    </svg>
  );
}

function MountainIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m3 19 6-10 4 6 2-3 6 7H3z" />
      <circle cx="17" cy="6" r="2" />
    </svg>
  );
}

function SproutIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16V9" />
      <path d="M12 9c-3 0-4-2-4-4 3 0 5 1 5 4" />
      <path d="M12 9c2 0 4-1 4-4-3 0-4 1-4 4" />
    </svg>
  );
}

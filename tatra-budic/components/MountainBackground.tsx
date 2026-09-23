export default function MountainBackground() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1440 700"
      preserveAspectRatio="xMidYMax slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#122A1D" />
          <stop offset="100%" stopColor="#0A2118" />
        </linearGradient>
      </defs>
      <rect width="1440" height="700" fill="url(#skyGradient)" />
      <circle cx="1190" cy="150" r="86" fill="#2F6448" opacity="0.3" />
      <polygon
        points="0,700 0,440 220,260 430,460 620,220 860,480 1040,280 1250,480 1440,340 1440,700"
        fill="#1B3B2A"
        opacity="0.55"
      />
      <polygon
        points="0,700 0,520 260,370 520,540 760,340 1000,530 1220,380 1440,500 1440,700"
        fill="#254F39"
        opacity="0.75"
      />
      <polygon
        points="0,700 0,590 300,490 600,610 900,480 1200,610 1440,530 1440,700"
        fill="#122A1D"
      />
    </svg>
  );
}

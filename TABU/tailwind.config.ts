import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette: dark forest green -> light, tinted "mist" gray.
        // A single-hue family keeps the site harmonious instead of mixing
        // in a neutral gray, while still reading as "white / light gray".
        forest: {
          50: "#F1F6F2",
          100: "#E1EDE4",
          200: "#C3DCCC",
          300: "#96C0A6",
          400: "#679E7E",
          500: "#437F5F",
          600: "#2F6448",
          700: "#254F39",
          800: "#1B3B2A",
          900: "#122A1D",
          950: "#0A2118",
        },
        // True neutral (hue-less) scale for the "black / silver" half of the
        // v2 palette — kept separate from `forest` so dark UI (Team, KPI,
        // Timeline) can read as premium carbon/silver rather than green-black.
        ink: {
          50: "#F4F5F4",
          100: "#E4E7E5",
          200: "#C7CCC9",
          300: "#9CA39E",
          400: "#6E756F",
          500: "#4B524C",
          600: "#363B37",
          700: "#252925",
          800: "#171917",
          900: "#0D0E0D",
          950: "#070807",
        },
        // Emerald accent is used as Tailwind's own `emerald-*` scale
        // (kept un-aliased so the default 300/400/950 shades stay available).
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-grotesk)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "radial-glow":
          "radial-gradient(60% 50% at 50% 35%, rgba(16,185,129,0.22), transparent 70%)",
      },
      keyframes: {
        "rise-in": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "rise-in": "rise-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;

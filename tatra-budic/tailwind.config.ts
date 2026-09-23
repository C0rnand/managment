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
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "ui-serif", "Georgia", "serif"],
      },
      keyframes: {
        "rise-in": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
      },
      animation: {
        "rise-in": "rise-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
        float: "float 7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

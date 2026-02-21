import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0A0F1E",
        surface: "#111827",
        "surface-light": "#1A1F2E",
        border: "#1E2A3A",
        accent: "#C9A84C",
        "accent-hover": "#D4B85C",
        muted: "#A0A8BB",
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;

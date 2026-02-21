import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0a",
        surface: "#141414",
        border: "#262626",
        accent: "#3b82f6",
        "accent-hover": "#2563eb",
      },
    },
  },
  plugins: [],
};
export default config;

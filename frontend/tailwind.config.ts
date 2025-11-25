import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3B82F6",
          dark: "#1E40AF",
        },
        secondary: "#10B981",
        bg: {
          light: "#F8FAFC",
          card: "#FFFFFF",
        },
        text: {
          primary: "#0F172A",
          secondary: "#64748B",
        },
        border: "#E2E8F0",
      },
      fontFamily: {
        heading: ["Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

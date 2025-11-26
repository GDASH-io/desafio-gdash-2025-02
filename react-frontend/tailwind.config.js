/** @type {import('tailwindcss').Config} */
const { fontFamily } = require("tailwindcss/defaultTheme")

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",

  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "#1F2937", // Bordas padrão
        input: "#1F2937", // Inputs
        ring: "#3B82F6", // Anéis de foco
        background: "#0D1117", // Preto grafite
        foreground: "#E5E7EB", // Cinza claro
        primary: {
          DEFAULT: "#3B82F6", // Primary azul
          foreground: "#E5E7EB",
        },
        secondary: {
          DEFAULT: "#1F2937", // Bordas
          foreground: "#E5E7EB",
        },
        destructive: {
          DEFAULT: "#ef4444", // Vermelho padrão para destruição
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#1F2937", // Cinza escuro para elementos mutados
          foreground: "#E5E7EB",
        },
        accent: {
          DEFAULT: "#1F2937", // Acentos
          foreground: "#E5E7EB",
        },
        popover: {
          DEFAULT: "#161B22", // Cards padrão
          foreground: "#E5E7EB",
        },
        card: {
          DEFAULT: "#161B22", // Cards padrão
          foreground: "#E5E7EB",
        },
        // Cores da IA
        ai: {
          primary: "#38BDF8", // Ciano claro
          "primary-hover": "#0EA5E9", // Ciano escuro
          icon: "#7DD3FC", // Ícones IA
          glow: "#A5F3FC", // Detalhes brilhantes
          secondary: "#8B5CF6", // Roxo leve
          "secondary-hover": "#7C3AED", // Roxo hover
          "glow-purple": "#C4B5FD", // Glow roxo
        },
        // Cores para ícones de clima
        weather: {
          sun: "#FACC15", // Sol
          rain: "#38BDF8", // Chuva
          cloudy: "#94A3B8", // Nublado
          storm: "#6366F1", // Tempestade
          wind: "#7DD3FC", // Vento
        },
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

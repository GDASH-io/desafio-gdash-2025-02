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
        border: "#3b82f6", // Um tom de azul para bordas
        input: "#1a1a1a", // Preto para inputs
        ring: "#3b82f6", // Azul para anéis de foco
        background: "#121212", // Preto mais escuro para fundo geral
        foreground: "#e0e0e0", // Cinza claro para texto
        primary: {
          DEFAULT: "#3b82f6", // Azul primário
          foreground: "#ffffff", // Branco para texto sobre o primário
        },
        secondary: {
          DEFAULT: "#1a1a1a", // Preto secundário
          foreground: "#ffffff", // Branco para texto sobre o secundário
        },
        destructive: {
          DEFAULT: "#ef4444", // Vermelho padrão para destruição
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#262626", // Cinza escuro para elementos mutados
          foreground: "#e0e0e0",
        },
        accent: {
          DEFAULT: "#3b82f6", // Azul para acentos
          foreground: "#ffffff",
        },
        popover: {
          DEFAULT: "#1a1a1a", // Preto para popovers
          foreground: "#e0e0e0",
        },
        card: {
          DEFAULT: "#1a1a1a", // Preto para cards
          foreground: "#e0e0e0",
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

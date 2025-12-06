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
        border: "#1F2937",
        input: "#1F2937",
        ring: "#3B82F6",
        background: "#0D1117",
        foreground: "#E5E7EB",
        primary: {
          DEFAULT: "#3B82F6",
          foreground: "#E5E7EB",
        },
        secondary: {
          DEFAULT: "#1F2937",
          foreground: "#E5E7EB",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#1F2937",
          foreground: "#E5E7EB",
        },
        accent: {
          DEFAULT: "#1F2937",
          foreground: "#E5E7EB",
        },
        popover: {
          DEFAULT: "#161B22",
          foreground: "#E5E7EB",
        },
        card: {
          DEFAULT: "#161B22",
          foreground: "#E5E7EB",
        },
        ai: {
          primary: "#38BDF8",
          "primary-hover": "#0EA5E9",
          icon: "#7DD3FC",
          glow: "#A5F3FC",
          secondary: "#8B5CF6",
          "secondary-hover": "#7C3AED",
          "glow-purple": "#C4B5FD",
        },
        weather: {
          sun: "#FACC15",
          rain: "#38BDF8",
          cloudy: "#94A3B8",
          storm: "#6366F1",
          wind: "#7DD3FC",
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

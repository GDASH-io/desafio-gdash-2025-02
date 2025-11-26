/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"], // O Shadcn adiciona isso
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        // ... um monte de coisa que o Shadcn adicionou ...
    },
  },
  plugins: [require("tailwindcss-animate")], // O Shadcn usa esse aqui
}
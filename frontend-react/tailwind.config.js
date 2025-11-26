/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#10B981',  
          secondary: '#059669', 
          dark: '#F3F4F6',      
          surface: '#FFFFFF',   
          text: '#111827',     
          muted: '#6B7280',     
          border: '#E5E7EB'    
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
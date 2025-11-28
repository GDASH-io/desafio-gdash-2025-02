import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    watch: {
      usePolling: true, // Necessário para hot-reload funcionar bem no Docker em Windows/WSL
    },
    host: true, // Necessário para expor o container na rede
    strictPort: true,
    port: 5173, 
  }
})
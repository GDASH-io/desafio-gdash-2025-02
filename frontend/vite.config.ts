import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
    watch: {
      // Usar polling em vez de inotify para evitar ENOSPC
      usePolling: true,
      interval: 1000,
      // Ignorar pastas que não precisam de watch
      ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/.venv/**'],
    },
  },
})
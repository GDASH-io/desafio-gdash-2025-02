import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'desafio-gdash-2025-frontend-production.up.railway.app',
      'localhost',
      '127.0.0.1',
    ],
    watch: {
      usePolling: true,
    },
    // Forçar atualização do cache
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'desafio-gdash-2025-frontend-production.up.railway.app',
      'localhost',
      '127.0.0.1',
    ],
  },
  build: {
    // Adicionar hash aos arquivos para evitar cache
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].[hash].js`,
        chunkFileNames: `assets/[name].[hash].js`,
        assetFileNames: `assets/[name].[hash].[ext]`,
      },
    },
  },
})


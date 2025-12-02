import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/auth": {
        target: "http://api:3000",
        changeOrigin: true,
      },
    },
    strictPort: true,
    hmr: {
      host: "localhost",
    },
  },
});

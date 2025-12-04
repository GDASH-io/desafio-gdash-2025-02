import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
    plugins: [
        react(),
        tailwindcss()
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@components': path.resolve(__dirname, './src/shared/components'),
            '@features': path.resolve(__dirname, './src/features'),
            '@lib': path.resolve(__dirname, './src/lib'),
            '@hooks': path.resolve(__dirname, './src/shared/hooks'),
            '@utils': path.resolve(__dirname, './src/shared/utils'),
            '@types': path.resolve(__dirname, './src/shared/types'),
        },
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        watch: {
            usePolling: true,
        },
    },
});
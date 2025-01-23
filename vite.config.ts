import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), crx({ manifest }), tailwindcss()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        options: path.resolve(__dirname, 'options.html'),
      },
    },
  },
});

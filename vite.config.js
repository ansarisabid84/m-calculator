import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    target: 'es2018', // broad WebView support
  },
  server: {
    host: true,
    port: 5173,
  },
});

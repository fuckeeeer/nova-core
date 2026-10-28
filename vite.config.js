import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base keeps the build working on GitHub Pages project URLs.
export default defineConfig({
  base: './',
  plugins: [react()],
});

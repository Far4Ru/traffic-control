import { defineConfig } from 'vite';

export default defineConfig({
  base: '/traffic-intersection/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});
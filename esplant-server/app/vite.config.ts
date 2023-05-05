import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  ssr: {
    noExternal: process.env.NODE_ENV === 'production' ? ['svelte-apexcharts', 'apexcharts'] : []
  },
  server: {
    proxy: {
      '/api': process.env.NODE_ENV === 'devlocal' ? 'http://localhost:4803' : 'http://esplant.hoppingadventure.com'
    }
  }
});
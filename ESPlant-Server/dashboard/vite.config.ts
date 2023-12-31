import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
	plugins: [sveltekit(), SvelteKitPWA({
		registerType: 'autoUpdate',
	})],
	server: {
		proxy: {
			'/api': process.env.API_URL ?? 'https://esplant.hoppingadventure.com',
		},
	},
});

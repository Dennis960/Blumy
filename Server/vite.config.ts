import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { kitRoutes } from 'vite-plugin-kit-routes';

export default defineConfig({
	plugins: [sveltekit(), SvelteKitPWA({ registerType: 'autoUpdate' }), kitRoutes()],
	// @ts-expect-error: some weridness with tests
	test: { include: ['src/**/*.{test,spec}.{js,ts}'] },
	build: { chunkSizeWarningLimit: 1000 }
});

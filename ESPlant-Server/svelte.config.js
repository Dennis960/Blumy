import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { sveltePreprocess } from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: [vitePreprocess({})],
	sveltePreprocess: sveltePreprocess(),

	kit: {
		alias: {
			$lib: './src/lib',
			$components: './src/lib/components',
			$server: './src/lib/server'
		},
		adapter: adapter()
	},
	vitePlugin: {
		experimental: {
			disableSvelteResolveWarnings: true
		}
	}
};

export default config;

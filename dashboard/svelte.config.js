import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			pages: '../esplant-server/api/dashboard',
			assets: '../esplant-server/api/dashboard',
			fallback: 'index.html',
		}),
		alias: {
			$lib: './src/lib',
			$components: './src/lib/components'
		}
	}
};

export default config;

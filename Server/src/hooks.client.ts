import type { ClientInit } from '@sveltejs/kit';

export const init: ClientInit = async () => {
	// @ts-expect-error no declaration file
	const tabler = await import('@tabler/core/dist/js/tabler.js');
	window.bootstrap = tabler.bootstrap;
};

import type { LayoutServerLoad } from './$types';

export const load = (({ locals }) => {
	return {
		authenticated: locals.user !== null
	};
}) satisfies LayoutServerLoad;

import type { LayoutServerLoad } from './$types';

export const load = (({ locals }) => {
	locals.security.allowAll();
	return {
		authenticated: locals.user !== null
	};
}) satisfies LayoutServerLoad;

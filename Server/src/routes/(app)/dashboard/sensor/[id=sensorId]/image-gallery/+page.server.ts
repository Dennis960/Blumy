import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async function ({ params, parent, locals, url }) {
	await locals.security.allowOwnerOrSensorRead(params.id, url.searchParams.get('token'));
	const sensor = (await parent()).sensor;
	return {
		sensor
	};
};

import { DATA_DEPENDENCY } from '$lib/client/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async function ({ params, parent, locals, url, depends }) {
	await locals.security.allowOwnerOrSensorRead(params.id, url.searchParams.get('token'));
	depends(DATA_DEPENDENCY.SENSOR);
	const sensor = (await parent()).sensor;
	return {
		sensor
	};
};

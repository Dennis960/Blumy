import { DATA_DEPENDENCY } from '$lib/api';
import SensorController from '$lib/server/controllers/SensorController';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ params, locals, depends, url }) => {
	await locals.security.allowOwnerOrSensorRead(params.id, url.searchParams.get('token'));
	depends(DATA_DEPENDENCY.SENSOR);
	const id = parseInt(params.id);

	const sensor = await new SensorController().getSensor(id);
	if (sensor == undefined) {
		throw error(404, 'Sensor nicht gefunden');
	}

	return {
		id,
		sensor
	};
}) satisfies LayoutServerLoad;

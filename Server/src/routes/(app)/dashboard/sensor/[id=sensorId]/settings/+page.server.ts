import { DATA_DEPENDENCY } from '$lib/client/api';
import { route } from '$lib/ROUTES';
import SensorController from '$lib/server/controllers/SensorController';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async function ({ depends, params, parent, locals, url }) {
	await locals.security.allowOwnerOrSensorRead(params.id, url.searchParams.get('token'));
	depends(DATA_DEPENDENCY.SENSOR_VALUE_DISTRIBUTION);
	depends(DATA_DEPENDENCY.SENSOR);
	const id = parseInt(params.id);

	const sensorValueDistribution = await new SensorController().getSensorValueDistribution(id);

	const sensor = (await parent()).sensor;
	const shareLink =
		sensor.sensorToken != undefined
			? `${url.origin}${route('/dashboard/sensor/[id=sensorId]', { id: sensor.id.toString() })}?token=${sensor.sensorToken}`
			: undefined;

	return {
		sensor,
		sensorValueDistribution,
		shareLink: shareLink
	};
};

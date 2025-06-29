import { DATA_DEPENDENCY } from '$lib/client/api';
import SensorController from '$lib/server/controllers/SensorController';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async function ({ depends, params, parent, locals, url }) {
	await locals.security.allowOwnerOrSensorRead(params.id, url.searchParams.get('token'));
	depends(DATA_DEPENDENCY.SENSOR_VALUE_DISTRIBUTION);
	const id = parseInt(params.id);

	const sensorValueDistribution = await new SensorController().getSensorValueDistribution(id);

	const sensor = (await parent()).sensor;
	const shareLink =
		sensor.readToken != undefined
			? `${url.origin}/dashboard/sensor/${id}?token=${sensor.readToken}`
			: undefined;

	return {
		sensor,
		sensorValueDistribution,
		writeToken: sensor.writeToken,
		shareLink: shareLink
	};
};

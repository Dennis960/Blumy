import { base } from '$app/paths';
import SensorController from '$lib/server/controllers/SensorController';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async function ({ depends, params }) {
	depends("sensor-value-distribution");
	const id = parseInt(params.id);

	const sensorValueDistribution = await new SensorController().getSensorValueDistribution(id);

	const sensor = await new SensorController().getSensor(id);
	if (sensor == undefined) {
		throw error(404, 'Sensor not found');
	}
	const writeToken = await new SensorController().getSensorWriteToken(id);
	const shareLink = sensor.readToken != undefined ? `${base}/sensor/${id}?token=${sensor.readToken}` : undefined;

	return {
		sensor,
		sensorValueDistribution,
		writeToken,
		shareLink,
	};
};

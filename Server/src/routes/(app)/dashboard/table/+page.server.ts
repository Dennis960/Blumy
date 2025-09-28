import { DATA_DEPENDENCY } from '$lib/client/api';
import SensorController from '$lib/server/controllers/SensorController';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const user = event.locals.security.allowAuthenticatedElseRedirect();
	event.depends(DATA_DEPENDENCY.SENSOR_OVERVIEW);
	if (!user) {
		return { sensors: [], sensorOverview: null, sensorHistories: [] };
	}
	const sensorOverview = await new SensorController().getSensorOverview(
		user.id,
		event.url.searchParams.get('token')
	);
	// const sensorHistory = await new SensorController().getSensorHistory(event.locals.user!.id);
	const now = new Date();
	const threeDaysAgo = new Date(now);
	threeDaysAgo.setDate(now.getDate() - 3);
	function isNotUndefined<T>(x: T | undefined): x is T {
		return x !== undefined;
	}
	const sensorHistories = await Promise.all(
		sensorOverview.sensors
			.map(async (sensor) => ({
				sensor,
				history: await new SensorController().getSensorHistory(sensor.id, threeDaysAgo, now)
			}))
			.filter(isNotUndefined)
	);
	return {
		sensors: sensorOverview.sensors,
		sensorOverview,
		sensorHistories
	};
};

import { DATA_DEPENDENCY } from '$lib/api';
import SensorController from '$lib/server/controllers/SensorController';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	event.locals.security.allowAuthenticatedElseRedirect();
	event.depends(DATA_DEPENDENCY.SENSOR_OVERVIEW);
	const sensorOverview = await new SensorController().getSensorOverview(event.locals.user!.id);
	return sensorOverview;
};

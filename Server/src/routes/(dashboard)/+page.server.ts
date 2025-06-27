import { DATA_DEPENDENCY } from '$lib/client/api';
import SensorController from '$lib/server/controllers/SensorController';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	event.locals.security.allowAll();
	event.depends(DATA_DEPENDENCY.SENSOR_OVERVIEW);
	if (event.locals.user) {
		const sensorOverview = await new SensorController().getSensorOverview(event.locals.user.id);
		return sensorOverview;
	}
	return {
		sensors: []
	};
};

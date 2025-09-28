import { DATA_DEPENDENCY } from '$lib/client/api';
import SensorController from '$lib/server/controllers/SensorController';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const user = event.locals.security.allowAll();
	event.depends(DATA_DEPENDENCY.SENSOR_OVERVIEW);
	if (user) {
		const sensorOverview = await new SensorController().getSensorOverview(
			user.id,
			event.url.searchParams.get('token')
		);
		return sensorOverview;
	}
	return {
		sensors: []
	};
};

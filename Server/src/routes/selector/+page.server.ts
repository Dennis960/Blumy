import SensorController from '$lib/server/controllers/SensorController';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	event.locals.security.allowAll();
	if (event.locals.user) {
		const sensorOverview = await new SensorController().getSensorOverview(event.locals.user.id);
		return { ...sensorOverview, authenticated: true };
	}
	return {
		sensors: [],
		authenticated: false
	};
};

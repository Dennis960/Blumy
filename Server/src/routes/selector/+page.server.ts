import SensorController from '$lib/server/controllers/SensorController';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	event.locals.middleware.security.isAuthenticatedElseRedirect(event.url.toString());
	const sensorOverview = await new SensorController().getSensorOverview(event.locals.user!.id);
	return sensorOverview;
};

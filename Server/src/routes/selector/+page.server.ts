import SensorController from '$lib/server/controllers/SensorController';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const user = event.locals.security.allowAll();
	if (user) {
		const sensorOverview = await new SensorController().getSensorOverview(
			user.id,
			event.url.searchParams.get('token')
		);
		return { ...sensorOverview, authenticated: true };
	}
	return {
		sensors: [],
		authenticated: false
	};
};

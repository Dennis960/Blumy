import { clientApi } from '$lib/client/api';
import SensorController from '$lib/server/controllers/SensorController';
import type { SensorConfigurationDTO } from '$lib/types/api';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST = (async (event) => {
	event.locals.user = event.locals.security.allowAuthenticatedElseRedirect();
	const data = await event.request.formData();

	const config: SensorConfigurationDTO = {
		name: data.get('name') as string,
		permanentWiltingPoint: Number(data.get('permanentWiltingPoint')),
		lowerThreshold: Number(data.get('lowerThreshold')),
		upperThreshold: Number(data.get('upperThreshold')),
		fieldCapacity: Number(data.get('fieldCapacity')),
		sensorTokenHasEditPermissions: !!data.get('sensorTokenHasEditPermissions')
	};
	const sensor = await new SensorController().create(event.locals.user.id, config);

	const imageFile = data.get('image') as File;
	if (imageFile && imageFile.size > 0) {
		await clientApi(event.fetch)
			.sensors()
			.withId(sensor.id, event.url.searchParams.get('token'))
			.uploadImage(imageFile)
			.response();
	}

	return json(sensor);
}) satisfies RequestHandler;

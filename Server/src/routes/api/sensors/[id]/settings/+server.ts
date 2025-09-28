import { clientApi } from '$lib/client/api';
import SensorController from '$lib/server/controllers/SensorController';
import type { SensorConfigurationDTO } from '$lib/types/api';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const PUT = (async (event) => {
	await event.locals.security.allowOwnerOf(parseInt(event.params.id));
	const data = await event.request.formData();
	const sensorId = parseInt(event.params.id);

	const config: SensorConfigurationDTO = {
		name: data.get('name') as string,
		permanentWiltingPoint: Number(data.get('permanentWiltingPoint')),
		lowerThreshold: Number(data.get('lowerThreshold')),
		upperThreshold: Number(data.get('upperThreshold')),
		fieldCapacity: Number(data.get('fieldCapacity'))
	};

	const newConfig = await new SensorController().updateSensorConfig(sensorId, config);

	const imageFile = data.get('image') as File;
	if (imageFile && imageFile.size > 0) {
		await clientApi(event.fetch).sensors().withId(sensorId).uploadImage(imageFile).response();
	}

	return json(newConfig);
}) satisfies RequestHandler;

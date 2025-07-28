import SensorController from '$lib/server/controllers/SensorController';
import SensorRepository from '$lib/server/repositories/SensorRepository';
import type { SensorConfigurationDTO } from '$lib/types/api';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const PUT = (async (event) => {
	const user = event.locals.security.allowAuthenticatedElseRedirect();
	
	const sensorId = parseInt(event.params.id);
	// Check ownership manually
	const ownerId = await SensorRepository.getOwner(sensorId);
	if (ownerId === undefined) {
		throw error(404, 'sensor not found');
	}
	if (user.id !== ownerId) {
		throw error(403, 'not an owner of this sensor');
	}
	
	const data = await event.request.formData();

	const imageFile = data.get('image') as File;
	let imageBase64: string | undefined = undefined;
	const arrayBuffer = await imageFile.arrayBuffer();
	if (arrayBuffer.byteLength > 0) imageBase64 = Buffer.from(arrayBuffer).toString('base64');

	const config: SensorConfigurationDTO = {
		name: data.get('name') as string,
		imageBase64,
		permanentWiltingPoint: Number(data.get('permanentWiltingPoint')),
		lowerThreshold: Number(data.get('lowerThreshold')),
		upperThreshold: Number(data.get('upperThreshold')),
		fieldCapacity: Number(data.get('fieldCapacity'))
	};

	const newConfig = await new SensorController().updateSensorConfig(sensorId, config);
	return json(newConfig);
}) satisfies RequestHandler;

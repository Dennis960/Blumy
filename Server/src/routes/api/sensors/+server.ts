import SensorController from '$lib/server/controllers/SensorController';
import type { SensorConfigurationDTO } from '$lib/types/api';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST = (async (event) => {
	event.locals.user = event.locals.security.allowAuthenticatedElseRedirect();
	const data = await event.request.formData();

	const imageFile = data.get('image') as File;
	let imageBase64: string | undefined = undefined;
	const arrayBuffer = await imageFile.arrayBuffer();
	imageBase64 = Buffer.from(arrayBuffer).toString('base64');

	const config: SensorConfigurationDTO = {
		name: data.get('name') as string,
		imageBase64,
		permanentWiltingPoint: Number(data.get('permanentWiltingPoint')),
		lowerThreshold: Number(data.get('lowerThreshold')),
		upperThreshold: Number(data.get('upperThreshold')),
		fieldCapacity: Number(data.get('fieldCapacity'))
	};
	const sensor = await new SensorController().create(event.locals.user.id, config);

	return json(sensor);
}) satisfies RequestHandler;

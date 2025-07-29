import SensorController from '$lib/server/controllers/SensorController';
import SensorImageRepository from '$lib/server/repositories/SensorImageRepository';
import type { SensorConfigurationDTO } from '$lib/types/api';
import { json } from '@sveltejs/kit';
import sharp from 'sharp';
import type { RequestHandler } from './$types';

export const POST = (async (event) => {
	event.locals.user = event.locals.security.allowAuthenticatedElseRedirect();
	const data = await event.request.formData();

	const config: SensorConfigurationDTO = {
		name: data.get('name') as string,
		permanentWiltingPoint: Number(data.get('permanentWiltingPoint')),
		lowerThreshold: Number(data.get('lowerThreshold')),
		upperThreshold: Number(data.get('upperThreshold')),
		fieldCapacity: Number(data.get('fieldCapacity'))
	};
	const sensor = await new SensorController().create(event.locals.user.id, config);

	const imageFile = data.get('image') as File;
	if (imageFile && imageFile.size > 0) {
		const arrayBuffer = await imageFile.arrayBuffer();
		const rawImageBase64 = Buffer.from(arrayBuffer).toString('base64');

		// Resize and optimize the image
		const buf = Buffer.from(rawImageBase64, 'base64');
		const optimizedImage = await sharp(buf)
			.resize(800, 800, {
				fit: 'inside',
				withoutEnlargement: true
			})
			.toFormat('webp')
			.toBuffer()
			.then((buf) => buf.toString('base64'));

		await SensorImageRepository.create(sensor.id, optimizedImage);
	}

	return json(sensor);
}) satisfies RequestHandler;

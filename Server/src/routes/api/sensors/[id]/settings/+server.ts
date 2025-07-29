import SensorController from '$lib/server/controllers/SensorController';
import SensorImageRepository from '$lib/server/repositories/SensorImageRepository';
import type { SensorConfigurationDTO } from '$lib/types/api';
import { json } from '@sveltejs/kit';
import sharp from 'sharp';
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
		const arrayBuffer = await imageFile.arrayBuffer();
		if (arrayBuffer.byteLength > 0) {
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

			await SensorImageRepository.updateBySensorAddress(sensorId, optimizedImage);
		}
	}

	return json(newConfig);
}) satisfies RequestHandler;

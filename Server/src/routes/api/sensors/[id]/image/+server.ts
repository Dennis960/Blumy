import SensorController from '$lib/server/controllers/SensorController';
import type { RequestHandler } from './$types';

export const GET = (async ({ locals, params, url }) => {
	await locals.security.allowOwnerOrSensorRead(params.id, url.searchParams.get('token'));
	const sensorId = parseInt(params.id);
	const sensor = await new SensorController().getSensor(sensorId);
	if (!sensor?.config.imageBase64) {
		return new Response('Sensor not found', { status: 404 });
	}
	const image = Buffer.from(sensor.config.imageBase64, 'base64');
	return new Response(image, {
		headers: {
			'Content-Type': 'image/png',
			'Content-Length': image.length.toString()
		}
	});
}) satisfies RequestHandler;

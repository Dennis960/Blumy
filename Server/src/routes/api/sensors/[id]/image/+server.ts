import SensorImageRepository from '$lib/server/repositories/SensorImageRepository';
import type { RequestHandler } from './$types';

export const GET = (async ({ locals, params, url }) => {
	await locals.security.allowOwnerOrSensorRead(params.id, url.searchParams.get('token'));
	const sensorId = parseInt(params.id);
	const imageId = url.searchParams.get('id') ? parseInt(url.searchParams.get('id')!) : undefined;
	const sensorImage = imageId
		? await SensorImageRepository.getBySensorAddressAndId(sensorId, imageId)
		: await SensorImageRepository.getLatestBySensorAddress(sensorId);
	if (!sensorImage?.imageBase64) {
		return new Response('Image not found', { status: 404 });
	}
	const image = Buffer.from(sensorImage.imageBase64, 'base64');
	return new Response(image, {
		headers: {
			'Content-Type': 'image/webp',
			'Content-Length': image.length.toString(),
			...(imageId
				? { 'Cache-Control': 'public, max-age=31536000, immutable' }
				: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }),
			'Last-Modified': sensorImage.uploadedAt.toUTCString()
		}
	});
}) satisfies RequestHandler;

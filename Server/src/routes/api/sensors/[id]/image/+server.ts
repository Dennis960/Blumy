import SensorImageRepository from '$lib/server/repositories/SensorImageRepository';
import sharp from 'sharp';
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

export const POST = (async ({ locals, params, request }) => {
	await locals.security.allowOwnerOf(params.id);
	const sensorId = parseInt(params.id);
	const data = await request.formData();
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
			return new Response('Image uploaded', { status: 200 });
		}
	}
	return new Response('Invalid image file', { status: 400 });
}) satisfies RequestHandler;

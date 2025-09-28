import SensorController from '$lib/server/controllers/SensorController';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET = (async (event) => {
	await event.locals.security.allowOwnerOrSensorRead(
		parseInt(event.params.id),
		event.url.searchParams.get('token')
	);
	const sensorId = parseInt(event.params.id);
	const threeDaysAgo = new Date();
	threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
	const from = event.url.searchParams.has('from')
		? new Date(event.url.searchParams.get('from')!)
		: threeDaysAgo;
	const to = event.url.searchParams.has('to')
		? new Date(event.url.searchParams.get('to')!)
		: new Date();

	const sensorHistory = await new SensorController().getSensorHistory(sensorId, from, to);
	return json(sensorHistory);
}) satisfies RequestHandler;

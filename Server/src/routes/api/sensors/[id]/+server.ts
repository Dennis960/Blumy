import SensorController from '$lib/server/controllers/SensorController';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const DELETE = (async (event) => {
	await event.locals.security.allowOwnerOf(parseInt(event.params.id));
	new SensorController().deleteSensor(parseInt(event.params.id));
	return json({ success: true });
}) satisfies RequestHandler;

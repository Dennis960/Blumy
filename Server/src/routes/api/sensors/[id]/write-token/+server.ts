import SensorController from '$lib/server/controllers/SensorController';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST = (async (event) => {
	await event.locals.security.allowOwnerOfOrTokenHasEditPermission(
		parseInt(event.params.id),
		event.url.searchParams.get('token')
	);
	const writeToken = new SensorController().getSensorWriteToken(parseInt(event.params.id));
	return json(writeToken);
}) satisfies RequestHandler;

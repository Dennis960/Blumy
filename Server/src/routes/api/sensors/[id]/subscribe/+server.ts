import SubscriptionController from '$lib/server/controllers/SubscriptionController';
import { json } from '@sveltejs/kit';
import type { PushSubscription } from 'web-push';
import type { RequestHandler } from './$types';

export const POST = (async ({ request, params, locals, url }) => {
	await locals.security.allowOwnerOrSensorRead(params.id, url.searchParams.get('token'));
	const subscription: PushSubscription = await request.json();
	return json(await SubscriptionController.subscribe(parseInt(params.id), subscription));
}) satisfies RequestHandler;

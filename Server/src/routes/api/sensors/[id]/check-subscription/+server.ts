import SubscriptionController from '$lib/server/controllers/SubscriptionController';
import { json } from '@sveltejs/kit';
import type { PushSubscription } from 'web-push';
import type { RequestHandler } from './$types';

export const POST = (async ({ request, params, locals, url }) => {
	await locals.security.allowOwnerOrSensorRead(params.id, url.searchParams.get('token'));
	const subscription: PushSubscription = await request.json();
	const subscribed = await SubscriptionController.getIsSubscribed(
		parseInt(params.id),
		subscription
	);
	return json(subscribed);
}) satisfies RequestHandler;

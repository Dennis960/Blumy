import SubscriptionController from '$lib/server/controllers/SubscriptionController';
import { json } from '@sveltejs/kit';
import SuperJSON from 'superjson';
import type { PushSubscription } from 'web-push';
import type { RequestHandler } from './$types';

export const POST = (async ({ request, params, locals, url }) => {
	await locals.middleware.security.isOwnerOrThisSensorRead(
		params.id,
		url.searchParams.get('token')
	);
	const subscription: PushSubscription = SuperJSON.parse(await request.text());
	await SubscriptionController.subscribe(parseInt(params.id), subscription);
	return json({});
}) satisfies RequestHandler;

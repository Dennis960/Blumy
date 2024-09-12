import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import NotificationService from '$lib/server/services/NotificationService';

/* TODO remove - for testing only */
export const POST = (async (event) => {
	event.locals.security.allowAll();
	await NotificationService.triggerPushNotifications();
	return json({});
}) satisfies RequestHandler;

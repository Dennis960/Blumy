import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { lucia } from '$lib/server/auth';
import { db } from '$lib/server/db/worker';
import { authenticated } from '$lib/server/security/authenticated';
import NotificationService from '$lib/server/services/NotificationService';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import cron from 'node-cron';
import webpush from 'web-push';

await migrate(db, { migrationsFolder: 'migrations' });
let privateVapidKey = privateEnv.PRIVATE_VAPID_KEY;
let publicVapidKey = publicEnv.PUBLIC_VAPID_KEY;

if (publicEnv.PUBLIC_MODE === 'test-ci') {
	const newKey = webpush.generateVAPIDKeys();
	privateVapidKey = newKey.privateKey;
	publicVapidKey = newKey.publicKey;
}

webpush.setVapidDetails('mailto:' + privateEnv.VAPID_EMAIL, publicVapidKey, privateVapidKey);

// send notifications every day at 8, 12, 16 and 20
cron.schedule('0 8,12,16,20 * * *', async () => {
	await NotificationService.triggerPushNotifications();
});

export const handle: Handle = sequence(
	async ({ event, resolve }) => {
		const sessionId = event.cookies.get(lucia.sessionCookieName);
		if (!sessionId) {
			event.locals.user = null;
			event.locals.session = null;
			return resolve(event);
		}

		const { session, user } = await lucia.validateSession(sessionId);
		if (session && session.fresh) {
			const sessionCookie = lucia.createSessionCookie(session.id);
			// sveltekit types deviates from the de-facto standard
			// you can use 'as any' too
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		}
		if (!session) {
			const sessionCookie = lucia.createBlankSessionCookie();
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		}
		event.locals.user = user;
		event.locals.session = session;
		return resolve(event);
	},
	async ({ event, resolve }) => {
		event.locals.security = authenticated(event.locals.user, event.locals.session);
		return resolve(event);
	}
);

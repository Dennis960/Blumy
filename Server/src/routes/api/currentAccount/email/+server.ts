import { createAuthenticationSession } from '$lib/server/auth';
import dbHelper from '$lib/server/db/dbHelper';
import { users } from '$lib/server/db/schema';
import { db } from '$lib/server/db/worker';
import { eq } from 'drizzle-orm';
import type { RequestEvent } from './$types';

export const PUT = async (event: RequestEvent) => {
	event.locals.security.allowAll();
	const userId = event.locals.user?.id;
	if (!userId) {
		return new Response('Unauthorized', { status: 401 });
	}

	const email = (await event.request.json()).email;
	if (!email || typeof email !== 'string') {
		return new Response('Invalid email', {
			status: 400
		});
	}

	const isDefaultLogin = await dbHelper.isDefaultLogin(userId);
	if (!isDefaultLogin) {
		return new Response('Email cannot be updated', {
			status: 400
		});
	}

	const user = await dbHelper.getUser(userId);
	if (!user) {
		return new Response('User not found', { status: 404 });
	}
	await db.update(users).set({ email }).where(eq(users.id, userId));

	await event.locals.lucia.invalidateUserSessions(userId);
	await createAuthenticationSession(event, userId);

	return new Response('Email updated', { status: 200 });
};

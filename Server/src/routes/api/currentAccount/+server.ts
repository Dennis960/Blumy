import { accounts, users } from '$lib/server/db/schema';
import { db } from '$lib/server/db/worker';
import { eq } from 'drizzle-orm';
import type { RequestEvent } from './$types';

export const DELETE = async (event: RequestEvent) => {
	event.locals.security.allowAll();
	// TODO password confirmation
	const userId = event.locals.user?.id;
	if (!userId) {
		return new Response('Unauthorized', { status: 401 });
	}

	await event.locals.lucia.invalidateUserSessions(userId);
	// TODO delete sensors and user data

	db.transaction(async () => {
		await db.delete(accounts).where(eq(accounts.userId, userId));
		await db.delete(users).where(eq(users.id, userId));
	});
	return new Response('Account deleted', { status: 200 });
};

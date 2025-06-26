import { createAuthenticationSession, validatePassword } from '$lib/server/auth';
import dbHelper from '$lib/server/db/dbHelper';
import { users } from '$lib/server/db/schema';
import { db } from '$lib/server/db/worker';
import { eq } from 'drizzle-orm';
import { Argon2id } from 'oslo/password';
import type { RequestEvent } from './$types';

export const PUT = async (event: RequestEvent) => {
	event.locals.security.allowAll();
	const userId = event.locals.user?.id;
	if (!userId) {
		return new Response('Unauthorized', { status: 401 });
	}

	const obj = await event.request.json();
	const currentPassword = obj.currentPassword;
	const newPassword = obj.newPassword;
	if (!currentPassword || typeof currentPassword !== 'string') {
		return new Response('Invalid current password', {
			status: 400
		});
	}
	if (!newPassword || typeof newPassword !== 'string') {
		return new Response('Invalid new password', {
			status: 400
		});
	}

	const user = await dbHelper.getUser(userId);
	if (!user) {
		return new Response('User not found', { status: 404 });
	}

	const validPassword = await validatePassword(user, currentPassword);
	if (!validPassword) {
		return new Response('Invalid password', {
			status: 400
		});
	}

	const isDefaultLogin = await dbHelper.isDefaultLogin(userId);
	if (!isDefaultLogin) {
		return new Response('Password can not be updated', {
			status: 400
		});
	}

	const hashedPassword = await new Argon2id().hash(newPassword);
	await db.update(users).set({ hashedPassword }).where(eq(users.id, userId));

	await event.locals.lucia.invalidateUserSessions(userId);
	await createAuthenticationSession(event, userId);

	return new Response('Email updated', { status: 200 });
};

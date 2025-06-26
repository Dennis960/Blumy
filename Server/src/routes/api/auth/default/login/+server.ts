import { createAuthenticationSession, validatePassword } from '$lib/server/auth';
import { users } from '$lib/server/db/schema.js';
import { db } from '$lib/server/db/worker';
import { eq } from 'drizzle-orm';
import type { RequestEvent } from './$types';

export const POST = async (event: RequestEvent) => {
	event.locals.security.allowAll();
	const { email, password } = await event.request.json();
	if (!email || typeof email !== 'string') {
		return new Response('Invalid email', {
			status: 400
		});
	}
	if (!password || typeof password !== 'string') {
		return new Response('Invalid password', {
			status: 400
		});
	}

	const userList = await db.select().from(users).where(eq(users.email, email));

	if (userList.length !== 1) {
		return new Response('Invalid email or password', {
			status: 400
		});
	}

	const user = userList[0];

	const validPassword = await validatePassword(user, password);
	if (!validPassword) {
		return new Response('Invalid email or password', {
			status: 400
		});
	}

	await createAuthenticationSession(event, user.id);
	return new Response(null, {
		status: 200
	});
};

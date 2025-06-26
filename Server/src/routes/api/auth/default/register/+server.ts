import { createAuthenticationSession, isValidEmail } from '$lib/server/auth';
import { users } from '$lib/server/db/schema.js';
import { db } from '$lib/server/db/worker';
import { eq } from 'drizzle-orm';
import { generateId } from 'lucia';
import { Argon2id } from 'oslo/password';
import type { RequestEvent } from './$types';

export const POST = async (event: RequestEvent) => {
	event.locals.security.allowAll();
	const { email, password } = await event.request.json();
	if (!email || typeof email !== 'string' || !isValidEmail(email)) {
		return new Response('Invalid email', {
			status: 400
		});
	}
	if (!password || typeof password !== 'string' || password.length < 6) {
		return new Response('Invalid password. Must be at least 6 characters', {
			status: 400
		});
	}

	const hashedPassword = await new Argon2id().hash(password);
	const userId = generateId(15);

	const emailList = await db.select().from(users).where(eq(users.email, email));

	if (emailList.length > 0) {
		return new Response('Email already in use', {
			status: 400
		});
	}
	await db.insert(users).values([
		{
			id: userId,
			email,
			hashedPassword: hashedPassword
		}
	]);

	await createAuthenticationSession(event, userId);
	return new Response(null, {
		status: 200
	});
};

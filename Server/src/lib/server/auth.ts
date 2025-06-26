import { dev } from '$app/environment';
import { env as privateEnv } from '$env/dynamic/private';
import { clientApi } from '$lib/client/api';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import type { RequestEvent } from '@sveltejs/kit';
import { Google } from 'arctic';
import type { InferSelectModel } from 'drizzle-orm';
import { Lucia } from 'lucia';
import { Argon2id } from 'oslo/password';
import { sessions, users } from './db/schema';
import { db } from './db/worker';

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			// set to `true` when using HTTPS
			secure: !dev
		}
	},
	getUserAttributes: (attributes) => {
		return {
			// we don't need to expose the hashed password!
			email: attributes.email,
			credits: attributes.credits
		};
	}
});

export function isValidEmail(email: string): boolean {
	return /.+@.+/.test(email);
}

export async function validatePassword(user: InferSelectModel<typeof users>, password: string) {
	if (!user.hashedPassword) {
		return false;
	}
	return await new Argon2id().verify(user.hashedPassword, password);
}

export async function createAuthenticationSession(event: RequestEvent, userId: string) {
	const session = await event.locals.lucia.createSession(userId, {});
	const sessionCookie = event.locals.lucia.createSessionCookie(session.id);

	event.cookies.set(sessionCookie.name, sessionCookie.value, {
		path: '.',
		...sessionCookie.attributes
	});
}

let google: Google | null = null;

export const getGoogle = (baseUrl: string) => {
	if (!google) {
		const redirectUrl = clientApi(null!, baseUrl).auth().google().callback().url;
		google = new Google(
			privateEnv.GOOGLE_CLIENT_ID!,
			privateEnv.GOOGLE_CLIENT_SECRET!,
			redirectUrl
		);
	}
	return google;
};

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: {
			email: string;
			credits: number;
		};
	}
}

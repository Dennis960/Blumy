import { dev } from '$app/environment';
import { env as privateEnv } from '$env/dynamic/private';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { Google } from 'arctic';
import { Lucia } from 'lucia';
import { sessions, users } from './db/schema';
import { db } from './db/worker';

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: !dev
		}
	},
	getUserAttributes: (attributes) => {
		return {
			id: attributes.id
		};
	}
});

export const google = new Google(
	privateEnv.GOOGLE_CLIENT_ID,
	privateEnv.GOOGLE_CLIENT_SECRET,
	privateEnv.ORIGIN + '/api/auth/google/callback'
);

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: typeof users.$inferSelect;
	}
}

import { lucia } from "$lib/server/auth";
import { db } from "$lib/server/db/worker";
import { authenticated } from "$lib/server/middlewares/authenticated";
import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { migrate } from 'drizzle-orm/node-postgres/migrator';

await migrate(db, { migrationsFolder: "migrations" });

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
                path: ".",
                ...sessionCookie.attributes
            });
        }
        if (!session) {
            const sessionCookie = lucia.createBlankSessionCookie();
            event.cookies.set(sessionCookie.name, sessionCookie.value, {
                path: ".",
                ...sessionCookie.attributes
            });
        }
        event.locals.user = user;
        event.locals.session = session;
        return resolve(event);
    },
    async ({ event, resolve }) => {
        event.locals.middleware = {
            auth: authenticated(event.locals.user, event.locals.session)
        }
        return resolve(event);
    }
);

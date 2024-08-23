import { sessions, users } from '$lib/server/db/schema';
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { type BrowserContext } from '@playwright/test';
import { eq } from 'drizzle-orm';
import { Lucia, type User } from 'lucia';
import { testDb } from './test-db';

const adapter = new DrizzlePostgreSQLAdapter(testDb, sessions, users);

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        attributes: {
            secure: false
        }
    },
    getUserAttributes: (attributes) => {
        return {
            id: attributes.id
        };
    }
});

const testUser: User = {
    id: 'test-user',
};

export async function authenticateTestUser(context: BrowserContext) {
    if ((await testDb.select().from(users).where(eq(users.id, testUser.id))).length === 0) {
        await testDb.insert(users).values(testUser);
    }
    const session = await lucia.createSession(testUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    await context.addCookies([{
        name: sessionCookie.name,
        value: sessionCookie.value,
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
        path: '/',
        domain: 'localhost',
    }]);
}
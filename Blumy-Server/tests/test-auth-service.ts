import { sessions, users } from '$lib/server/db/schema';
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { type BrowserContext } from '@playwright/test';
import { Lucia } from 'lucia';
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


export const createTestUser = async () => {
    return await testDb.insert(users).values({
        id: "test-user",
    }).returning().then((users) => users[0]);
}

export async function authenticateTestUser(context: BrowserContext) {
    const testUser = await createTestUser();
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
    return testUser;
}
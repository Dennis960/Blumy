import { accounts, users } from '$lib/server/db/schema';
import { db } from '$lib/server/db/worker';
import { eq } from 'drizzle-orm';

async function getUser(userId: string) {
	const userList = await db.select().from(users).where(eq(users.id, userId));
	if (userList.length !== 1) {
		return null;
	}
	return userList[0];
}

async function getUserByEmail(email: string) {
	const userList = await db.select().from(users).where(eq(users.email, email));
	if (userList.length !== 1) {
		return null;
	}
	return userList[0];
}

async function isDefaultLogin(userId: string) {
	// TODO make this implementation better
	const a = await db.select().from(accounts).where(eq(accounts.userId, userId));
	return a.length === 0;
}

export default {
	getUser,
	getUserByEmail,
	isDefaultLogin
};

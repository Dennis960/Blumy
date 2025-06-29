import { waitlist } from '$lib/server/db/schema';
import { db } from '$lib/server/db/worker';
import { eq } from 'drizzle-orm';

export default class WaitingListRepository {
	static async addEmail(email: string) {
		const existingEntry = await db
			.select()
			.from(waitlist)
			.where(eq(waitlist.email, email))
			.limit(1);

		if (existingEntry.length > 0) {
			return false;
		}

		await db.insert(waitlist).values({ email });
		return true;
	}
}

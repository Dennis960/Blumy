import { subscriptions } from '$lib/server/db/schema';
import { db } from '$lib/server/db/worker';
import { and, eq } from 'drizzle-orm';

export default class SubscriptionRepository {
	static async create(subscription: typeof subscriptions.$inferInsert) {
		const insertedRecord = await db
			.insert(subscriptions)
			.values({ ...subscription })
			.returning();

		return insertedRecord[0]!;
	}

	static async delete(subscription: { endpoint: string }): Promise<void> {
		await db.delete(subscriptions).where(eq(subscriptions.endpoint, subscription.endpoint));
	}

	static async exists(subscription: Partial<typeof subscriptions.$inferInsert>): Promise<boolean> {
		if (
			!subscription.sensorAddress ||
			!subscription.endpoint ||
			!subscription.keysP256dh ||
			!subscription.keysAuth
		) {
			return false;
		}
		const existingSubscription = await db
			.select()
			.from(subscriptions)
			.where(
				and(
					eq(subscriptions.sensorAddress, subscription.sensorAddress),
					eq(subscriptions.endpoint, subscription.endpoint),
					eq(subscriptions.keysP256dh, subscription.keysP256dh),
					eq(subscriptions.keysAuth, subscription.keysAuth)
				)
			)
			.limit(1)
			.then((results) => results.pop());

		return existingSubscription != undefined;
	}

	static async getBySensorAddress(sensorAddress: number) {
		return await db
			.select({
				id: subscriptions.id,
				sensorAddress: subscriptions.sensorAddress,
				lastNotification: subscriptions.lastNotification,
				endpoint: subscriptions.endpoint,
				keysP256dh: subscriptions.keysP256dh,
				keysAuth: subscriptions.keysAuth
			})
			.from(subscriptions)
			.where(eq(subscriptions.sensorAddress, sensorAddress));
	}

	static async updateLastNotification(sensorAddress: number, lastNotification: Date) {
		const updatedRecord = await db
			.update(subscriptions)
			.set({
				lastNotification: lastNotification
			})
			.where(eq(subscriptions.sensorAddress, sensorAddress))
			.returning();

		return updatedRecord[0];
	}
}

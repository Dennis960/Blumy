import SubscriptionEntity from "../entities/SubscriptionEntity.js";
import { knex } from "../config/knex.js";

export default class SubscriptionRepository {
  static async create(
    subscription: Omit<SubscriptionEntity, "id">
  ): Promise<SubscriptionEntity> {
    return (await knex<SubscriptionEntity>("subscription")
      .insert(subscription)
      .returning([
        "id",
        "sensorAddress",
        "lastNotification",
        "endpoint",
        "keys_p256dh",
        "keys_auth",
      ])
      .then((rows) => rows[0]))!;
  }

  static async delete(subscription: { endpoint: string }): Promise<void> {
    await knex<SubscriptionEntity>("subscription").delete().where(subscription);
  }

  static async exists(
    subscription: Partial<SubscriptionEntity>
  ): Promise<boolean> {
    const existingSubscription = await knex<SubscriptionEntity>("subscription")
      .where(subscription)
      .first();
    return existingSubscription != undefined;
  }

  static async getBySensorAddress(
    sensorAddress: number
  ): Promise<SubscriptionEntity[]> {
    return await knex<SubscriptionEntity>("subscription")
      .select(
        "id",
        "sensorAddress",
        "lastNotification",
        "endpoint",
        "keys_p256dh",
        "keys_auth"
      )
      .where({ sensorAddress });
  }

  static async updateLastNotification(
    sensorAddress: number,
    lastNotification: Date
  ) {
    return await knex<SubscriptionEntity>("subscription")
      .where({ sensorAddress })
      .update({ lastNotification })
      .returning([
        "id",
        "sensorAddress",
        "lastNotification",
        "endpoint",
        "keys_p256dh",
        "keys_auth",
      ])
      .then((rows) => rows[0]);
  }
}

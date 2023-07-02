import Knex from "knex";
import knexfile from "../knexfile.js";
import { Subscription } from "../types/data.js";
export const knex = Knex(knexfile.development);

export default class SubscriptionRepository {
  static async create(subscription: Subscription): Promise<Subscription> {
    return (await knex<Subscription>("subscription")
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

  static async delete(subscription: Subscription): Promise<void> {
    await knex<Subscription>("subscription").delete().where(subscription);
  }

  static async exists(subscription: Partial<Subscription>): Promise<boolean> {
    const existingSubscription = await knex<Subscription>("subscription")
      .where(subscription)
      .first();
    return existingSubscription != undefined;
  }

  static async getBySensorAddress(
    sensorAddress: number
  ): Promise<Subscription[]> {
    return await knex<Subscription>("subscription")
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
    return await knex<Subscription>("subscription")
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

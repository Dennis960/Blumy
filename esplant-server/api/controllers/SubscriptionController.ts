import { PushSubscription } from "web-push";
import { Subscription } from "../types/data";
import SubscriptionRepository from "../repositories/SubscriptionRepository.js";

export default class SubscriptionController {
  public static async getIsSubscribed(
    sensorAddress: number,
    subscription: PushSubscription
  ): Promise<boolean> {
    return await SubscriptionRepository.exists({
      sensorAddress,
      endpoint: subscription.endpoint,
      keys_p256dh: subscription.keys.p256dh,
      keys_auth: subscription.keys.auth,
    });
  }

  public static async subscribe(
    sensorAddress: number,
    subscription: PushSubscription
  ): Promise<boolean> {
    const subscriptionEntity: Subscription = {
      sensorAddress,
      endpoint: subscription.endpoint,
      keys_p256dh: subscription.keys.p256dh,
      keys_auth: subscription.keys.auth,
    };
    await SubscriptionRepository.create(subscriptionEntity);
    console.log(`Subscribed to sensor ${sensorAddress}`);
    return true;
  }

  public static async unsubscribe(
    sensorAddress: number,
    subscription: PushSubscription
  ): Promise<boolean> {
    const subscriptionEntity: Subscription = {
      sensorAddress,
      endpoint: subscription.endpoint,
      keys_p256dh: subscription.keys.p256dh,
      keys_auth: subscription.keys.auth,
    };

    await SubscriptionRepository.delete(subscriptionEntity);
    console.log(`Unsubscribed from sensor ${sensorAddress}`);
    return true;
  }
}

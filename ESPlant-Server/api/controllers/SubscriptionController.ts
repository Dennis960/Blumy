import { PushSubscription } from "web-push";
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
    await SubscriptionRepository.create({
      sensorAddress,
      endpoint: subscription.endpoint,
      keys_p256dh: subscription.keys.p256dh,
      keys_auth: subscription.keys.auth,
      lastNotification: null,
    });
    console.log(`Subscribed to sensor ${sensorAddress}`);
    return true;
  }

  public static async unsubscribe(
    sensorAddress: number,
    subscription: PushSubscription
  ): Promise<boolean> {
    await SubscriptionRepository.delete({ endpoint: subscription.endpoint });
    console.log(`Unsubscribed from sensor ${sensorAddress}`);
    return true;
  }
}

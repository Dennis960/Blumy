import webpush from "web-push";
import SensorRepository from "../repositories/SensorRepository.js";
import SubscriptionRepository from "../repositories/SubscriptionRepository.js";
import SensorService from "./SensorService.js";
import SensorEntity from "../entities/SensorEntity.js";

export default class NotificationService {
  public static async triggerPushNotifications(): Promise<void> {
    console.log("Checking sensors to trigger push notifications");
    const sensors = await SensorRepository.getAll();

    for (const sensor of sensors) {
      const sensorData = await SensorService.getRecentReadings(
        sensor.sensorAddress
      );
      const model = SensorService.fitModel(sensorData);
      const predictedTimestamp =
        model?.predictTimestamp(sensor.lowerThreshold) ?? new Date();

      console.log(
        `Sensor ${
          sensor.name
        }, predicted watering: ${predictedTimestamp.toISOString()}`
      );
      if (predictedTimestamp < new Date()) {
        await this.notifySensor(sensor);
      }
    }
  }

  public static async notifySensor(sensor: SensorEntity) {
    const subscriptions = await SubscriptionRepository.getBySensorAddress(
      sensor.sensorAddress
    );

    const payload = JSON.stringify({
      title: `${sensor.name} braucht Wasser!`,
    });

    console.log(
      `Sending subscriptions to ${subscriptions.length} subscribers of sensor ${sensor.name}`
    );

    for (const subscription of subscriptions) {
      if (subscription.lastNotification != undefined) {
        // skip if last notified less than 1 hour ago
        const lastNotification = new Date(subscription.lastNotification);
        const now = new Date();
        const diffHours =
          (now.getTime() - lastNotification.getTime()) / (1000 * 60 * 60);
        if (diffHours < 1) {
          console.log(`Last notified ${Math.floor(diffHours)}h ago, skipping`);
          continue;
        }
      }

      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.keys_p256dh,
            auth: subscription.keys_auth,
          },
        },
        payload
      );

      await SubscriptionRepository.updateLastNotification(
        sensor.sensorAddress,
        new Date()
      );
      console.log(`Sent push notification`);
    }
  }
}

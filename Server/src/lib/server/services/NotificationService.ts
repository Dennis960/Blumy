import webpush, { WebPushError } from 'web-push';
import SensorRepository from '../repositories/SensorRepository';
import SubscriptionRepository from '../repositories/SubscriptionRepository';
import SensorService from './SensorService';
import { sensors } from '$lib/server/db/schema';

export default class NotificationService {
	public static async triggerPushNotifications(): Promise<void> {
		console.log('Checking sensors to trigger push notifications');
		const sensors = await SensorRepository.getAll();

		for (const sensor of sensors) {
			const sensorData = await SensorService.getRecentReadings(sensor.sensorAddress);
			const model = SensorService.fitModel(sensorData);
			const predictedTimestamp = model?.predictTimestamp(sensor.lowerThreshold) ?? new Date();

			console.log(`Sensor ${sensor.name}, predicted watering: ${predictedTimestamp.toISOString()}`);
			if (predictedTimestamp < new Date()) {
				await this.notifySensor(sensor);
			}
		}
	}

	public static async notifySensor(sensor: typeof sensors.$inferSelect) {
		const subscriptions = await SubscriptionRepository.getBySensorAddress(sensor.sensorAddress);

		const payload = JSON.stringify({
			title: `${sensor.name} braucht Wasser!`
		});

		console.log(
			`Sending subscriptions to ${subscriptions.length} subscribers of sensor ${sensor.name}`
		);

		for (const subscription of subscriptions) {
			if (subscription.lastNotification != null) {
				// skip if last notified less than 1 hour ago
				const lastNotification = subscription.lastNotification;
				const now = new Date();
				const diffHours = (now.getTime() - lastNotification.getTime()) / (1000 * 60 * 60);
				if (diffHours < 1) {
					console.log(`Last notified ${Math.floor(diffHours)}h ago, skipping`);
					continue;
				}
			}

			try {
				await webpush.sendNotification(
					{
						endpoint: subscription.endpoint,
						keys: {
							p256dh: subscription.keysP256dh,
							auth: subscription.keysAuth
						}
					},
					payload
				);

				await SubscriptionRepository.updateLastNotification(sensor.sensorAddress, new Date());
				console.log(`Sent push notification`);
			} catch (err) {
				if (err instanceof WebPushError && err.statusCode == 410) {
					await SubscriptionRepository.delete({
						endpoint: subscription.endpoint
					});
					console.log(`Deleted expired subscription ${subscription.endpoint}`);
				} else {
					console.error('Error sending push notification', err);
				}
			}
		}
	}
}

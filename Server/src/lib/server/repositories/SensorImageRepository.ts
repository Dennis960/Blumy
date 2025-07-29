import { sensorImages } from '$lib/server/db/schema';
import { db } from '$lib/server/db/worker';
import { desc, eq } from 'drizzle-orm';

export default class SensorImageRepository {
	/**
	 * Create a new sensor image.
	 * @param sensorAddress The address of the sensor.
	 * @param imageBase64 The base64 encoded image.
	 * @returns The created sensor image.
	 */
	static async create(sensorAddress: number, imageBase64: string) {
		return await db
			.insert(sensorImages)
			.values({
				sensorAddress,
				imageBase64
			})
			.returning()
			.then((rows) => rows[0]);
	}

	/**
	 * Get the latest image for a sensor.
	 * @param sensorAddress The address of the sensor.
	 * @returns The latest image or undefined if not found.
	 */
	static async getLatestBySensorAddress(sensorAddress: number) {
		return await db
			.select()
			.from(sensorImages)
			.where(eq(sensorImages.sensorAddress, sensorAddress))
			.orderBy(desc(sensorImages.uploadedAt))
			.limit(1)
			.then((results) => results.pop());
	}

	/**
	 * Update the image for a sensor by creating a new entry.
	 * For now, we keep the old images but only return the latest one.
	 * @param sensorAddress The address of the sensor.
	 * @param imageBase64 The base64 encoded image.
	 * @returns The created sensor image.
	 */
	static async updateBySensorAddress(sensorAddress: number, imageBase64: string) {
		return await this.create(sensorAddress, imageBase64);
	}

	/**
	 * Delete all images for a sensor.
	 * @param sensorAddress The address of the sensor.
	 */
	static async deleteBySensorAddress(sensorAddress: number) {
		await db.delete(sensorImages).where(eq(sensorImages.sensorAddress, sensorAddress));
	}
}

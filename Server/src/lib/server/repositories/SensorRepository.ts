import { sensors } from '$lib/server/db/schema';
import { db } from '$lib/server/db/worker';

import { eq } from 'drizzle-orm';

export default class SensorRepository {
	/**
	 * Get sensor by its address.
	 * @param sensorAddress The address of the sensor.
	 */
	static async getById(sensorAddress: number) {
		return await db
			.select()
			.from(sensors)
			.where(eq(sensors.sensorAddress, sensorAddress))
			.limit(1)
			.then((results) => results.pop());
	}

	static async getIdByWriteToken(writeToken: string) {
		return await db
			.select({ sensorAddress: sensors.sensorAddress })
			.from(sensors)
			.where(eq(sensors.writeToken, writeToken))
			.limit(1)
			.then((results) => results.pop()?.sensorAddress);
	}

	static async getIdByReadToken(readToken: string) {
		return await db
			.select({ sensorAddress: sensors.sensorAddress })
			.from(sensors)
			.where(eq(sensors.readToken, readToken))
			.limit(1)
			.then((results) => results.pop()?.sensorAddress);
	}

	static async getAll() {
		return await db.select().from(sensors);
	}

	/**
	 * Get all sensors owned by a specific owner.
	 * @returns All sensors for the owner.
	 */
	static async getAllForOwner(owner: string) {
		return await db.select().from(sensors).where(eq(sensors.owner, owner));
	}

	/**
	 * Create a new sensor.
	 * @param sensor The sensor details.
	 * @returns The created sensor.
	 */
	static async create(sensor: typeof sensors.$inferInsert) {
		return await db
			.insert(sensors)
			.values(sensor)
			.returning()
			.then((rows) => rows[0]);
	}

	/**
	 * Update the details of a sensor.
	 * @param sensorAddress The address of the sensor.
	 * @param changes The changes to be applied.
	 * @returns The updated sensor.
	 */
	static async update(sensorAddress: number, changes: Partial<typeof sensors.$inferInsert>) {
		if ('sensorAddress' in changes) {
			delete changes['sensorAddress'];
		}

		const updatedSensor = await db
			.update(sensors)
			.set(changes)
			.where(eq(sensors.sensorAddress, sensorAddress))
			.returning()
			.then((rows) => rows[0]);

		if (!updatedSensor) {
			return Promise.reject('Sensor does not exist');
		}

		return updatedSensor;
	}

	/**
	 * Get the owner of a sensor.
	 * @param sensorAddress The address of the sensor.
	 * @returns The owner's ID or undefined if not found.
	 */
	static async getOwner(sensorAddress: number) {
		return await db
			.select({ owner: sensors.owner })
			.from(sensors)
			.where(eq(sensors.sensorAddress, sensorAddress))
			.limit(1)
			.then((results) => results.pop()?.owner);
	}
}

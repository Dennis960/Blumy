import { sensorReadings } from '$lib/server/db/schema';
import { db } from '$lib/server/db/worker';
import { and, asc, avg, count, desc, eq, gte, lte, max, min, sql } from 'drizzle-orm';

const MAX_FIELD_CAPACITY = 2500;

function invertMoisture(
	data: typeof sensorReadings.$inferSelect
): typeof sensorReadings.$inferSelect {
	return {
		...data,
		moisture: MAX_FIELD_CAPACITY - data.moisture
	};
}

export default class SensorDataRepository {
	/**
	 * Add data to the database.
	 * @param data The data to add.
	 * @returns The id of the inserted data or throws an error if the sensor does not exist.
	 */
	static async create(data: typeof sensorReadings.$inferInsert): Promise<number | undefined> {
		data.date = new Date();
		const insertedRecord = await db
			.insert(sensorReadings)
			.values({ ...data })
			.returning({ id: sensorReadings.id });

		return insertedRecord[0]?.id;
	}

	/**
	 * Get data by sensor address. Newest data first.
	 * @param sensorAddress The address of the sensor.
	 * @param startDate The start date in ms since epoch. (optional)
	 * @param endDate The end date in ms since epoch. (optional)
	 * @param maxDataPoints The maximum number of data points. (optional)
	 * @returns The data or an empty list if sensor does not exist.
	 */
	static async getAllBySensorIdAveraged(
		sensorAddress: number,
		startDate: Date,
		endDate: Date,
		maxDataPoints: number
	): Promise<(typeof sensorReadings.$inferSelect)[]> {
		// Fetch data between startDate and endDate
		const startMs = startDate.getTime() / 1000;
		const endMs = endDate.getTime() / 1000;
		const bucket_duration = (endMs - startMs) / maxDataPoints;

		const binned = db.$with('binned').as(
			db
				.select({
					id: sensorReadings.id,
					firmwareVersion: sensorReadings.firmwareVersion,
					sensorAddress: sensorReadings.sensorAddress,
					date: sensorReadings.date,
					light: sensorReadings.light,
					voltage: sensorReadings.voltage,
					temperature: sensorReadings.temperature,
					humidity: sensorReadings.humidity,
					moisture: sensorReadings.moisture,
					moistureStabilizationTime: sensorReadings.moistureStabilizationTime,
					isMoistureMeasurementSuccessful: sensorReadings.isMoistureMeasurementSuccessful,
					humidityRaw: sensorReadings.humidityRaw,
					temperatureRaw: sensorReadings.temperatureRaw,
					rssi: sensorReadings.rssi,
					duration: sensorReadings.duration,
					bin: sql<number>`floor((extract(epoch from ${sensorReadings.date}) - ${startMs}) / ${bucket_duration})`.as(
						'bin'
					)
				})
				.from(sensorReadings)
				.where(
					and(
						sensorReadings.isMoistureMeasurementSuccessful,
						eq(sensorReadings.sensorAddress, sensorAddress),
						gte(sensorReadings.date, startDate),
						lte(sensorReadings.date, endDate)
					)
				)
		);
		const data = await db
			.with(binned)
			.select({
				id: min(sensorReadings.id),
				firmwareVersion: max(sensorReadings.firmwareVersion),
				sensorAddress: max(sensorReadings.sensorAddress),
				date: sql<Date>`to_timestamp(${min(binned.bin)} * ${bucket_duration} + ${startMs})`.as(
					'date'
				),
				light: sql<number>`avg(${sensorReadings.light})`,
				voltage: sql<number>`avg(${sensorReadings.voltage})`,
				temperature: sql<number>`avg(${sensorReadings.temperature})`,
				humidity: sql<number>`avg(${sensorReadings.humidity})`,
				moisture: sql<number>`avg(${sensorReadings.moisture})`,
				moistureStabilizationTime: sql<number>`avg(${sensorReadings.moistureStabilizationTime})`,
				isMoistureMeasurementSuccessful: sql<boolean>`true`,
				humidityRaw: sql<number>`avg(${sensorReadings.humidityRaw})`,
				temperatureRaw: sql<number>`avg(${sensorReadings.temperatureRaw})`,
				rssi: sql<number>`avg(${sensorReadings.rssi})`,
				duration: sql<number>`avg(${sensorReadings.duration})`,
				bin: binned.bin
			})
			.from(binned)
			.groupBy(({ bin }) => bin);

		return data.map(invertMoisture);
	}

	static async getCountByWaterCapacityBucket(
		sensorId: number,
		sinceDate: Date,
		bucketSize: number
	) {
		const dist = await db
			.select({
				count: count(),
				bucket: sql<number>`floor((${MAX_FIELD_CAPACITY} - ${sensorReadings.moisture}) / ${bucketSize}) * ${bucketSize}`
			})
			.from(sensorReadings)
			.where(and(eq(sensorReadings.sensorAddress, sensorId), gte(sensorReadings.date, sinceDate)))
			.groupBy(sensorReadings.moisture)
			.orderBy((table) => asc(table.bucket));

		return dist;
	}

	static async getLastBySensorId(
		sensorAddress: number
	): Promise<typeof sensorReadings.$inferSelect | undefined> {
		const data = await db
			.select()
			.from(sensorReadings)
			.where(eq(sensorReadings.sensorAddress, sensorAddress))
			.orderBy(desc(sensorReadings.date))
			.limit(1);

		if (data.length === 0) {
			return undefined;
		}
		return invertMoisture(data[0]);
	}
}

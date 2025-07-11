import { sensorReadings } from '$lib/server/db/schema';
import { db } from '$lib/server/db/worker';
import { and, asc, count, desc, eq, gte, lte, sql } from 'drizzle-orm';

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
	 * Takes a list of data points and averages them to the specified limit.
	 * The average of "water", "voltage", and "duration" are calculated.
	 * The average of "date" is the last date.
	 * If the limit is greater than the number of data points, the original data is returned.
	 * @param data The list of data to average.
	 * @param limit The final number of data points.
	 * @returns The averaged data.
	 */
	private static dataToAverage(
		data: (typeof sensorReadings.$inferSelect)[],
		limit: number
	): (typeof sensorReadings.$inferSelect)[] {
		if (data.length <= limit) {
			return data;
		}
		const averagedData: (typeof sensorReadings.$inferSelect)[] = [];
		const step = Math.floor(data.length / limit);
		for (let i = 0; i < data.length; i += step) {
			const dataSlice = data.slice(i, i + step);

			// Make a copy of the latest values
			const averagedDataPoint = { ...dataSlice[dataSlice.length - 1] };

			// Calculate averages in this bucket for summable attributes
			const attributesToAverage = [
				'light',
				'voltage',
				'temperature',
				'humidity',
				'moisture',
				'moistureStabilizationTime',
				'humidityRaw',
				'temperatureRaw',
				'rssi',
				'duration'
			] satisfies (keyof (typeof dataSlice)[0])[];

			const calculateAverage = (property: keyof (typeof dataSlice)[0]) =>
				dataSlice.reduce((acc, cur) => acc + ((cur[property] as number) ?? 0), 0) /
				dataSlice.length;

			for (const attribute of attributesToAverage) {
				averagedDataPoint[attribute] = calculateAverage(attribute);
			}

			averagedData.push(averagedDataPoint);
		}
		return averagedData;
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
	) {
		// Fetch data between startDate and endDate
		const data = (
			await db
				.select()
				.from(sensorReadings)
				.where(
					and(
						eq(sensorReadings.sensorAddress, sensorAddress),
						gte(sensorReadings.date, startDate),
						lte(sensorReadings.date, endDate)
					)
				)
				.orderBy(desc(sensorReadings.date))
		).map(invertMoisture);

		// Return the averaged data
		return this.dataToAverage(data, maxDataPoints);
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

import SensorReadingEntity from "../entities/SensorReadingEntity";
import { knex } from "../config/knex.js";

export default class SensorDataRepository {
  /**
   * Add data to the database.
   * @param data The data to add.
   * @returns The id of the inserted data or throws an error if the sensor does not exist.
   */
  static async create(
    data: Omit<SensorReadingEntity, "id">
  ): Promise<number | undefined> {
    data.date = Date.now();
    return knex<SensorReadingEntity>("data").insert({
      id: undefined,
      ...data
    }).returning("id");
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
    data: SensorReadingEntity[],
    limit: number
  ): SensorReadingEntity[] {
    if (data.length <= limit) {
      return data;
    }
    const averagedData: SensorReadingEntity[] = [];
    const step = Math.floor(data.length / limit);
    for (let i = 0; i < data.length; i += step) {
      const dataSlice = data.slice(i, i + step);

      // make a copy of the latest values
      const averagedDataPoint: SensorReadingEntity = { ...dataSlice[dataSlice.length - 1] };

      // calculate averages in this bucket for summable attributes
      const attributesToAverage = [
        "light",
        "voltage",
        "temperature",
        "humidity",
        "moisture",
        "moistureStabilizationTime",
        "humidityRaw",
        "temperatureRaw",
        "rssi",
        "duration",
      ] satisfies (keyof typeof dataSlice[0])[];
      const calculateAverage = (property: keyof typeof dataSlice[0]) =>
        dataSlice.reduce((acc, cur) => acc + (cur[property] as number ?? 0), 0) / dataSlice.length;

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
  ): Promise<SensorReadingEntity[]> {
    // return maxDataPoints averaged data points between startDate and endDate
    const data = await knex<SensorReadingEntity>("data")
      .select("*")
      .where({ sensorAddress })
      .andWhere("date", ">=", startDate)
      .andWhere("date", "<=", endDate)
      .orderBy("date", "desc");
    return this.dataToAverage(data, maxDataPoints);
  }

  static async getCountByWaterCapacityBucket(
    sensorId: number,
    sinceDate: Date,
    bucketSize: number
  ): Promise<{ bucket: number; count: number }[]> {
    const dist = await knex("data")
      .select({
        count: knex.raw("count(*)"),
        bucket: knex.raw(`floor(moisture / ${bucketSize}) * ${bucketSize}`),
      })
      .where({ sensorAddress: sensorId })
      .andWhere("date", ">=", sinceDate)
      .groupBy("bucket")
      .orderBy("bucket");
    return dist;
  }
}

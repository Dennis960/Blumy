import { Data } from "../types/data";
import Sensor from "./SensorRepository.js";
import Knex from "knex";
import knexfile from "../knexfile.js";
export const knex = Knex(knexfile.development);

export default class SensorDataRepository {
  /**
   * Add data to the database.
   * @param data The data to add.
   * @returns The id of the inserted data or throws an error if the sensor does not exist.
   */
  static async create(data: Data): Promise<number | undefined> {
    data.date = Date.now();

    // update sensor name
    if (data.plantName !== undefined) {
      await Sensor.updateName(data.sensorAddress, data.plantName);
    }

    return knex<Data>("data").insert(data).returning("id");
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
  private static dataToAverage(data: Data[], limit: number): Data[] {
    if (data.length <= limit) {
      return data;
    }
    const averagedData: Data[] = [];
    const step = Math.floor(data.length / limit);
    for (let i = 0; i < data.length; i += step) {
      const dataSlice = data.slice(i, i + step);
      const water =
        dataSlice.reduce((acc, cur) => acc + cur.water, 0) / dataSlice.length;
      const voltage =
        dataSlice.reduce((acc, cur) => acc + (cur.voltage ?? 0), 0) /
        dataSlice.length;
      const duration =
        dataSlice.reduce((acc, cur) => acc + (cur.duration ?? 0), 0) /
        dataSlice.length;
      // make a copy of the last data point and change the values
      const averagedDataPoint: Data = {
        ...dataSlice[dataSlice.length - 1],
        water,
        voltage,
        duration,
      };
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
  static async getAllBySensorId(
    sensorAddress: number,
    startDate: Date,
    endDate: Date,
    maxDataPoints: number
  ): Promise<Data[]> {
    // return maxDataPoints averaged data points between startDate and endDate
    const data = await knex<Data>("data")
      .select(
        "id",
        "sensorAddress",
        "plantName",
        "date",
        "water",
        "voltage",
        "duration",
        "rssi",
        "measurementDuration"
      )
      .where({ sensorAddress })
      .andWhere("date", ">=", startDate)
      .andWhere("date", "<=", endDate)
      .orderBy("date", "desc");
    return this.dataToAverage(data, maxDataPoints);
  }
}

import { Data, Sensor } from "./types/data.js";
import { migrateDatabase } from "./migrations.js";
import Knex from "knex";
import knexfile from "./knexfile.js";

const knex = Knex(knexfile.development);
migrateDatabase(knex);

/**
 * Get sensor
 * @param sensorAddress The address of the sensor.
 */
export async function getSensorById(
  sensorAddress: number
): Promise<Sensor | undefined> {
  return await knex("sensor")
    .select("sensorAddress", "name")
    .where({ sensorAddress })
    .first();
}

/**
 * Get all sensors.
 * @returns All sensors.
 */
export async function getSensors(): Promise<Sensor[]> {
  return await knex("sensor").select("sensorAddress", "name");
}

/**
 * @param sensorAddress The address of the sensor.
 * @param name The name of the sensor.
 * @returns The sensor
 */
export async function createSensorWithId(
  sensorAddress: number,
  name = "new sensor"
): Promise<Sensor> {
  return await knex("sensor")
    .insert({ sensorAddress, name })
    .returning(["sensorAddress", "name"])
    .first();
}

/**
 * Update the name of a sensor.
 * @param sensorAddress The address of the sensor.
 * @param name The new name of the sensor.
 * @returns Nothing or throws an error if the sensor does not exist.
 */
export async function updateSensorName(sensorAddress: number, name: string) {
  const id = await knex("sensor")
    .update({ name })
    .where({ sensorAddress })
    .returning(["sensorAddress"])
    .first();
  if (!id) {
    return Promise.reject("Sensor does not exist");
  }
}

/**
 * Add data to the database.
 * @param data The data to add.
 * @returns The id of the inserted data or throws an error if the sensor does not exist.
 */
export async function addDataBySensorId(data: Data) {
  data.date = Date.now();

  // update sensor name
  if (data.plantName !== undefined) {
    await updateSensorName(data.sensorAddress, data.plantName);
  }

  return knex("data").insert(data);
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
function dataToAverage(data: Data[], limit: number) {
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
export async function getDataBySensorId(
  sensorAddress: number,
  startDate: number,
  endDate: number,
  maxDataPoints: number
): Promise<Data[]> {
  // return maxDataPoints averaged data points between startDate and endDate
  const data = (await knex("data")
    .select("*")
    .where({ sensorAddress })
    .andWhere("date", ">=", startDate)
    .andWhere("date", "<=", endDate)
    .orderBy("date", "desc")) as Data[];
  return dataToAverage(data, maxDataPoints);
}

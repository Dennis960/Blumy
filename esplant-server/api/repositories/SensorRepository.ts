import Knex from "knex";
import knexfile from "../knexfile.js";
import { Sensor } from "../types/data.js";
export const knex = Knex(knexfile.development);

export default class SensorRepository {
  /**
   * Get sensor
   * @param sensorAddress The address of the sensor.
   */
  static async getById(sensorAddress: number): Promise<Sensor | undefined> {
    return await knex<Sensor>("sensor")
      .select(
        "sensorAddress",
        "name",
        "fieldCapacity",
        "permanentWiltingPoint",
        "lowerThreshold",
        "upperThreshold"
      )
      .where({ sensorAddress })
      .first();
  }

  /**
   * Get all sensors.
   * @returns All sensors.
   */
  static async getAll(): Promise<Sensor[]> {
    return await knex<Sensor>("sensor").select("sensorAddress", "name");
  }

  /**
   * @param sensorAddress The address of the sensor.
   * @param name The name of the sensor.
   * @returns The sensor
   */
  static async create(
    sensorAddress: number,
    name = "new sensor"
  ): Promise<Sensor> {
    return (await knex<Sensor>("sensor")
      .insert({ sensorAddress, name })
      .returning([
        "sensorAddress",
        "name",
        "fieldCapacity",
        "permanentWiltingPoint",
        "lowerThreshold",
        "upperThreshold",
      ])
      .first())!;
  }

  /**
   * Update the name of a sensor.
   * @param sensorAddress The address of the sensor.
   * @param name The new name of the sensor.
   * @returns Nothing or throws an error if the sensor does not exist.
   */
  static async updateName(sensorAddress: number, name: string) {
    const id = await knex<Sensor>("sensor")
      .update({ name })
      .where({ sensorAddress })
      .returning(["sensorAddress"])
      .then((rows) => rows[0]);
    if (!id) {
      return Promise.reject("Sensor does not exist");
    }
  }

  static async update(
    sensorAddress: number,
    changes: Partial<Sensor>
  ): Promise<Sensor> {
    if ("sensorAddress" in changes) {
      delete changes["sensorAddress"];
    }
    const sensor = await knex<Sensor>("sensor")
      .update(changes)
      .where({ sensorAddress })
      .returning([
        "sensorAddress",
        "name",
        "fieldCapacity",
        "permanentWiltingPoint",
        "lowerThreshold",
        "upperThreshold",
      ])
      .then((r) => r[0]);
    if (sensor == undefined) {
      return Promise.reject("Sensor does not exist");
    }
    return sensor;
  }
}

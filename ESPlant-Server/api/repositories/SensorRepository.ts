import Knex from "knex";
import knexfile from "../knexfile.js";
import SensorEntity from "../entities/SensorEntity.js";
export const knex = Knex(knexfile.development);

export default class SensorRepository {
  /**
   * Get sensor
   * @param sensorAddress The address of the sensor.
   */
  static async getById(sensorAddress: number): Promise<SensorEntity | undefined> {
     return await knex<SensorEntity>("sensor")
      .select(
        "sensorAddress",
        "name",
        "image",
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
  static async getAll(): Promise<SensorEntity[]> {
    return await knex<SensorEntity>("sensor").select(
      "sensorAddress",
      "name",
      "image",
      "fieldCapacity",
      "permanentWiltingPoint",
      "lowerThreshold",
      "upperThreshold"
    );
  }

  /**
   * @param sensorAddress The address of the sensor.
   * @param name The name of the sensor.
   * @returns The sensor
   */
  static async create(
    sensorAddress: number,
    name = "new sensor"
  ): Promise<SensorEntity> {
    return (await knex<SensorEntity>("sensor")
      .insert({ sensorAddress, name })
      .returning([
        "sensorAddress",
        "name",
        "image",
        "fieldCapacity",
        "permanentWiltingPoint",
        "lowerThreshold",
        "upperThreshold",
      ])
      .then((rows) => rows[0]))!;
  }

  /**
   * Update the name of a sensor.
   * @param sensorAddress The address of the sensor.
   * @param name The new name of the sensor.
   * @returns Nothing or throws an error if the sensor does not exist.
   */
  static async updateName(sensorAddress: number, name: string) {
    const id = await knex<SensorEntity>("sensor")
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
    changes: Partial<SensorEntity>
  ): Promise<SensorEntity> {
    if ("sensorAddress" in changes) {
      delete changes["sensorAddress"];
    }
    const sensor = await knex<SensorEntity>("sensor")
      .update(changes)
      .where({ sensorAddress })
      .returning([
        "sensorAddress",
        "name",
        "image",
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

import SensorEntity from "../entities/SensorEntity.js";
import { knex } from "../config/knex.js";

export default class SensorRepository {
  /**
   * Get sensor
   * @param sensorAddress The address of the sensor.
   */
  static async getById(
    sensorAddress: number
  ): Promise<SensorEntity | undefined> {
    return await knex<SensorEntity>("sensor")
      .select("*")
      .where({ sensorAddress })
      .first();
  }

  static async getIdByToken(token: string): Promise<number | undefined> {
    return await knex<SensorEntity>("sensor")
      .select("*")
      .where({ token })
      .first()
      .then((r) => r?.sensorAddress);
  }

  static async getAll(): Promise<SensorEntity[]> {
    return await knex<SensorEntity>("sensor").select("*");
  }

  /**
   * Get all sensors.
   * @returns All sensors.
   */
  static async getAllForOwner(owner: number): Promise<SensorEntity[]> {
    return await knex<SensorEntity>("sensor").select("*").where({ owner });
  }

  /**
   * @param sensorAddress The address of the sensor.
   * @param name The name of the sensor.
   * @returns The sensor
   */
  static async create(
    sensor: Omit<SensorEntity, "sensorAddress">
  ): Promise<SensorEntity> {
    return (await knex<SensorEntity>("sensor")
      .insert(sensor)
      .returning("*")
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
      .returning("*")
      .then((r) => r[0]);
    if (sensor == undefined) {
      return Promise.reject("Sensor does not exist");
    }
    return sensor;
  }

  static async getOwner(sensorAddress: number): Promise<number | undefined> {
    return await knex<SensorEntity>("sensor")
      .select("owner")
      .where({ sensorAddress })
      .first()
      .then((r) => r?.owner);
  }
}

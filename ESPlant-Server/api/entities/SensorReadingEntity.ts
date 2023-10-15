import { z } from "zod";
import { SensorReadingDTO } from "../types/api";
import SensorEntity from "./SensorEntity";

export const espSensorReadingSchema = z.object({
  sensorAddress: z.number(),
  water: z.number(),
  voltage: z.number(),
  duration: z.number(),
  rssi: z.number(),
  measurementDuration: z.number(),
});

export type ESPSensorReadingDTO = z.infer<typeof espSensorReadingSchema>;

export default class SensorReadingEntity {
  constructor(
    public id: number,
    public sensorAddress: number,
    public date: number | string,
    public water: number,
    public voltage: number | null,
    public duration: number | null,
    public rssi: number,
    public measurementDuration: number | null
  ) {}

  public static toDTO(
    reading: SensorReadingEntity,
    sensor: SensorEntity
  ): SensorReadingDTO {
    return {
      id: reading.id,
      timestamp: new Date(reading.date),
      water: reading.water,
      availableWaterCapacity:
        (reading.water - sensor.permanentWiltingPoint) /
        (sensor.fieldCapacity - sensor.permanentWiltingPoint),
      voltage: reading.voltage ?? undefined,
      rssi: reading.rssi,
    };
  }
}

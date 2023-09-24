import { SensorConfigurationDTO, SensorReadingDTO } from "../types/api";

export default class SensorReadingEntity {
  constructor(
    public id: number,
    public sensorAddress: number,
    public plantName: string,
    public date: number | string,
    public water: number,
    public voltage: number | null,
    public duration: number | null,
    public rssi: number,
    public measurementDuration: number | null
  ) {}

  public static toDTO(
    entity: SensorReadingEntity,
    config: SensorConfigurationDTO
  ): SensorReadingDTO {
    return {
      id: entity.id,
      timestamp: new Date(entity.date),
      water: entity.water,
      availableWaterCapacity:
        (entity.water - config.permanentWiltingPoint) /
        (config.fieldCapacity - config.permanentWiltingPoint),
      voltage: entity.voltage ?? undefined,
      rssi: entity.rssi,
    };
  }
}

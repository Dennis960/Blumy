import { SensorConfigurationDTO } from "../types/api";

export default class SensorEntity {
  constructor(
    public sensorAddress: number,
    public name: string,
    public image: Buffer | null,
    public fieldCapacity: number, // sensor unit
    public permanentWiltingPoint: number,
    public lowerThreshold: number, // relative to fieldCapacity
    public upperThreshold: number
  ) {}

  public static fromDTO(id: number, dto: SensorConfigurationDTO): SensorEntity {
    const image = dto.imageUrl.startsWith("data:image/")
      ? Buffer.from(dto.imageUrl.split(",")[1], "base64")
      : null;

    return new SensorEntity(
      id,
      dto.name,
      image,
      dto.fieldCapacity,
      dto.permanentWiltingPoint,
      dto.lowerThreshold,
      dto.upperThreshold
    );
  }

  public static toDTO(entity: SensorEntity): SensorConfigurationDTO {
    const emptyImage =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

    return {
      name: this.name,
      imageUrl:
        entity.image != undefined
          ? "data:image/webp;base64," + entity.image.toString("base64")
          : emptyImage,
      fieldCapacity: entity.fieldCapacity,
      permanentWiltingPoint: entity.permanentWiltingPoint,
      lowerThreshold: entity.lowerThreshold,
      upperThreshold: entity.upperThreshold,
    };
  }
}

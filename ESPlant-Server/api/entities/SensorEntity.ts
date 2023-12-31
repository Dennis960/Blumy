import sharp from "sharp";
import { SensorConfigurationDTO } from "../types/api";

type RedactedSensorEntity = Omit<SensorEntity, "owner" | "token">;

export default class SensorEntity {
  constructor(
    public sensorAddress: number,
    public name: string,
    public image: Buffer | null,
    public fieldCapacity: number, // sensor unit
    public permanentWiltingPoint: number,
    public lowerThreshold: number, // relative to fieldCapacity
    public upperThreshold: number,
    public owner: number,
    public token: string
  ) {}

  public static async fromDTO(
    id: number,
    dto: SensorConfigurationDTO
  ): Promise<RedactedSensorEntity> {
    let image: Buffer | null = null;

    if (dto.imageUrl?.startsWith("data:image/")) {
      const buf = Buffer.from(dto.imageUrl.split(",")[1], "base64");
      image = await sharp(buf)
        .resize(800, 800, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .toFormat("webp")
        .toBuffer();
    }

    return {
      sensorAddress: id,
      name: dto.name,
      image,
      fieldCapacity: dto.fieldCapacity,
      permanentWiltingPoint: dto.permanentWiltingPoint,
      lowerThreshold: dto.lowerThreshold,
      upperThreshold: dto.upperThreshold,
    };
  }

  public static toDTO(entity: RedactedSensorEntity): SensorConfigurationDTO {
    const emptyImage =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

    return {
      name: entity.name,
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

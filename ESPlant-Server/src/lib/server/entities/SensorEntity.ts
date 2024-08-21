import type { SensorConfigurationDTO } from "$lib/types/api";
import sharp from "sharp";

type RedactedSensorEntity = Omit<SensorEntity, "owner" | "readToken" | "writeToken">;

export default class SensorEntity {
  constructor(
    public sensorAddress: number,
    public name: string,
    public imageBase64: string | null,
    public fieldCapacity: number, // sensor unit
    public permanentWiltingPoint: number,
    public lowerThreshold: number, // relative to fieldCapacity
    public upperThreshold: number,
    public owner: string,
    public writeToken: string,
    public readToken: string,
  ) { }

  public static async fromDTO(
    id: number,
    dto: SensorConfigurationDTO
  ): Promise<RedactedSensorEntity> {
    let image: string | null = null;

    if (dto.imageBase64 !== undefined) {
      const buf = Buffer.from(dto.imageBase64, "base64");
      image = await sharp(buf)
        .resize(800, 800, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .toFormat("webp")
        .toBuffer()
        .then((buf) => buf.toString("base64"));
    }

    return {
      sensorAddress: id,
      name: dto.name,
      imageBase64: image,
      fieldCapacity: dto.fieldCapacity,
      permanentWiltingPoint: dto.permanentWiltingPoint,
      lowerThreshold: dto.lowerThreshold,
      upperThreshold: dto.upperThreshold,
    };
  }

  public static toDTO(entity: RedactedSensorEntity): SensorConfigurationDTO {
    return {
      name: entity.name,
      imageBase64: entity.imageBase64 ?? undefined,
      fieldCapacity: entity.fieldCapacity,
      permanentWiltingPoint: entity.permanentWiltingPoint,
      lowerThreshold: entity.lowerThreshold,
      upperThreshold: entity.upperThreshold,
    };
  }
}

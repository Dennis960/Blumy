import { z } from "zod";

export interface SensorReadingDTO {
  id: number;
  timestamp: Date;
  water: number; // sensor units in range 0-1000
  availableWaterCapacity: number; // sensor unit relative to field capacity
  voltage: number | undefined;
  rssi: number;
}

export const sensorConfigurationDTOSchema = z.object({
  name: z.string(),
  imageUrl: z.string().optional(), // data URL for now
  /*
   * Typical permanent wilting points:
   *   26-32% of field capacity for fine-textured soil
   *   10-15% of field capacity for coarse-textured soil
   * ref. https://www.sciencedirect.com/science/article/pii/B9780128117484000170
   */
  fieldCapacity: z.number(), // max water value
  permanentWiltingPoint: z.number(), // min water value
  // difference between fc and pwp in %: available water capacity
  // thresholds for available water capacity
  upperThreshold: z.number(),
  lowerThreshold: z.number(),
});

export type SensorConfigurationDTO = z.infer<typeof sensorConfigurationDTOSchema>;

export interface WaterCapacityHistoryEntry {
  timestamp: Date;
  detectedWatering: boolean;
  waterCapacity: number;
}

export interface SensorHealthDTO {
  warning: boolean;
  critical: boolean;
  signalStrength: "offline" | "strong" | "moderate" | "weak";
  lowBattery: boolean;
}

export interface PlantHealthDTO {
  warning: boolean;
  critical: boolean;
  drowning: boolean;
  wilting: boolean;
  overwatered: boolean;
  underwatered: boolean;
}

export interface SensorDTO {
  id: number;
  token: string;
  config: SensorConfigurationDTO;
  sensorHealth: SensorHealthDTO;
  plantHealth: PlantHealthDTO;
  lastUpdate:
    | {
        timestamp: Date;
        waterCapacity: number;
      }
    | undefined;
  prediction:
    | {
        nextWatering: Date;
        predictedWaterCapacity: WaterCapacityHistoryEntry[];
      }
    | undefined;
}

export interface SensorCreatedDTO {
  id: number;
  token: string;
  config: SensorConfigurationDTO;
}

export interface SensorOverviewDTO {
  sensors: SensorDTO[];
}

export interface SensorHistoryDTO {
  id: number;
  waterCapacityHistory: WaterCapacityHistoryEntry[];
}

export interface SensorValueDistributionDTO {
  waterCapacityDistribution: {
    bucketSize: number;
    entries: {
      bucket: number;
      count: number;
    }[];
  };
}

export interface SensorReadingDTO {
  id: number;
  timestamp: Date;
  water: number; // sensor units in range 0-1000
  availableWaterCapacity: number; // sensor unit relative to field capacity
  voltage: number | undefined;
  rssi: number;
}

export interface SensorConfigurationDTO {
  name: string;
  imageUrl: string; // data URL for now
  fieldCapacity: number; // max water value
  /*
   * Typical permanent wilting points:
   *   26-32% of field capacity for fine-textured soil
   *   10-15% of field capacity for coarse-textured soil
   * ref. https://www.sciencedirect.com/science/article/pii/B9780128117484000170
   */
  permanentWiltingPoint: number; // min water value
  // difference between fc and pwp in %: available water capacity
  // thresholds for available water capacity
  upperThreshold: number;
  lowerThreshold: number;
}

export interface RSSIHistoryEntry {
  timestamp: Date;
  rssi: number;
}

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

export interface SensorOverviewDTO {
  sensors: SensorDTO[];
}

export interface SensorHistoryDTO {
  id: number;
  waterCapacityHistory: WaterCapacityHistoryEntry[];
  rssiHistory: RSSIHistoryEntry[];
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

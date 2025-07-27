import { z } from 'zod';

export interface SensorReadingDTO {
	date: Date; // date of the reading
	id: number;
	firmwareVersion: number;
	timestamp: Date;
	moisture: number; // sensor units in range 0-1000
	availableWaterCapacity: number; // sensor unit relative to field capacity
	voltage: number; // 1.8 - 3.2 Volt
	rssi: number; // dBm
	light: number; // 0.0 - 1.0
	temperature: number; // °C
	humidity: number; // %
}

export const sensorConfigurationDTOSchema = z.object({
	name: z.string(),
	imageBase64: z.string().optional(), // data URL for now
	imageUrl: z.string().optional(), // URL to the image
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
	lowerThreshold: z.number()
});

export type SensorConfigurationDTO = z.infer<typeof sensorConfigurationDTOSchema>;

export interface WaterCapacityHistoryEntry {
	timestamp: Date;
	detectedWatering: boolean;
	waterCapacity: number;
}

export interface LightHistoryEntry {
	timestamp: Date;
	light: number;
}

export interface WeatherHistoryEntry {
	timestamp: Date;
	temperature: number;
	humidity: number;
}

export interface DebugHistoryEntry {
	timestamp: Date;
	rssi: number;
	voltage: number;
}

export interface SensorHealthDTO {
	warning: boolean;
	critical: boolean;
	signalStrength: 'offline' | 'strong' | 'moderate' | 'weak';
	battery: 'empty' | 'low' | 'full' | 'usb';
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
	readToken: string;
	writeToken: string;
	config: SensorConfigurationDTO;
	sensorHealth: SensorHealthDTO;
	plantHealth: PlantHealthDTO;
	lastUpdate?: {
		timestamp: Date;
		waterCapacity: number;
		batteryCapacity: number;
	};
	prediction?: {
		nextWatering: Date;
		predictedWaterCapacity: WaterCapacityHistoryEntry[];
	};
}

export interface SensorCreatedDTO {
	id: number;
	tokens: {
		write: string;
		read: string;
	};
	config: SensorConfigurationDTO;
}

export interface SensorOverviewDTO {
	sensors: SensorDTO[];
}

export interface SensorHistoryDTO {
	id: number;
	waterCapacityHistory: WaterCapacityHistoryEntry[];
	lightHistory: LightHistoryEntry[];
	weatherHistory: WeatherHistoryEntry[];
	debugHistory: DebugHistoryEntry[];
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

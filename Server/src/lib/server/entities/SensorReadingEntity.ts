import type { SensorReadingDTO } from '$lib/types/api';
import { z } from 'zod';
import SensorEntity from './SensorEntity';

export const espSensorReadingSchema = z.object({
	firmwareVersion: z.number(),
	light: z.number(),
	voltage: z.number(),
	temperature: z.number(),
	humidity: z.number(),
	isUsbConnected: z.boolean(),
	moisture: z.number(),
	moistureStabilizationTime: z.number(),
	isMoistureMeasurementSuccessful: z.boolean(),
	humidityRaw: z.number(),
	temperatureRaw: z.number(),
	rssi: z.number(),
	duration: z.number()
});

export type ESPSensorReadingDTO = z.infer<typeof espSensorReadingSchema>;

export default class SensorReadingEntity {
	constructor(
		public id: number,
		public firmwareVersion: number,
		public sensorAddress: number,
		public date: Date,
		public light: number,
		public voltage: number,
		public temperature: number,
		public humidity: number,
		public isUsbConnected: boolean,
		public moisture: number,
		public moistureStabilizationTime: number,
		public isMoistureMeasurementSuccessful: boolean,
		public humidityRaw: number,
		public temperatureRaw: number,
		public rssi: number,
		public duration: number
	) {}

	public static toDTO(reading: SensorReadingEntity, sensor: SensorEntity): SensorReadingDTO {
		return {
			id: reading.id,
			firmwareVersion: reading.firmwareVersion,
			timestamp: new Date(reading.date),
			moisture: reading.moisture,
			availableWaterCapacity:
				(reading.moisture - sensor.permanentWiltingPoint) /
				(sensor.fieldCapacity - sensor.permanentWiltingPoint),
			voltage: reading.voltage ?? undefined,
			rssi: reading.rssi,
			light: reading.light,
			temperature: reading.temperature,
			humidity: reading.humidity
		};
	}
}

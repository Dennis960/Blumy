import { MAX_BATTERY_VOLTAGE, MIN_BATTERY_VOLTAGE } from '$lib/client/config';
import type { ESPSensorReadingDTO } from '$lib/server/entities/SensorReadingEntity';
import type {
	LightHistoryEntry,
	PlantHealthDTO,
	SensorConfigurationDTO,
	SensorCreatedDTO,
	SensorDTO,
	SensorHistoryDTO,
	SensorOverviewDTO,
	SensorReadingDTO,
	SensorValueDistributionDTO,
	WaterCapacityHistoryEntry
} from '$lib/types/api';
import crypto from 'crypto';
import type { sensors } from '../db/schema';
import SensorEntity from '../entities/SensorEntity';
import SensorDataRepository from '../repositories/SensorDataRepository';
import SensorImageRepository from '../repositories/SensorImageRepository';
import SensorRepository from '../repositories/SensorRepository';
import SensorService from '../services/SensorService';

export default class SensorController {
	public async getSensorHistory(
		id: number,
		startDate: Date,
		endDate: Date,
		limit: number = 1000
	): Promise<SensorHistoryDTO> {
		const sensorData = await SensorService.getReadings(id, startDate, endDate, limit);

		const detectedWateringReadings = SensorService.detectWateringReadings(sensorData);

		const waterCapacityHistory: WaterCapacityHistoryEntry[] = sensorData.map((reading) => ({
			timestamp: reading.timestamp,
			detectedWatering: detectedWateringReadings.includes(reading),
			waterCapacity: reading.availableWaterCapacity
		}));

		const lightHistory: LightHistoryEntry[] = sensorData.map((reading) => ({
			timestamp: reading.timestamp,
			light: reading.light
		}));

		const weatherHistory = sensorData.map((reading) => ({
			timestamp: reading.timestamp,
			temperature: reading.temperature,
			humidity: reading.humidity
		}));

		const debugHistory = sensorData.map((reading) => ({
			timestamp: reading.timestamp,
			rssi: reading.rssi,
			voltage: reading.voltage
		}));

		return {
			id,
			waterCapacityHistory,
			lightHistory,
			weatherHistory,
			debugHistory
		};
	}

	public async getSensor(
		id: number,
		userId: string | undefined,
		sensorToken: string | null | undefined
	): Promise<SensorDTO | undefined> {
		const sensorEntity = await SensorRepository.getById(id);
		if (sensorEntity == undefined) {
			return undefined;
		}
		const config = SensorEntity.toDTO(sensorEntity);

		const sensorData = await SensorService.getRecentReadings(id);

		const lastReading = sensorData[sensorData.length - 1];
		const model = SensorService.fitModel(sensorData);

		const sensorHealth = SensorService.getSensorHealth(lastReading);
		const plantHealth = this.getPlantHealth(lastReading, config);

		const images = await SensorImageRepository.getAllBySensorAddress(id);

		return {
			id,
			sensorToken: sensorEntity.sensorToken,
			writeToken: sensorEntity.writeToken,
			config,
			lastUpdate:
				lastReading != undefined
					? {
							timestamp: lastReading.timestamp,
							waterCapacity: lastReading.availableWaterCapacity,
							batteryCapacity: Math.min(
								1,
								Math.max(
									0,
									(lastReading.voltage - MIN_BATTERY_VOLTAGE) /
										(MAX_BATTERY_VOLTAGE - MIN_BATTERY_VOLTAGE)
								)
							)
						}
					: undefined,
			prediction:
				model != undefined
					? {
							nextWatering: model.predictTimestamp(config.lowerThreshold),
							predictedWaterCapacity: model.predictEntries(60 * 60 * 1000, 24)
						}
					: undefined,
			sensorHealth,
			plantHealth,
			isCurrentUserOwner: userId === sensorEntity.owner,
			hasCurrentUserEditPermissions:
				userId === sensorEntity.owner ||
				(sensorEntity.sensorTokenHasEditPermissions && sensorEntity.sensorToken === sensorToken),
			images
		};
	}

	public async getSensorWriteToken(id: number): Promise<string | null> {
		const sensorEntity = await SensorRepository.getById(id);
		if (sensorEntity == undefined) {
			return null;
		}

		return sensorEntity.writeToken;
	}

	public async getSensorOverview(
		userId: string,
		sensorToken: string | null | undefined
	): Promise<SensorOverviewDTO> {
		const sensorsIds = await SensorRepository.getAllIdsForOwner(userId);

		const sensors = await Promise.all(
			sensorsIds.map(
				async (sensor) => (await this.getSensor(sensor.sensorAddress, userId, sensorToken))!
			)
		);

		// sort by water capacity
		sensors.sort((a, b) => {
			if (a.lastUpdate == undefined && b.lastUpdate == undefined) {
				return 0;
			}
			if (a.lastUpdate == undefined) {
				return 1;
			}
			if (b.lastUpdate == undefined) {
				return -1;
			}
			return a.lastUpdate.waterCapacity - b.lastUpdate.waterCapacity;
		});

		return {
			sensors
		};
	}

	private getPlantHealth(
		lastReading: SensorReadingDTO | undefined,
		config: SensorConfigurationDTO
	): PlantHealthDTO {
		const status = {
			drowning: lastReading != undefined && lastReading.availableWaterCapacity > 1.0,
			wilting: lastReading != undefined && lastReading.availableWaterCapacity < 0.0,
			overwatered:
				lastReading != undefined && lastReading.availableWaterCapacity > config.upperThreshold,
			underwatered:
				lastReading != undefined && lastReading.availableWaterCapacity < config.lowerThreshold
		};

		const warning = status.overwatered || status.underwatered;
		const critical = status.drowning || status.wilting;
		return {
			...status,
			warning,
			critical
		};
	}

	public async addSensorData(sensorAddress: number, data: ESPSensorReadingDTO) {
		return await SensorDataRepository.create({
			firmwareVersion: data.firmwareVersion,
			sensorAddress,
			light: data.light,
			voltage: data.voltage,
			temperature: data.temperature,
			humidity: data.humidity,
			moisture: data.moisture,
			moistureStabilizationTime: data.moistureStabilizationTime,
			isMoistureMeasurementSuccessful: data.isMoistureMeasurementSuccessful,
			humidityRaw: data.humidityRaw,
			temperatureRaw: data.temperatureRaw,
			rssi: data.rssi,
			duration: data.duration
		});
	}

	public async getSensorValueDistribution(sensorId: number): Promise<SensorValueDistributionDTO> {
		const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
		const bucketSize = 16;
		const waterCapacityDistribution = await SensorDataRepository.getCountByWaterCapacityBucket(
			sensorId,
			since,
			bucketSize
		);

		return {
			waterCapacityDistribution: {
				bucketSize,
				entries: waterCapacityDistribution
			}
		};
	}

	public async updateSensorConfig(
		sensorId: number,
		config: SensorConfigurationDTO
	): Promise<SensorConfigurationDTO> {
		const redactedSensorEntity = await SensorEntity.fromDTO(sensorId, config);
		const sensorEntity = await SensorRepository.update(sensorId, redactedSensorEntity);

		return SensorEntity.toDTO(sensorEntity);
	}

	private generateToken(prefix: string, length: number) {
		let token = prefix;
		const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		for (let i = 0; i < length; i++) {
			const randomIndex = crypto.randomInt(0, possibleChars.length);
			token += possibleChars[randomIndex];
		}
		return token;
	}

	private generateWriteToken(): string {
		return this.generateToken('blumy_', 32);
	}

	private generateSensorToken(): string {
		return this.generateToken('', 16);
	}

	public async create(ownerId: string, config: SensorConfigurationDTO): Promise<SensorCreatedDTO> {
		const writeToken = this.generateWriteToken();
		const sensorToken = this.generateSensorToken();
		const sensorEntityPartial = await SensorEntity.fromDTO(0, config);

		const creatingSensorEntity: typeof sensors.$inferInsert = {
			...sensorEntityPartial,
			sensorAddress: undefined,
			owner: ownerId,
			writeToken,
			sensorToken
		};
		const sensorEntity = await SensorRepository.create(creatingSensorEntity);

		return {
			tokens: {
				sensor: sensorEntity.sensorToken,
				write: sensorEntity.writeToken
			},
			id: sensorEntity.sensorAddress,
			config: SensorEntity.toDTO(sensorEntity)
		};
	}

	public async deleteSensor(sensorId: number) {
		await SensorRepository.delete(sensorId);
	}
}

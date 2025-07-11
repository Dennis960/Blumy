import type { ESPSensorReadingDTO } from '$lib/server/entities/SensorReadingEntity';
import type {
	LightHistoryEntry,
	PlantHealthDTO,
	SensorConfigurationDTO,
	SensorCreatedDTO,
	SensorDTO,
	SensorHealthDTO,
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
import SensorRepository from '../repositories/SensorRepository';
import SensorService from '../services/SensorService';

const OFFLINE_TIMEOUT = 120 * 60 * 1000; // 2 hours

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

	public async getSensor(id: number): Promise<SensorDTO | undefined> {
		const sensorEntity = await SensorRepository.getById(id);
		if (sensorEntity == undefined) {
			return undefined;
		}
		const config = SensorEntity.toDTO(sensorEntity);

		const sensorData = await SensorService.getRecentReadings(id);

		const lastReading = sensorData[sensorData.length - 1];
		const model = SensorService.fitModel(sensorData);

		const sensorHealth = this.getSensorHealth(lastReading);
		const plantHealth = this.getPlantHealth(lastReading, config);

		return {
			id,
			readToken: sensorEntity.readToken,
			writeToken: sensorEntity.writeToken,
			config,
			lastUpdate:
				lastReading != undefined
					? {
							timestamp: lastReading.timestamp,
							waterCapacity: lastReading.availableWaterCapacity,
							batteryCapacity: Math.min(1, Math.max(0, (lastReading.voltage - 2.14) / (3.0 - 2.14)))
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
			plantHealth
		};
	}

	public async getSensorWriteToken(id: number): Promise<string | null> {
		const sensorEntity = await SensorRepository.getById(id);
		if (sensorEntity == undefined) {
			return null;
		}

		return sensorEntity.writeToken;
	}

	public async getSensorOverview(ownerId: string): Promise<SensorOverviewDTO> {
		const sensorsIds = await SensorRepository.getAllForOwner(ownerId);

		const sensors = await Promise.all(
			sensorsIds.map(async (sensor) => (await this.getSensor(sensor.sensorAddress))!)
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

	private getSensorHealth(lastReading: SensorReadingDTO | undefined): SensorHealthDTO {
		const status: Pick<SensorHealthDTO, 'signalStrength' | 'battery'> = {
			signalStrength:
				lastReading == undefined || lastReading.timestamp < new Date(Date.now() - OFFLINE_TIMEOUT)
					? 'offline'
					: lastReading.rssi > -55
						? 'strong'
						: lastReading.rssi > -67
							? 'moderate'
							: 'weak',
			battery:
				lastReading == undefined || lastReading.voltage > 4
					? 'usb'
					: lastReading.voltage < 2.3
						? 'empty'
						: lastReading.voltage < 2.4
							? 'low'
							: 'full'
		};

		const warning = status.signalStrength == 'weak' || status.battery == 'low';
		const critical = status.signalStrength == 'offline' || status.battery == 'empty';

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
			isUsbConnected: data.isUsbConnected,
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
		config: Partial<typeof sensors.$inferSelect>
	): Promise<SensorConfigurationDTO> {
		const sensorEntity = await SensorRepository.update(sensorId, config);

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

	private generateReadToken(): string {
		return this.generateToken('', 16);
	}

	public async create(ownerId: string, config: SensorConfigurationDTO): Promise<SensorCreatedDTO> {
		const writeToken = this.generateWriteToken();
		const readToken = this.generateReadToken();
		const sensorEntityPartial = await SensorEntity.fromDTO(0, config);

		const creatingSensorEntity: typeof sensors.$inferInsert = {
			...sensorEntityPartial,
			sensorAddress: undefined,
			owner: ownerId,
			writeToken,
			readToken
		};
		const sensorEntity = await SensorRepository.create(creatingSensorEntity);

		return {
			tokens: {
				read: sensorEntity.readToken,
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

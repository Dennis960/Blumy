import {
  PlantHealthDTO,
  RSSIHistoryEntry,
  SensorConfigurationDTO,
  SensorDTO,
  SensorHealthDTO,
  SensorHistoryDTO,
  SensorOverviewDTO,
  SensorReadingDTO,
  SensorValueDistributionDTO,
  WaterCapacityHistoryEntry,
} from "../types/api.js";
import SensorDataRepository from "../repositories/SensorDataRepository.js";
import SensorRepository from "../repositories/SensorRepository.js";
import SensorService from "../services/SensorService.js";
import SensorReadingEntity from "../entities/SensorReadingEntity.js";

const OFFLINE_TIMEOUT = 120 * 60 * 1000; // 2 hours

export default class SensorController {
  public async getSensorHistory(
    id: number,
    startDate: Date,
    endDate: Date,
    limit: number = 1000
  ): Promise<SensorHistoryDTO | undefined> {
    const sensorData = await SensorService.getReadings(
      id,
      startDate,
      endDate,
      limit
    );

    const detectedWateringReadings =
      SensorService.detectWateringReadings(sensorData);

    const rssiHistory: RSSIHistoryEntry[] = sensorData.map((reading) => ({
      timestamp: reading.timestamp,
      rssi: reading.rssi,
    }));

    const waterCapacityHistory: WaterCapacityHistoryEntry[] = sensorData.map(
      (reading) => ({
        timestamp: reading.timestamp,
        detectedWatering: detectedWateringReadings.includes(reading),
        waterCapacity: reading.availableWaterCapacity,
      })
    );

    return {
      id,
      waterCapacityHistory,
      rssiHistory,
    };
  }

  public async getSensor(id: number): Promise<SensorDTO | undefined> {
    const config = await SensorService.getConfiguration(id);
    if (config == undefined) {
      return undefined;
    }

    const sensorData = await SensorService.getRecentReadings(id);

    const lastReading = sensorData[sensorData.length - 1];
    const model = SensorService.fitModel(sensorData);

    const sensorHealth = this.getSensorHealth(lastReading);
    const plantHealth = this.getPlantHealth(lastReading, config);

    return {
      id,
      config,
      lastUpdate:
        lastReading != undefined
          ? {
              timestamp: lastReading.timestamp,
              waterCapacity: lastReading.availableWaterCapacity,
            }
          : undefined,
      prediction:
        model != undefined
          ? {
              nextWatering: model.predictTimestamp(config.lowerThreshold),
              predictedWaterCapacity: model.predictEntries(60 * 60 * 1000, 24),
            }
          : undefined,
      sensorHealth,
      plantHealth,
    };
  }

  public async getSensorOverview(): Promise<SensorOverviewDTO> {
    const sensorsIds = await SensorRepository.getAll();

    const sensors = await Promise.all(
      sensorsIds.map(
        async (sensor) => (await this.getSensor(sensor.sensorAddress))!
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
      sensors,
    };
  }

  private getPlantHealth(
    lastReading: SensorReadingDTO | undefined,
    config: SensorConfigurationDTO
  ): PlantHealthDTO {
    const status = {
      drowning:
        lastReading != undefined && lastReading.availableWaterCapacity > 1.0,
      wilting:
        lastReading != undefined && lastReading.availableWaterCapacity < 0.0,
      overwatered:
        lastReading != undefined &&
        lastReading.availableWaterCapacity > config.upperThreshold,
      underwatered:
        lastReading != undefined &&
        lastReading.availableWaterCapacity < config.lowerThreshold,
    };

    const warning = status.overwatered || status.underwatered;
    const critical = status.drowning || status.wilting;
    return {
      ...status,
      warning,
      critical,
    };
  }

  private getSensorHealth(
    lastReading: SensorReadingDTO | undefined
  ): SensorHealthDTO {
    const status = {
      signalStrength:
        lastReading == undefined ||
        lastReading.timestamp < new Date(Date.now() - OFFLINE_TIMEOUT)
          ? ("offline" as const)
          : lastReading.rssi > -55
          ? ("strong" as const)
          : lastReading.rssi > -67
          ? ("moderate" as const)
          : ("weak" as const),
      lowBattery: lastReading != undefined && false, // TODO
    };

    const warning = status.signalStrength == "weak" || status.lowBattery;
    const critical = status.signalStrength == "offline";
    return {
      ...status,
      warning,
      critical,
    };
  }

  public async addSensorData(data: SensorReadingEntity) {
    const sensor = await SensorRepository.getById(data.sensorAddress);
    if (!sensor) {
      // create sensor
      const createdSensor = await SensorRepository.create(data.sensorAddress);
      if (createdSensor == undefined) {
        throw new Error("could not create sensor");
      }
    }
    // add data
    return await SensorDataRepository.create(data);
  }

  public async getSensorValueDistribution(
    sensorId: number
  ): Promise<SensorValueDistributionDTO> {
    const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const bucketSize = 16;
    const waterCapacityDistribution =
      await SensorDataRepository.getCountByWaterCapacityBucket(
        sensorId,
        since,
        bucketSize
      );

    return {
      waterCapacityDistribution: {
        bucketSize,
        entries: waterCapacityDistribution,
      },
    };
  }

  public async updateSensorConfig(
    sensorId: number,
    config: SensorConfigurationDTO
  ): Promise<SensorConfigurationDTO> {
    return await SensorService.setConfiguration(sensorId, config);
  }
}

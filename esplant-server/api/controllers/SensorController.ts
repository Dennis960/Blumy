import { calculateDerivative, exponentialRegression } from "../util/ml.js";
import { Data } from "../types/data.js";
import {
  PlantHealthDTO,
  RSSIHistoryEntry,
  SensorConfiguration,
  SensorDTO,
  SensorHealthDTO,
  SensorHistoryDTO,
  SensorOverviewDTO,
  SensorReading,
  WaterCapacityHistoryEntry,
} from "../types/api.js";
import Sensor from "../repositories/SensorRepository.js";
import SensorDataRepository from "../repositories/SensorDataRepository.js";
import SensorRepository from "../repositories/SensorRepository.js";

const OFFLINE_TIMEOUT = 120 * 60 * 1000; // 2 hours
const WATERING_THRESHOLD = 0.05 / (60 * 60 * 1000); // water capacity gain per hour threshold
const WATERING_WINDOW = 4 * 60 * 60 * 1000;
const PREDICTION_IMPLAUSIBLE_WATERLOSS_EXPONENT = -0.05 / (60 * 60 * 1000); // max plausible water capacity loss per ms

export default class DataController {
  private async getSensorConfiguration(
    id: number
  ): Promise<SensorConfiguration | undefined> {
    const sensor = await Sensor.getById(id);
    if (sensor == undefined) {
      return undefined;
    }
    return sensor
  }

  private mapData(r: Data, config: SensorConfiguration): SensorReading {
    return {
      id: r.id!,
      timestamp: new Date(r.date!),
      water: r.water,
      availableWaterCapacity:
        (r.water - config.permanentWiltingPoint) /
        (config.fieldCapacity - config.permanentWiltingPoint),
      voltage: r.voltage,
      rssi: r.rssi!,
    };
  }

  public async getSensorHistory(
    id: number,
    startDate: Date,
    endDate: Date,
    limit: number = 1000
  ): Promise<SensorHistoryDTO | undefined> {
    const data = await SensorDataRepository.getAllBySensorId(
      id,
      startDate,
      endDate,
      limit
    );
    const config = await this.getSensorConfiguration(id);
    if (config == undefined) {
      return undefined;
    }
    const sensorData: SensorReading[] = data.map((r) =>
      this.mapData(r, config)
    );
    sensorData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const detectedWateringReadings = this.detectWateringReadings(sensorData);

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
    const config = await this.getSensorConfiguration(id);
    if (config == undefined) {
      return undefined;
    }

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const data = await SensorDataRepository.getAllBySensorId(
      id,
      weekAgo,
      new Date(),
      1000
    );
    const sensorData: SensorReading[] = data.map((r) =>
      this.mapData(r, config)
    );
    sensorData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const lastReading = sensorData[sensorData.length - 1];

    const detectedWateringReadings = this.detectWateringReadings(sensorData);
    const model = this.fitModel(sensorData, detectedWateringReadings);

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
              predictedWaterCapacity:
                model.predictEntries(60 * 60 * 1000, 24),
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

    return {
      sensors,
    };
  }

  private getPlantHealth(
    lastReading: SensorReading | undefined,
    config: SensorConfiguration
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
    lastReading: SensorReading | undefined
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

  /**
   * Find all readings where the sensor was watered
   */
  private detectWateringReadings(readings: SensorReading[]) {
    // calculate second derivate
    const deltas = calculateDerivative(
      readings.map((reading) => ({
        timestamp: reading.timestamp,
        value: reading.availableWaterCapacity,
      }))
    );

    // find peaks
    const peaks = deltas
      .map((delta) =>
        delta.value > WATERING_THRESHOLD ? delta.timestamp : undefined
      )
      .filter((timestamp): timestamp is Date => timestamp != undefined)
      .map((timestamp) => {
        // find max reading within 2h window
        const windowBefore = new Date(
          timestamp.getTime() - WATERING_WINDOW / 2
        );
        const windowAfter = new Date(timestamp.getTime() + WATERING_WINDOW / 2);
        const window = readings.filter(
          (reading) =>
            reading.timestamp >= windowBefore && reading.timestamp < windowAfter
        );
        window.sort(
          (a, b) => b.availableWaterCapacity - a.availableWaterCapacity
        );
        return window[0];
      })
      .filter((reading) => reading !== undefined)
      .filter(
        (reading, index, array) =>
          array.findIndex((item) => item.timestamp === reading.timestamp) ===
          index
      );

    return peaks;
  }

  /**
   * Predict available water capacity
   */
  private fitModel(
    sensorReadings: SensorReading[],
    wateringReadings: SensorReading[]
  ) {
    if (sensorReadings.length === 0) {
      return undefined;
    }
    const lastWateringReading =
      wateringReadings.length > 0
        ? wateringReadings[wateringReadings.length - 1]
        : sensorReadings[0];
    // filter since last watering
    const sensorReadingsSinceLastWatering = sensorReadings.slice(
      sensorReadings.indexOf(lastWateringReading) + 1
    );
    if (sensorReadingsSinceLastWatering.length == 0) {
      return undefined;
    }
    // transform to [x: ms, y: available water capacity]
    const tuples = sensorReadingsSinceLastWatering.map((reading) => [
      reading.timestamp.getTime() - lastWateringReading.timestamp.getTime(),
      reading.availableWaterCapacity,
    ]);

    // fit exponential regression
    const { a, b } = exponentialRegression(tuples);

    if (isNaN(a) || isNaN(b)) {
      // no fit
      return undefined;
    }

    if (b >= 0 || b < PREDICTION_IMPLAUSIBLE_WATERLOSS_EXPONENT) {
      // implausible
      return undefined;
    }

    function predictEntries(intervalMs: number, intervals: number) {
      const predictions: WaterCapacityHistoryEntry[] = [];
      const t1 = Date.now() - lastWateringReading.timestamp.getTime() + intervalMs * intervals;
      for (
        let offset = 0;
        offset < t1;
        offset += intervalMs
      ) {
        predictions.push({
          timestamp: new Date(lastWateringReading.timestamp.getTime() + offset),
          waterCapacity: a * Math.exp(b * offset),
          detectedWatering: false,
        });
      }
      return predictions;
    }

    function predictTimestamp(availableWaterCapacity: number) {
      const delta = Math.log(availableWaterCapacity / a) / b;
      return new Date(lastWateringReading.timestamp.getTime() + delta);
    }

    return {
      predictEntries,
      predictTimestamp,
    };
  }

  public async addSensorData(data: Data) {
    // check if sensor exists
    let sensorExists = true;
    const sensor = await SensorRepository.getById(data.sensorAddress);
    if (!sensor) {
      sensorExists = false;
      // create sensor
      const createdSensor = await SensorRepository.create(data.sensorAddress);
      if (createdSensor == undefined) {
        throw new Error("could not create sensor");
      }
    }
    // add data
    return await SensorDataRepository.create(data);
  }
}

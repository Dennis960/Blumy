import SensorReadingEntity from "../entities/SensorReadingEntity.js";
import SensorDataRepository from "../repositories/SensorDataRepository.js";
import SensorRepository from "../repositories/SensorRepository.js";
import {
  SensorReadingDTO,
  WaterCapacityHistoryEntry,
} from "../types/api.js";
import { calculateDerivative, exponentialRegression } from "../util/ml.js";

const WATERING_THRESHOLD = 0.05 / (60 * 60 * 1000); // water capacity gain per hour threshold
const WATERING_WINDOW = 4 * 60 * 60 * 1000;
const PREDICTION_IMPLAUSIBLE_WATERLOSS_EXPONENT = -0.05 / (60 * 60 * 1000); // max plausible water capacity loss per ms

export default class SensorService {
  public static async getRecentReadings(
    id: number
  ): Promise<SensorReadingDTO[]> {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return await this.getReadings(id, oneWeekAgo, new Date());
  }

  public static async getReadings(
    id: number,
    startDate: Date,
    endDate: Date,
    limit: number = 1000
  ): Promise<SensorReadingDTO[]> {
    const sensorEntity = await SensorRepository.getById(id);
    if (sensorEntity == undefined) {
      return [];
    }
    const data = await SensorDataRepository.getAllBySensorId(
      id,
      startDate,
      endDate,
      limit
    );
    const sensorData: SensorReadingDTO[] = data.map((r) =>
      SensorReadingEntity.toDTO(r, sensorEntity)
    );
    sensorData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    return sensorData;
  }
  /**
   * Find all readings where the sensor was watered
   */
  public static detectWateringReadings(readings: SensorReadingDTO[]) {
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
  public static fitModel(sensorReadings: SensorReadingDTO[]) {
    if (sensorReadings.length === 0) {
      return undefined;
    }
    const wateringReadings =
      SensorService.detectWateringReadings(sensorReadings);
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
      const t1 =
        Date.now() -
        lastWateringReading.timestamp.getTime() +
        intervalMs * intervals;
      for (let offset = 0; offset < t1; offset += intervalMs) {
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
}

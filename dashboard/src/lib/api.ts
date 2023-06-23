import { calculateDerivative, exponentialRegression } from './ml';

export interface SensorReading {
    id: number;
    timestamp: Date;
    water: number; // sensor units in range 0-1000
    availableWaterCapacity: number; // sensor unit relative to field capacity
    voltage: number;
    rssi: number;
}

export interface SensorConfiguration {
    name: string;
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

export interface WaterCapacityHistoryEntry {
    timestamp: Date;
    predicted: boolean;
    detectedWatering: boolean;
    availableWaterCapacity: number;
}

export interface RSSIHistoryEntry {
    timestamp: Date;
    rssi: number;
}

export interface SensorStatus {
    signalStrength: 'offline' | 'strong' | 'moderate' | 'weak';
    drowning: boolean;
    wilting: boolean;
    overwatered: boolean;
    underwatered: boolean;
    waterToday: boolean;
    waterTomorrow: boolean;
    lowBattery: boolean;
}

export interface Sensor {
    id: number;
    config: SensorConfiguration;
    lastReading: SensorReading | undefined;
    waterCapacityHistory: WaterCapacityHistoryEntry[];
    rssiHistory: RSSIHistoryEntry[];
    estimatedNextWatering: Date | undefined;
    status: SensorStatus;
}

export interface SensorStub {
    id: number;
    name: string;
}

const BASE_URL = 'https://esplant.hoppingadventure.com/api';
const DEFAULT_HISTORY_DAYS = 3;
const OFFLINE_TIMEOUT = 120 * 60 * 1000; // 2 hours
const WATERING_THRESHOLD = 0.05 / (60 * 60 * 1000); // water capacity gain per hour threshold
const WATERING_WINDOW = 4 * 60 * 60 * 1000;
const PREDICTION_IMPLAUSIBLE_WATERLOSS_EXPONENT = -0.05 / (60 * 60 * 1000); // max plausible water capacity loss per ms

/**
 * Find all readings where the sensor was watered
 */
function detectWateringReadings(readings: SensorReading[]) {
    // calculate second derivate
    const deltas = calculateDerivative(
        readings.map((reading) => ({
            timestamp: reading.timestamp,
            value: reading.availableWaterCapacity
        }))
    );

    // find peaks
    const peaks = deltas
        .map((delta) => (delta.value > WATERING_THRESHOLD ? delta.timestamp : undefined))
        .filter((timestamp): timestamp is Date => timestamp != undefined)
        .map((timestamp) => {
            // find max reading within 2h window
            const windowBefore = new Date(timestamp.getTime() - WATERING_WINDOW / 2);
            const windowAfter = new Date(timestamp.getTime() + WATERING_WINDOW / 2);
            const window = readings.filter(
                (reading) => reading.timestamp >= windowBefore && reading.timestamp < windowAfter
            );
            window.sort((a, b) => b.availableWaterCapacity - a.availableWaterCapacity);
            return window[0];
        })
        .filter((reading) => reading !== undefined)
        .filter(
            (reading, index, array) =>
                array.findIndex((item) => item.timestamp === reading.timestamp) === index
        );

    return peaks;
}

/**
 * Predict available water capacity
 */
function fitModel(sensorReadings: SensorReading[], wateringReadings: SensorReading[]) {
    if (sensorReadings.length === 0) {
        return undefined;
    }
    const lastWateringReading =
        wateringReadings.length > 0 ? wateringReadings[wateringReadings.length - 1] : sensorReadings[0];
    // filter since last watering
    const sensorReadingsSinceLastWatering = sensorReadings.slice(sensorReadings.indexOf(lastWateringReading) + 1);
    if (sensorReadingsSinceLastWatering.length == 0) {
        return undefined;
    }
    // transform to [x: ms, y: available water capacity]
    const tuples = sensorReadingsSinceLastWatering.map((reading) => [
        reading.timestamp.getTime() - lastWateringReading.timestamp.getTime(),
        reading.availableWaterCapacity
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
        const predictions: { timestamp: Date; availableWaterCapacity: number }[] = [];
        const t0 = tuples[tuples.length - 1][0];
        for (let offset = t0; offset < t0 + intervals * intervalMs; offset += intervalMs) {
            predictions.push({
                timestamp: new Date(lastWateringReading.timestamp.getTime() + offset),
                availableWaterCapacity: a * Math.exp(b * offset)
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
        predictTimestamp
    };
}

function calculateStatus(
    lastReading: SensorReading | undefined,
    config: SensorConfiguration,
    estimatedNextWatering: Date | undefined
) {
    return {
        drowning: lastReading != undefined && lastReading.availableWaterCapacity > 1.0,
        wilting: lastReading != undefined && lastReading.availableWaterCapacity < 0.0,
        overwatered:
            lastReading != undefined && lastReading.availableWaterCapacity > config.upperThreshold,
        underwatered:
            lastReading != undefined && lastReading.availableWaterCapacity < config.lowerThreshold,
        waterToday:
            estimatedNextWatering != undefined &&
            (estimatedNextWatering <= new Date() || estimatedNextWatering.toLocaleDateString() == new Date().toLocaleDateString()),
        waterTomorrow:
            estimatedNextWatering != undefined &&
            estimatedNextWatering.toLocaleDateString() ==
            new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString(),
        signalStrength:
            lastReading == undefined || lastReading.timestamp < new Date(Date.now() - OFFLINE_TIMEOUT) ? 'offline' :
                lastReading.rssi > -55 ? 'strong' :
                    lastReading.rssi > -67 ? 'moderate' : 'weak',
        lowBattery: lastReading != undefined && false, // TODO
    } satisfies SensorStatus;
}

export async function fetchSensors(): Promise<SensorStub[]> {
    const sensors = await fetch(`${BASE_URL}/sensors`)
        .then((response) => response.json())
        .then((data) => data.data);
    return sensors.map((s: any) => ({
        id: s.sensorAddress,
        name: s.name
    }));
}

export async function fetchSensorData(
    id: number,
    name: string,
    startDate: Date,
    endDate: Date
): Promise<Sensor> {
    const params = new URLSearchParams({
        startDate: startDate.getTime().toString(),
        endDate: endDate.getTime().toString(),
        maxDataPoints: '9999999'
    });
    const config: SensorConfiguration = {
        name,
        // TODO fetch config from API
        fieldCapacity: 1000,
        permanentWiltingPoint: 300,
        lowerThreshold: 0.2,
        upperThreshold: 0.8
    };
    const sensorData = (await fetch(`${BASE_URL}/sensors/${id}/data?` + params.toString())
        .then((response) => response.json())
        .then((data) =>
            data.data.map(
                (r: any) =>
                ({
                    id: r.id,
                    timestamp: new Date(r.date),
                    water: r.water,
                    availableWaterCapacity:
                        (r.water - config.permanentWiltingPoint) /
                        (config.fieldCapacity - config.permanentWiltingPoint),
                    voltage: r.voltage,
                    rssi: r.rssi
                } satisfies SensorReading)
            )
        )) as SensorReading[];
    sensorData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const lastReading = sensorData[sensorData.length - 1];

    const detectedWateringReadings = detectWateringReadings(sensorData);
    const model = fitModel(sensorData, detectedWateringReadings);
    
    const rssiHistory = sensorData.map((reading) => ({
        timestamp: reading.timestamp,
        rssi: reading.rssi
    }));

    const waterCapacityHistory = (<WaterCapacityHistoryEntry[]>[]).concat(
        sensorData.map((reading) => ({
            timestamp: reading.timestamp,
            predicted: false,
            detectedWatering: detectedWateringReadings.includes(reading),
            availableWaterCapacity: reading.availableWaterCapacity
        })),
        model == undefined
            ? []
            : model.predictEntries(60 * 60 * 1000, 24).map((entry) => ({
                timestamp: entry.timestamp,
                predicted: true,
                detectedWatering: false,
                availableWaterCapacity: entry.availableWaterCapacity
            }))
    );

    const status = calculateStatus(
        lastReading,
        config,
        model?.predictTimestamp(config.lowerThreshold)
    );

    return {
        id,
        config,
        lastReading,
        waterCapacityHistory,
        rssiHistory,
        estimatedNextWatering:
            model == undefined ? undefined : model.predictTimestamp(config.lowerThreshold),
        status
    }
}

import { clientApi } from './api';

interface Sensor {
	id: number;
	sensorToken: string;
}

/**
 * @deprecated
 */
interface OldSensor {
	id: number;
	readToken: string;
}

function isOldSensor(sensor: Sensor | OldSensor): sensor is OldSensor {
	return (sensor as OldSensor).readToken !== undefined;
}

const STORAGE_KEY = 'sensors';

/**
 * SensorStorage is a utility class for managing sensor data in local storage.
 * It allows adding, removing, and retrieving sensors that are not owned by the current user but can be accessed via sensor tokens.
 */
export class SensorStorage {
	static getSensors(): Sensor[] {
		if (typeof localStorage === 'undefined') return [];
		const data = localStorage.getItem(STORAGE_KEY);
		const sensorsFromStorage = data ? (JSON.parse(data) as (Sensor | OldSensor)[]) : [];
		let migrated = false;
		const sensors = sensorsFromStorage.map((sensor) => {
			if (isOldSensor(sensor)) {
				migrated = true;
				return {
					id: sensor.id,
					sensorToken: sensor.readToken
				};
			}
			return sensor;
		});
		if (migrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(sensors));
		return sensors;
	}

	static addSensor(id: number, sensorToken: string): void {
		const sensors = SensorStorage.getSensors();
		const index = sensors.findIndex((s) => s.id === id);
		if (index !== -1) {
			sensors[index] = {
				id,
				sensorToken
			};
		} else {
			sensors.push({ id, sensorToken });
		}
		localStorage.setItem(STORAGE_KEY, JSON.stringify(sensors));
	}

	static removeSensor(id: number): void {
		const sensors = SensorStorage.getSensors().filter((sensor) => sensor.id !== id);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(sensors));
	}

	static async loadStoredSensors() {
		const sensors = SensorStorage.getSensors();
		const apiCall = clientApi().sensorList().withIdsAndTokens(sensors);
		if ((await apiCall.response()).ok) {
			const storedSensors = await apiCall.parse();
			for (const sensor of storedSensors) {
				// TODO, make it so parsing string to date is not necessary (use superjson?)
				if (sensor.prediction?.nextWatering)
					sensor.prediction.nextWatering = new Date(sensor.prediction.nextWatering);
				if (sensor.lastUpdate?.timestamp)
					sensor.lastUpdate.timestamp = new Date(sensor.lastUpdate.timestamp);
			}
			return storedSensors;
		}
		return [];
	}
}

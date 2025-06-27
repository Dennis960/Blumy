import { clientApi } from './api';

interface Sensor {
	id: number;
	readToken: string;
}

const STORAGE_KEY = 'sensors';

export class SensorStorage {
	static getSensors(): Sensor[] {
		if (typeof localStorage === 'undefined') return [];
		const data = localStorage.getItem(STORAGE_KEY);
		return data ? (JSON.parse(data) as Sensor[]) : [];
	}

	static addSensor(id: number, readToken: string): void {
		const sensors = SensorStorage.getSensors();
		const index = sensors.findIndex((s) => s.id === id);
		if (index !== -1) {
			sensors[index] = {
				id,
				readToken
			};
		} else {
			sensors.push({ id, readToken });
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

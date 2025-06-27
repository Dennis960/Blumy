import type { SensorDTO } from './types/api';

export enum SortKey {
	NAME,
	ID,
	WATER_CAPACITY,
	NEXT_WATERING,
	SENSOR_HEALTH
}
export function sortQueryDataBy(sensors: SensorDTO[], sortKey: SortKey, ascending = true) {
	return sensors.sort((a, b) => {
		const comparison = compareSensorsBy(a, b, sortKey);
		return ascending ? comparison : -comparison;
	});
}
function compareSensorsBy(sensorA: SensorDTO, sensorB: SensorDTO, sortKey: SortKey) {
	if (sortKey === SortKey.NAME) {
		return sensorA.config.name.localeCompare(sensorB.config.name);
	}
	if (sortKey === SortKey.ID) {
		return sensorA.id - sensorB.id;
	}
	if (sortKey === SortKey.NEXT_WATERING) {
		if (
			sensorA.prediction?.nextWatering == undefined &&
			sensorB.prediction?.nextWatering == undefined
		)
			return 0;
		if (sensorA.prediction?.nextWatering == undefined) return -1;
		if (sensorB.prediction?.nextWatering == undefined) return 1;
		return sensorA.prediction.nextWatering.getTime() - sensorB.prediction.nextWatering.getTime();
	}
	if (sortKey === SortKey.WATER_CAPACITY) {
		if (
			sensorA.lastUpdate?.waterCapacity == undefined &&
			sensorB.lastUpdate?.waterCapacity == undefined
		)
			return 0;
		if (sensorA.lastUpdate?.waterCapacity == undefined) return -1;
		if (sensorB.lastUpdate?.waterCapacity == undefined) return 1;
		return sensorA.lastUpdate.waterCapacity - sensorB.lastUpdate.waterCapacity;
	}
	if (sortKey === SortKey.SENSOR_HEALTH) {
		if (sensorA.sensorHealth.critical) return 1;
		if (sensorB.sensorHealth.critical) return -1;
		if (sensorA.sensorHealth.warning) return 1;
		if (sensorB.sensorHealth.warning) return -1;
		return 0;
	}
	return 0;
}

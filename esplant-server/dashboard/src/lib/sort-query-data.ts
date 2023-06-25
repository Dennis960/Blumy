import type { Sensor, SensorStub } from '$lib/api';

export enum SortKey {
	NAME,
	ID,
	WATER_CAPACITY,
	NEXT_WATERING,
	SENSOR_HEALTH
}
// TODO add types
export function sortQueryDataBy(
	queryData: SensorStub[],
	sensors: Record<number, Sensor>,
	sortKey: SortKey,
	ascending = true
) {
	// sort queryData by corresponding sensor next watering
	return queryData.sort((a, b) => {
		const comparison = compareBy(a, b, sensors, sortKey);
		return ascending ? comparison : -comparison;
	});
}
function compareBy(
	a: SensorStub,
	b: SensorStub,
	sensors: Record<number, Sensor>,
	sortKey: SortKey
) {
	if (sortKey === SortKey.NAME) return a.name.localeCompare(b.name);
	if (sortKey === SortKey.ID) return a.id - b.id;
	const sensorA = sensors[a.id];
	const sensorB = sensors[b.id];
	if (sensorA == undefined) return 1;
	if (sensorB == undefined) return -1;
	if (sortKey === SortKey.NEXT_WATERING) {
		if (sensorA.estimatedNextWatering == undefined) return 1;
		if (sensorB.estimatedNextWatering == undefined) return -1;
		return sensorA.estimatedNextWatering.getTime() - sensorB.estimatedNextWatering.getTime();
	}
	if (sortKey === SortKey.WATER_CAPACITY) {
		if (sensorA.waterCapacityHistory == undefined) return 1;
		if (sensorB.waterCapacityHistory == undefined) return -1;
		// TODO fix this code
		return (
			sensorA.waterCapacityHistory[sensorA.waterCapacityHistory.length - 1].availableWaterCapacity -
			sensorB.waterCapacityHistory[sensorB.waterCapacityHistory.length - 1].availableWaterCapacity
		);
	}
	if (sortKey === SortKey.SENSOR_HEALTH) {
		if (sensorA.status.signalStrength == 'offline') return 1;
		if (sensorB.status.signalStrength == 'offline') return -1;
		if (sensorA.status.signalStrength == 'weak') return 1;
		if (sensorB.status.signalStrength == 'weak') return -1;
		if (sensorA.status.lowBattery) return 1;
		if (sensorB.status.lowBattery) return -1;
		return 0;
	}
	return 0;
}

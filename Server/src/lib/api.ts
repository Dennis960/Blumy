const BASE_URL = '/api';

export async function checkSubscription(
	sensorId: number,
	subscription: PushSubscription
): Promise<boolean> {
	return await fetch(`${BASE_URL}/sensors/${sensorId}/check-subscription`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(subscription)
	})
		.then((response) => response.json())
		.catch(() => false);
}

export async function submitSubscription(
	sensorId: number,
	subscription: PushSubscription
): Promise<boolean> {
	return await fetch(`${BASE_URL}/sensors/${sensorId}/subscribe`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(subscription)
	})
		.then((response) => response.json())
		.catch(() => false);
}

export async function submitUnsubscription(
	sensorId: number,
	subscription: PushSubscription
): Promise<boolean> {
	return await fetch(`${BASE_URL}/sensors/${sensorId}/unsubscribe`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(subscription)
	})
		.then((response) => response.json())
		.catch(() => false);
}

export function setupSensorOnLocalEsp(writeToken: string, redirectUrl: string) {
	const originHttp = window.location.origin.replace('https', 'http');
	const url = new URL(redirectUrl);
	const query = new URLSearchParams(url.search);
	query.set('token', writeToken);
	query.set('blumyUrl', `${originHttp}/api/v2/data`);
	url.search = query.toString();
	location.href = url.toString();
}

export enum DATA_DEPENDENCY {
	SENSOR = 'SENSOR',
	SENSOR_OVERVIEW = 'SENSOR_OVERVIEW',
	SENSOR_VALUE_DISTRIBUTION = 'SENSOR_VALUE_DISTRIBUTION'
}

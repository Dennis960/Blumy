import SuperJSON from 'superjson';
import type { SensorConfigurationDTO, SensorCreatedDTO } from './types/api';

const BASE_URL = '/api';

export async function createSensor(config: SensorConfigurationDTO): Promise<SensorCreatedDTO> {
	return await fetch(`${BASE_URL}/sensors`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: SuperJSON.stringify(config)
	})
		.then((response) => response.text())
		.then((text) => SuperJSON.parse(text));
}

export async function updateSensorConfig(
	id: number,
	config: SensorConfigurationDTO
): Promise<SensorConfigurationDTO> {
	return await fetch(`${BASE_URL}/sensors/${id}/config`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: SuperJSON.stringify(config)
	})
		.then((response) => response.text())
		.then((text) => SuperJSON.parse(text));
}

export async function fetchPublicVapidKey(): Promise<string> {
	return await fetch(`${BASE_URL}/vapid-public-key`).then((response) => response.text());
}

export async function checkSubscription(
	sensorId: number,
	subscription: PushSubscription
): Promise<boolean> {
	return await fetch(`${BASE_URL}/sensors/${sensorId}/check-subscription`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: SuperJSON.stringify(subscription)
	})
		.then((response) => response.text())
		.then((text) => SuperJSON.parse(text));
}

export async function submitSubscription(
	sensorId: number,
	subscription: PushSubscription
): Promise<void> {
	return await fetch(`${BASE_URL}/sensors/${sensorId}/subscribe`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: SuperJSON.stringify(subscription)
	})
		.then((response) => response.text())
		.then((text) => SuperJSON.parse(text));
}

export async function submitUnsubscription(
	sensorId: number,
	subscription: PushSubscription
): Promise<void> {
	return await fetch(`${BASE_URL}/sensors/${sensorId}/unsubscribe`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: SuperJSON.stringify(subscription)
	})
		.then((response) => response.text())
		.then((text) => SuperJSON.parse(text));
}

export async function setupSensorOnLocalEsp(
	writeToken: string,
	redirectUrl: string,
	apiUrl: string
) {
	const originHttp = window.location.origin.replace('https', 'http');
	try {
		const res = await fetch(apiUrl, {
			method: 'POST',
			body: `token=${writeToken}\nurl=${originHttp}/api/v2/data\n`
		});
		if (res.ok) {
			location.href = redirectUrl;
		} else {
			return 'Unbekannter Fehler beim Einrichten des Sensors. Starte den Blumy Sensor neu und versuche es erneut.';
		}
	} catch (err) {
		console.log(err);
		return 'Der Sensor konnte nicht synchronisiert werden. Bitte überprüfe die Verbindung zum Blumy Sensor.';
	}
}

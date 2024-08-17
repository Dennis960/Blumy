import type {
	SensorDTO,
	SensorHistoryDTO,
	SensorOverviewDTO,
	SensorValueDistributionDTO,
	SensorConfigurationDTO,
	SensorCreatedDTO,
} from './types/api';
import SuperJSON from 'superjson';

const BASE_URL = '/api'

function getShareLinkToken(): string | null {
	const params = new URLSearchParams(window.location.search);
	return params.get('token');
}

export async function ensureLoggedIn() {
	if (getShareLinkToken() != null) {
		return;
	}

	await fetch(`${BASE_URL}/profile`)
		.then((response) => {
			if (response.status == 401) {
				window.location.href = `${BASE_URL}/auth/google`;
			}
		})
}

export async function fetchSensorOverview(): Promise<SensorOverviewDTO> {
	return await fetch(`${BASE_URL}/sensors`)
		.then((response) => response.text())
		.then((text) => SuperJSON.parse<SensorOverviewDTO>(text));
}

function constructOptions(): RequestInit {
	const shareLinkToken = getShareLinkToken();

	if (shareLinkToken != null) {
		return {
			credentials: 'include',
			headers: {
				'Authorization': `Bearer ${shareLinkToken}`
			},
		}
	}

	return {}
}

export async function fetchSensor(id: number): Promise<SensorDTO> {
	return await fetch(`${BASE_URL}/sensors/${id}`, constructOptions())
		.then((response) => response.text())
		.then((text) => SuperJSON.parse(text));
}

export async function fetchSensorHistory(
	id: number,
	startDate: Date,
	endDate: Date
): Promise<SensorHistoryDTO> {
	const params = new URLSearchParams({
		startDate: startDate.getTime().toString(),
		endDate: endDate.getTime().toString(),
		maxDataPoints: '1000'
	});
	return await fetch(`${BASE_URL}/sensors/${id}/history?` + params.toString(), constructOptions())
		.then((response) => response.text())
		.then((text) => SuperJSON.parse(text));
}

export async function fetchSensorValueDistribution(
	id: number
): Promise<SensorValueDistributionDTO> {
	return await fetch(`${BASE_URL}/sensors/${id}/value-distribution`)
		.then((response) => response.text())
		.then((text) => SuperJSON.parse(text));
}

export async function fetchSensorWriteToken(
	id: number
): Promise<string> {
	return await fetch(`${BASE_URL}/sensors/${id}/write-token`, {
		method: 'POST',
	}).then((response) => response.text());
}

export async function createSensor(
	config: SensorConfigurationDTO
): Promise<SensorCreatedDTO> {
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

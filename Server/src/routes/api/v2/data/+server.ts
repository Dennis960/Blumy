import SensorController from '$lib/server/controllers/SensorController';
import type { ESPSensorReadingDTO } from '$lib/server/entities/SensorReadingEntity';
import SensorRepository from '$lib/server/repositories/SensorRepository';
import FirmwareUpdateService from '$lib/server/services/FirmwareUpdateService';
import { json, type RequestHandler } from '@sveltejs/kit';

const dataController = new SensorController();

export const POST = (async (event) => {
	event.locals.security.allowAll();
	const authorizationHeader = event.request.headers.get('Authorization');
	if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	const writeToken = authorizationHeader.slice('Bearer '.length);
	const sensorId = await SensorRepository.getIdByWriteToken(writeToken);
	if (!sensorId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const sensorReading = (await event.request.json()) as ESPSensorReadingDTO;
	const data = await dataController.addSensorData(sensorId, sensorReading);
	const latestVersion = FirmwareUpdateService.getLatestFirmwareVersion();
	let statusCode = 200;
	const isOldFirmwareVersionFormat = sensorReading.firmwareVersion > 1000000; // Old format used the time in milliseconds as firmware version, new format uses the github workflow run number
	if (
		isOldFirmwareVersionFormat ||
		(latestVersion !== null && sensorReading.firmwareVersion < latestVersion)
	) {
		statusCode = 426; // Upgrade Required
	}
	return json(data, {
		status: statusCode
	});
}) satisfies RequestHandler;

export const GET = (async (event) => {
	event.locals.security.allowAll();
	const authorizationHeader = event.request.headers.get('Authorization');
	if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	const writeToken = authorizationHeader.slice('Bearer '.length);
	const sensorId = await SensorRepository.getIdByWriteToken(writeToken);
	if (!sensorId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	return json({});
}) satisfies RequestHandler;

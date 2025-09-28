import SensorRepository from '$lib/server/repositories/SensorRepository';
import type { SensorDTO } from '$lib/types/api';
import { json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';
import SensorController from '$lib/server/controllers/SensorController';

export const POST = async (event: RequestEvent) => {
	const user = event.locals.security.allowAll();
	const sensors: {
		id: number;
		sensorToken: string;
	}[] = await event.request.json();

	const sensorDtos: SensorDTO[] = [];
	for (const sensor of sensors) {
		const sensorId = await SensorRepository.getIdBySensorToken(sensor.sensorToken);
		if (sensorId !== sensor.id) {
			return new Response('Invalid sensor read token', { status: 400 });
		}
		const sensorDto = await new SensorController().getSensor(
			sensor.id,
			user?.id,
			sensor.sensorToken
		);
		if (!sensorDto) {
			return new Response(`Sensor with ID ${sensor.id} not found`, { status: 404 });
		}
		sensorDtos.push(sensorDto);
	}
	return json(sensorDtos);
};

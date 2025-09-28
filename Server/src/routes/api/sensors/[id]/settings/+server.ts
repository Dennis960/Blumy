import { clientApi } from '$lib/client/api';
import SensorController from '$lib/server/controllers/SensorController';
import type { SensorConfigurationDTO } from '$lib/types/api';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const PUT = (async (event) => {
	const user = await event.locals.security.allowOwnerOfOrTokenHasEditPermission(
		parseInt(event.params.id),
		event.url.searchParams.get('token')
	);
	const data = await event.request.formData();
	const sensorId = parseInt(event.params.id);

	const sensor = await new SensorController().getSensor(
		sensorId,
		user?.id,
		event.url.searchParams.get('token')
	);

	if (!sensor) {
		return new Response(`Sensor with ID ${sensorId} not found`, { status: 404 });
	}

	const config: SensorConfigurationDTO = {
		name: data.get('name') as string,
		permanentWiltingPoint: Number(data.get('permanentWiltingPoint')),
		lowerThreshold: Number(data.get('lowerThreshold')),
		upperThreshold: Number(data.get('upperThreshold')),
		fieldCapacity: Number(data.get('fieldCapacity')),
		sensorTokenHasEditPermissions: sensor.isCurrentUserOwner
			? !!data.get('sensorTokenHasEditPermissions')
			: sensor.config.sensorTokenHasEditPermissions
	};

	const newConfig = await new SensorController().updateSensorConfig(sensorId, config);

	const imageFile = data.get('image') as File;
	if (imageFile && imageFile.size > 0) {
		await clientApi(event.fetch)
			.sensors()
			.withId(sensorId, event.url.searchParams.get('token'))
			.uploadImage(imageFile)
			.response();
	}

	return json(newConfig);
}) satisfies RequestHandler;

import { DATA_DEPENDENCY } from '$lib/client/api';
import SensorController from '$lib/server/controllers/SensorController';
import SensorRepository from '$lib/server/repositories/SensorRepository';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async function ({ params, url, depends, locals }) {
	await locals.security.allowOwnerOrSensorRead(params.id, url.searchParams.get('token'));
	depends(DATA_DEPENDENCY.SENSOR);
	const id = parseInt(params.id);

	let startDate = new Date();
	startDate.setDate(startDate.getDate() - 3);
	startDate.setHours(0, 0, 0, 0);
	let endDate = new Date();
	endDate.setHours(23, 59, 59, 999);
	let maxDataPoints = 100;

	if (url.searchParams.has('from')) {
		const from = parseInt(url.searchParams.get('from') ?? '');
		if (!isNaN(from)) {
			startDate = new Date(from);
		}
	}

	if (url.searchParams.has('to')) {
		const to = parseInt(url.searchParams.get('to') ?? '');
		if (!isNaN(to)) {
			endDate = new Date(to);
		}
	}

	if (url.searchParams.has('maxDataPoints')) {
		const max = parseInt(url.searchParams.get('maxDataPoints') ?? '');
		if (!isNaN(max)) {
			maxDataPoints = max;
		}
	}

	const sensorData = await new SensorController().getSensorHistory(
		id,
		startDate,
		endDate,
		maxDataPoints
	);

	const ownerId = await SensorRepository.getOwner(id);
	const currentUserIsOwner = ownerId === locals.user?.id;

	return {
		id,
		startDate,
		endDate,
		sensorData,
		accessThroughReadToken: !currentUserIsOwner
	};
};

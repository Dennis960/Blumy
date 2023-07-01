import { fetchSensor } from '$lib/api';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async function ({ params, parent, url }) {
	const id = parseInt(params.id);

	let startDate = new Date();
	startDate.setDate(startDate.getDate() - 3);
	startDate.setHours(0, 0, 0, 0);
	let endDate = new Date();
	endDate.setHours(23, 59, 59, 999);

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

	const { queryClient } = await parent();

	await queryClient.fetchQuery({
		queryKey: ['sensor', id],
		queryFn: async () => {
			const sensor = await fetchSensor(id);
			if (sensor == undefined) {
				throw error(404, 'Sensor not found');
			}
			return sensor;
		}
	});

	return {
		id,
		startDate,
		endDate
	};
};

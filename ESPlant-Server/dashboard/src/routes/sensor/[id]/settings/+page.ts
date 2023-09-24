import { fetchSensor } from '$lib/api';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async function ({ params, parent }) {
	const id = parseInt(params.id);

	const { queryClient } = await parent();

	await queryClient.fetchQuery({
		queryKey: ['sensor', id],
		queryFn: async () => {
			const sensor = await fetchSensor(id);
			if (sensor == undefined) {
				throw error(404, 'Sensor nicht gefunden');
			}
			return sensor;
		}
	});

	return {
		id,
	};
};

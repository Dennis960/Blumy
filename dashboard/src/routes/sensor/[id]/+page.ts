import { fetchSensorData, fetchSensors } from '$lib/api';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async function({ params, parent }) {
    const id = parseInt(params.id);

	const startDate = new Date();
	startDate.setDate(startDate.getDate() - 3);
	startDate.setHours(0, 0, 0, 0);
	const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const sensors = await fetchSensors()
    const sensor = sensors.find((s) => s.id == id)
    if (!sensor) {
        throw error(404, 'Sensor not found')
    }

    const name = sensor.name;

    const { queryClient } = await parent();
	await queryClient.prefetchQuery({
		queryKey: ['sensor-data', id],
		queryFn: () => fetchSensorData(id, name, startDate, endDate),
	});

    return {
        id,
        name,
        startDate,
        endDate
    }
}
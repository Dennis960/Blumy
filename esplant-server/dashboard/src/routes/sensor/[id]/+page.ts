import { fetchSensorData, fetchSensors } from '$lib/api';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async function ({ params, parent, url }) {
    const id = parseInt(params.id);

    let startDate = new Date()
    startDate.setDate(startDate.getDate() - 3);
    startDate.setHours(0, 0, 0, 0);
    let endDate = new Date()
    endDate.setHours(23, 59, 59, 999);

    if (url.searchParams.has('from')) {
        const from = parseInt(url.searchParams.get('from') ?? '')
        if (!isNaN(from)) {
            startDate = new Date(from)
        }
    }

    if (url.searchParams.has('to')) {
        const to = parseInt(url.searchParams.get('to') ?? '')
        if (!isNaN(to)) {
            endDate = new Date(to)
        }
    }

    const { queryClient } = await parent();

    const sensors = await queryClient.fetchQuery({
        queryKey: ['sensor-ids'],
        queryFn: () => fetchSensors(),
    });
    const sensor = sensors.find((s) => s.id == id)
    if (!sensor) {
        throw error(404, 'Sensor not found')
    }

    const name = sensor.name;

    queryClient.prefetchQuery({
        queryKey: ['sensor-data', id],
        queryFn: () => {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            return fetchSensorData(id, name, oneWeekAgo, new Date());
        },
    });

    queryClient.prefetchQuery({
        queryKey: ['sensor-data', id, startDate, endDate],
        queryFn: () => fetchSensorData(id, name, startDate, endDate),
    });

    return {
        id,
        name,
        startDate,
        endDate
    }
}
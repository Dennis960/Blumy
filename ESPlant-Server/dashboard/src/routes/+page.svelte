<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { fetchSensorOverview } from '$lib/api';
	import SensorCard from '$lib/components/sensor-card.svelte';

	$: query = createQuery({
		queryKey: ['sensor-overview'],
		queryFn: () => fetchSensorOverview(),
		refetchInterval: 60 * 60 * 1000, // refetch every hour
		initialData: {
			sensors: []
		}
	});
</script>

<div class="page-body">
	<div class="container-xl">
		<div class="row row-deck row-cards">
			{#each $query.data.sensors as sensor (sensor.id)}
				<div class="col-12 col-md-6 col-lg-4">
					<SensorCard {sensor} />
				</div>
			{/each}
		</div>
	</div>
</div>

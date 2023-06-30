<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import SensorRow from '$lib/components/sensor-row.svelte';
	import IconBucketDroplet from '@tabler/icons-svelte/dist/svelte/icons/IconBucketDroplet.svelte';
	import IconPlant from '@tabler/icons-svelte/dist/svelte/icons/IconPlant.svelte';
	import Time from 'svelte-time';
	import SensorStatusCard from '$lib/components/sensor-status-card.svelte';
	import { fetchSensorOverview } from '$lib/api';

	$: query = createQuery({
		queryKey: ['sensor-overview'],
		queryFn: () => fetchSensorOverview(),
		refetchInterval: 60 * 60 * 1000, // refetch every hour
		initialData: {
			sensors: []
		},
	});

	$: totalSensors = $query.data.sensors.length;
	$: poorPlantHealth = $query.data.sensors.filter((sensor) => sensor.plantHealth.critical).length
	$: poorSensorHealth = $query.data.sensors.filter((sensor) => sensor.sensorHealth.critical).length
	$: minNextWatering = $query.data.sensors
		.map((sensor) => sensor.prediction?.nextWatering!)
		.filter((nextWatering) => nextWatering != undefined)
		.map((nw) => new Date(nw)) // TODO use superjson for API responses
		.sort((a, b) => a.getTime() - b.getTime())[0];
	$: anyWateringToday = minNextWatering && minNextWatering.getTime() < new Date().getTime() + 24 * 60 * 60 * 1000; // TODO use end of day
	$: anyWateringTomorrow = minNextWatering && minNextWatering.getTime() < new Date().getTime() + 2 * 24 * 60 * 60 * 1000;
</script>

<div class="page-body">
	<div class="container-xl">
		<div class="row row-deck row-cards">
			<div class="col-12 col-md-3 col-lg-2">
				<SensorStatusCard title="Plants" value={totalSensors.toString()}>
					<IconPlant slot="icon" size={24} />
				</SensorStatusCard>
			</div>

			{#if minNextWatering}
				<div class="col-12 col-md-3 col-lg-2">
					<SensorStatusCard
						title="Next Watering"
						critical={anyWateringToday}
						warning={anyWateringTomorrow}
					>
						<IconBucketDroplet slot="icon" size={24} />
						<Time slot="value" relative timestamp={minNextWatering} />
					</SensorStatusCard>
				</div>
			{/if}

			<div class="col-6 col-md-3 col-lg-2">
				<SensorStatusCard
					title="Plant Health"
					value={`${poorPlantHealth} ${poorPlantHealth == 1 ? 'Problem' : 'Problems'}`}
					ok={poorPlantHealth == 0}
					critical={poorPlantHealth > 0}
				/>
			</div>

			<div class="col-6 col-md-3 col-lg-2">
				<SensorStatusCard
					title="Sensor Health"
					value={`${poorSensorHealth} ${poorSensorHealth == 1 ? 'Problem' : 'Problems'}`}
					ok={poorSensorHealth == 0}
					critical={poorSensorHealth > 0}
				/>
			</div>

			<div class="col-12">
				<div class="card">
					<div class="table-responsive">
						<table class="table table-vcenter table-striped">
							<thead>
								<tr>
									<th>Name</th>
									<th>Water Capacity</th>
									<th>Next Watering</th>
									<th>Sensor Health</th>
									<th>3 Day History</th>
									<th />
								</tr>
							</thead>
							<tbody>
								{#each $query.data.sensors as sensor (sensor.id)}
									<SensorRow {sensor} />
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	:global(.tabler-icon) {
		touch-action: inherit;
	}
</style>

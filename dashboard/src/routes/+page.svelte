<script lang="ts">
	import { fetchSensors, type Sensor } from '$lib/api';
	import { createQuery } from '@tanstack/svelte-query';
	import SensorRow from '$lib/components/sensor-row.svelte';
	import { IconBucketDroplet, IconPlant } from '@tabler/icons-svelte';
	import Time from 'svelte-time';

	$: query = createQuery({
		queryKey: ['sensor-ids'],
		queryFn: () => fetchSensors(),
		refetchInterval: 60 * 60 * 1000, // refetch every hour
		initialData: []
	});

	// TODO use a store or request the data at the top level
	$: sensors = {} as Record<number, Sensor>;
	function handleUpdateSensor(event: CustomEvent<Sensor>) {
		const { detail } = event;
		sensors[detail.id] = detail;
	}

	function handleRemoveSensor(event: CustomEvent<number>) {
		const { detail } = event;
		delete sensors[detail];
	}

	$: totalSensors = Object.keys(sensors).length;
	$: poorPlantHealth = Object.values(sensors).filter(
		(sensor) =>
			sensor.status.overwatered ||
			sensor.status.underwatered ||
			sensor.status.drowning ||
			sensor.status.wilting
	).length;
	$: poorSensorHealth = Object.values(sensors).filter(
		(sensor) =>
			sensor.status.lowBattery || ['offline', 'weak'].includes(sensor.status.signalStrength)
	).length;
	$: anyWateringToday = Object.values(sensors).some((sensor) => sensor.status.waterToday);
	$: anyWateringTomorrow = Object.values(sensors).some((sensor) => sensor.status.waterTomorrow);
	$: minNextWatering = Object.values(sensors)
		.map((sensor) => sensor.estimatedNextWatering!)
		.filter((nextWatering) => nextWatering != undefined)
		.sort((a, b) => a.getTime() - b.getTime())[0];
</script>

<div class="page-body">
	<div class="row row-deck row-cards">
		<div class="col-12 col-md-4 col-lg-3">
			<section class="card">
				<div class="card-body">
					<h1 class="subheader mb-0">Plants</h1>
					<div class="h1">
						<IconPlant class="align-text-bottom" size={24} />
						<span class="ms-1">{totalSensors}</span>
					</div>
				</div>
			</section>
		</div>

		{#if minNextWatering}
			<div class="col-12 col-md-4 col-lg-3">
				<section class="card">
					<div class="card-body">
						<h1 class="subheader mb-0">Next Watering</h1>
						<div
							class="h1 {anyWateringToday ? 'text-danger' : ''} {anyWateringTomorrow
								? 'text-warning'
								: ''}"
						>
							<IconBucketDroplet class="align-text-bottom" size={24} />
							<Time class="ms-1" relative timestamp={minNextWatering} />
						</div>
					</div>
				</section>
			</div>
		{/if}

		<div class="col-12 col-md-4 col-lg-3">
			<section class="card">
				<div class="card-body">
					<h1 class="subheader mb-0">Plant Health</h1>
					<span
						class="h1 {poorPlantHealth == 0 ? 'text-green' : ''} {poorPlantHealth > 0
							? 'text-danger'
							: ''}">{poorPlantHealth} {poorPlantHealth == 1 ? 'Problem' : 'Problems'}</span
					>
				</div>
			</section>
		</div>

		<div class="col-12 col-md-4 col-lg-3">
			<section class="card">
				<div class="card-body">
					<h1 class="subheader mb-0">Sensor Health</h1>
					<span
						class="h1 {poorSensorHealth == 0 ? 'text-green' : ''} {poorSensorHealth > 0
							? 'text-danger'
							: ''}">{poorSensorHealth} {poorSensorHealth == 1 ? 'Problem' : 'Problems'}</span
					>
				</div>
			</section>
		</div>

		<div class="col-12">
			<div class="card">
				<div class="table-responsive">
					<table class="table table-vcenter card-table table-striped">
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
							{#each $query.data as sensor (sensor.id)}
								<SensorRow
									id={sensor.id}
									name={sensor.name}
									on:update-sensor={handleUpdateSensor}
									on:remove-sensor={handleRemoveSensor}
								/>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
</div>

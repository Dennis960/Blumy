<script lang="ts">
	import { fetchSensors, type Sensor } from '$lib/api';
	import { createQuery } from '@tanstack/svelte-query';
	import SensorRow from '$lib/components/sensor-row.svelte';
	import IconBucketDroplet from '@tabler/icons-svelte/dist/svelte/icons/IconBucketDroplet.svelte';
	import IconPlant from '@tabler/icons-svelte/dist/svelte/icons/IconPlant.svelte';
	import Time from 'svelte-time';
	import SensorStatusCard from '$lib/components/sensor-status-card.svelte';
	import { SortKey, sortQueryDataBy } from '$lib/sort-query-data';
	import TableSorter, { type SortDirection } from '$lib/components/table-sorter.svelte';

	$: query = createQuery({
		queryKey: ['sensor-ids'],
		queryFn: () => fetchSensors(),
		refetchInterval: 60 * 60 * 1000, // refetch every hour
		initialData: []
	});

	// TODO use a store or request the data at the top level
	const sensors = {} as Record<number, Sensor>;
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

	let tableSorters: TableSorter[] = [];
	let sortKey = SortKey.NEXT_WATERING;
	let sortAsc = true;

	function sort(event: CustomEvent<{ key: SortKey; direction: SortDirection }>) {
		const { key, direction } = event.detail;
		if (direction === undefined) {
			// default sorting is by id
			sortKey = SortKey.ID;
			sortAsc = true;
			return;
		}
		tableSorters.forEach((tableSorter) => {
			if (tableSorter.sortKey !== key) {
				tableSorter.sortDirection = undefined;
			}
		});
		const asc = direction === 'asc';
		sortKey = key;
		sortAsc = asc;
		console.log('sort', key, asc);
	}
	$: queryDataSorted = sortQueryDataBy($query.data, sensors, sortKey, sortAsc);
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
									<th>
										<TableSorter sortKey={SortKey.NAME} on:sort={sort} bind:this={tableSorters[0]}>
											Name
										</TableSorter>
									</th>
									<th>
										<TableSorter sortKey={SortKey.WATER_CAPACITY} on:sort={sort} bind:this={tableSorters[1]}>
											Water Capacity
										</TableSorter>
									</th>
									<th>
										<TableSorter sortKey={SortKey.NEXT_WATERING} on:sort={sort} bind:this={tableSorters[2]}>
											Next Watering
										</TableSorter>
									</th>
									<th>
										<TableSorter sortKey={SortKey.SENSOR_HEALTH} on:sort={sort} bind:this={tableSorters[3]}>
											Sensor Health
										</TableSorter>
									</th>
									<th>3 Day History</th>
									<th />
								</tr>
							</thead>
							<tbody>
								{#each queryDataSorted as sensor (sensor.id)}
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
</div>

<style>
	:global(.tabler-icon) {
		touch-action: inherit;
	}
</style>

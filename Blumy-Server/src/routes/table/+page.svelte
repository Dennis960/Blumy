<script lang="ts">
	import { invalidate } from '$app/navigation';
	import SensorRow from '$lib/components/sensor-row.svelte';
	import SensorStatusCard from '$lib/components/sensor-status-card.svelte';
	import TableSorter, { type SortDirection } from '$lib/components/table-sorter.svelte';
	import Time from '$lib/components/time.svelte';
	import { IconBucketDroplet, IconPlant } from '$lib/icons';
	import { SortKey, sortQueryDataBy } from '$lib/sort-query-data';
	import { onMount } from 'svelte';

	export let data;

	onMount(() => {
		const interval = setInterval(
			() => {
				invalidate('sensor-overview');
			},
			60 * 60 * 1000
		);
		return () => clearInterval(interval);
	});

	$: totalSensors = data.sensors.length;
	$: poorPlantHealth = data.sensors.filter((sensor) => sensor.plantHealth.critical).length;
	$: poorSensorHealth = data.sensors.filter((sensor) => sensor.sensorHealth.critical).length;
	$: minNextWatering = data.sensors
		.filter((sensor) => sensor.prediction)
		.map((sensor) => sensor.prediction!.nextWatering)
		.filter((nextWatering) => nextWatering != undefined)
		.map((nw) => new Date(nw)) // TODO use superjson for API responses
		.sort((a, b) => a.getTime() - b.getTime())[0];
	$: anyWateringToday =
		minNextWatering && minNextWatering.getTime() < new Date().getTime() + 24 * 60 * 60 * 1000; // TODO use end of day
	$: anyWateringTomorrow =
		minNextWatering && minNextWatering.getTime() < new Date().getTime() + 2 * 24 * 60 * 60 * 1000;

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
	}
	$: queryDataSorted = sortQueryDataBy(data, sortKey, sortAsc);
</script>

<div class="page-body">
	<div class="container-xl">
		<div class="row row-deck row-cards">
			<div class="col-12 col-md-4 col-lg-3">
				<SensorStatusCard title="Pflanzen" value={totalSensors.toString()}>
					<IconPlant slot="icon" size={24} />
				</SensorStatusCard>
			</div>

			{#if minNextWatering}
				<div class="col-12 col-md-4 col-lg-3">
					<SensorStatusCard
						title="Nächste Bewässerung"
						critical={anyWateringToday}
						warning={anyWateringTomorrow}
					>
						<IconBucketDroplet slot="icon" size={24} />
						<Time slot="value" relative timestamp={minNextWatering} />
					</SensorStatusCard>
				</div>
			{/if}

			<div class="col-12 col-md-4 col-lg-3">
				<SensorStatusCard
					title="Planzen-Status"
					value={`${poorPlantHealth} ${poorPlantHealth == 1 ? 'Problem' : 'Probleme'}`}
					ok={poorPlantHealth == 0}
					critical={poorPlantHealth > 0}
				/>
			</div>

			<div class="col-12 col-md-4 col-lg-3">
				<SensorStatusCard
					title="Sensor-Status"
					value={`${poorSensorHealth} ${poorSensorHealth == 1 ? 'Problem' : 'Probleme'}`}
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
									<th></th>
									<th>
										<TableSorter sortKey={SortKey.NAME} on:sort={sort} bind:this={tableSorters[0]}>
											Name
										</TableSorter>
									</th>
									<th>
										<TableSorter
											sortKey={SortKey.WATER_CAPACITY}
											on:sort={sort}
											bind:this={tableSorters[1]}
										>
											Wasserkapazität
										</TableSorter>
									</th>
									<th>
										<TableSorter
											sortKey={SortKey.NEXT_WATERING}
											on:sort={sort}
											bind:this={tableSorters[2]}
											sortDirection="asc"
										>
											Nächste Bewässerung
										</TableSorter>
									</th>
									<th>
										<TableSorter
											sortKey={SortKey.SENSOR_HEALTH}
											on:sort={sort}
											bind:this={tableSorters[3]}
										>
											Sensor-Status
										</TableSorter>
									</th>
									<th>Letzte 3 Tage</th>
									<th />
								</tr>
							</thead>
							<tbody>
								{#each queryDataSorted as sensor (sensor.id)}
									<SensorRow
										{sensor}
										sensorHistory={data.sensorHistories.filter(
											(history) => history.sensor.id === sensor.id
										)[0].history}
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

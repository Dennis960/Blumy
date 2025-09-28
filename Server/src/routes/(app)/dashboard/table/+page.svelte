<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { DATA_DEPENDENCY } from '$lib/client/api.js';
	import SensorRow from '$lib/components/sensor-row.svelte';
	import SensorStatusCard from '$lib/components/sensor-status-card.svelte';
	import TableSorter, { type SortDirection } from '$lib/components/table-sorter.svelte';
	import Time from '$lib/components/time.svelte';
	import { IconBucketDroplet, IconPlant } from '$lib/icons';
	import { SortKey, sortQueryDataBy } from '$lib/sort-query-data';
	import type { SensorDTO } from '$lib/types/api.js';
	import { onMount } from 'svelte';

	let { data } = $props();

	onMount(() => {
		const interval = setInterval(
			() => {
				invalidate(DATA_DEPENDENCY.SENSOR_OVERVIEW);
			},
			60 * 60 * 1000
		);
		return () => clearInterval(interval);
	});

	let totalSensors = $derived(data.sensors.length);
	let poorPlantHealth = $derived(
		data.sensors.filter((sensor) => sensor.plantHealth.critical).length
	);
	let poorSensorHealth = $derived(
		data.sensors.filter((sensor) => sensor.sensorHealth.critical).length
	);
	let minNextWatering = $derived(
		data.sensors
			.filter((sensor) => sensor.prediction)
			.map((sensor) => sensor.prediction!.nextWatering)
			.filter((nextWatering) => nextWatering != undefined)
			.map((nw) => new Date(nw)) // TODO use superjson for API responses
			.sort((a, b) => a.getTime() - b.getTime())[0]
	);
	let anyWateringToday = $derived(
		minNextWatering && minNextWatering.getTime() < new Date().getTime() + 24 * 60 * 60 * 1000
	); // TODO use end of day
	let anyWateringTomorrow = $derived(
		minNextWatering && minNextWatering.getTime() < new Date().getTime() + 2 * 24 * 60 * 60 * 1000
	);

	let tableSorters: TableSorter[] = $state([]);
	let sortKey = $state(SortKey.NEXT_WATERING);
	let sortAsc = $state(true);

	function sort(key: SortKey, direction: SortDirection) {
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
	let queryDataSorted: SensorDTO[] = $state([]);
	$effect(() => {
		queryDataSorted = sortQueryDataBy(data.sensors, sortKey, sortAsc);
	});
</script>

<svelte:head>
	<title>Dashboard - Tabellenansicht</title>
</svelte:head>

<div class="page-body">
	<div class="container-xl">
		<div class="row row-deck row-cards">
			<div class="col-md-4 col-lg-3 col-12">
				<SensorStatusCard title="Pflanzen">
					{#snippet icon()}
						<IconPlant size={24} />
					{/snippet}
					{totalSensors.toString()}
				</SensorStatusCard>
			</div>

			{#if minNextWatering}
				<div class="col-md-4 col-lg-3 col-12">
					<SensorStatusCard
						title="Nächste Bewässerung"
						critical={anyWateringToday}
						warning={anyWateringTomorrow}
					>
						{#snippet icon()}
							<IconBucketDroplet size={24} />
						{/snippet}
						<Time relative timestamp={minNextWatering} />
					</SensorStatusCard>
				</div>
			{/if}

			<div class="col-md-4 col-lg-3 col-12">
				<SensorStatusCard
					title="Planzen-Status"
					ok={poorPlantHealth == 0}
					critical={poorPlantHealth > 0}
				>
					{`${poorPlantHealth} ${poorPlantHealth == 1 ? 'Problem' : 'Probleme'}`}
				</SensorStatusCard>
			</div>

			<div class="col-md-4 col-lg-3 col-12">
				<SensorStatusCard
					title="Sensor-Status"
					ok={poorSensorHealth == 0}
					critical={poorSensorHealth > 0}
				>
					{`${poorSensorHealth} ${poorSensorHealth == 1 ? 'Problem' : 'Probleme'}`}
				</SensorStatusCard>
			</div>

			<div class="col-12">
				<div class="card">
					<div class="table-responsive">
						<table class="table-vcenter table-striped table">
							<thead>
								<tr>
									<th></th>
									<th>
										<TableSorter sortKey={SortKey.NAME} onsort={sort} bind:this={tableSorters[0]}>
											Name
										</TableSorter>
									</th>
									<th>
										<TableSorter
											sortKey={SortKey.WATER_CAPACITY}
											onsort={sort}
											bind:this={tableSorters[1]}
										>
											Wasserkapazität
										</TableSorter>
									</th>
									<th>
										<TableSorter
											sortKey={SortKey.NEXT_WATERING}
											onsort={sort}
											bind:this={tableSorters[2]}
											sortDirection="asc"
										>
											Nächste Bewässerung
										</TableSorter>
									</th>
									<th>
										<TableSorter
											sortKey={SortKey.SENSOR_HEALTH}
											onsort={sort}
											bind:this={tableSorters[3]}
										>
											Sensor-Status
										</TableSorter>
									</th>
									<th>Letzte 3 Tage</th>
									<th></th>
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

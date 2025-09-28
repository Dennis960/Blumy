<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { page } from '$app/state';
	import { DATA_DEPENDENCY } from '$lib/client/api.js';
	import { SensorStorage } from '$lib/client/sensor-storage.js';
	import SensorCapacityHistoryCard from '$lib/components/sensor-capacity-history-card.svelte';
	import SensorDetailCard from '$lib/components/sensor-detail-card.svelte';
	import SensorDetailNavArrows from '$lib/components/sensor-detail-nav-arrows.svelte';
	import { onMount } from 'svelte';

	let { data } = $props();

	let dateRange = $state({
		startDate: data.startDate,
		endDate: data.endDate
	});

	async function updateDate() {
		page.url.searchParams.set('from', dateRange.startDate.getTime().toString());
		page.url.searchParams.set('to', dateRange.endDate.getTime().toString());
		await goto(page.url, { noScroll: true });
		invalidate(DATA_DEPENDENCY.SENSOR);
	}

	onMount(() => {
		if (!data.sensor.isCurrentUserOwner) {
			SensorStorage.addSensor(data.sensor.id, data.sensor.sensorToken);
		}

		const interval = setInterval(
			() => {
				invalidate(DATA_DEPENDENCY.SENSOR);
			},
			15 * 60 * 1000
		);
		return () => clearInterval(interval);
	});
</script>

<svelte:head>
	<title>{data.sensor.config.name} - Sensor Dashboard</title>
</svelte:head>

<div class="page-body">
	<div class="container-xl container">
		<SensorDetailNavArrows sensors={data.sensors} currentSensor={data.sensor} />
		<div class="row row-cards row-deck">
			<div class="col-lg-4">
				{#if data.sensor != undefined}
					<SensorDetailCard sensor={data.sensor} />
				{/if}
			</div>

			<div class="col-lg-8">
				{#if data.sensor != undefined && data.sensorData != undefined}
					<SensorCapacityHistoryCard
						sensor={data.sensor}
						history={data.sensorData}
						bind:dateRange
						onchange={updateDate}
					/>
				{/if}
			</div>
		</div>
	</div>
</div>

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
		await goto(page.url);
		invalidate(DATA_DEPENDENCY.SENSOR);
	}

	onMount(() => {
		if (data.accessThroughReadToken) {
			SensorStorage.addSensor(data.sensor.id, data.sensor.readToken);
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

<div class="page-body">
	<div class="container-xl container">
		<SensorDetailNavArrows sensors={data.sensors} currentSensor={data.sensor} />
		<div class="row row-cards row-deck">
			<div class="col-md-5 col-lg-4 col-12">
				{#if data.sensor != undefined}
					<SensorDetailCard sensor={data.sensor} isOwner={!data.accessThroughReadToken} />
				{/if}
			</div>

			<div class="col-md-7 col-lg-8 col-12">
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

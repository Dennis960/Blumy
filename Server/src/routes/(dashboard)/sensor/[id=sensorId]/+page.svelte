<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import SensorCapacityHistoryCard from '$lib/components/sensor-capacity-history-card.svelte';
	import SensorDetailCard from '$lib/components/sensor-detail-card.svelte';
	import { onMount } from 'svelte';

	export let data;

	let dateRange = {
		startDate: data.startDate,
		endDate: data.endDate
	};

	async function updateDate(dateRange: { startDate: Date; endDate: Date }) {
		$page.url.searchParams.set('from', dateRange.startDate.getTime().toString());
		$page.url.searchParams.set('to', dateRange.endDate.getTime().toString());
		await goto($page.url);
		invalidate('sensor-history');
	}

	$: if (
		dateRange.startDate.getTime() != data.startDate.getTime() ||
		dateRange.endDate.getTime() != data.endDate.getTime()
	) {
		updateDate(dateRange);
	}

	onMount(() => {
		const interval = setInterval(
			() => {
				invalidate('sensor-history');
				invalidate('sensor');
			},
			15 * 60 * 1000
		);
		return () => clearInterval(interval);
	});
</script>

<div class="page-body">
	<div class="container container-xl">
		<div class="row row-cards row-deck">
			<div class="col-12 col-md-5 col-lg-4">
				{#if data.sensor != undefined}
					<SensorDetailCard sensor={data.sensor} />
				{/if}
			</div>

			<div class="col-12 col-md-7 col-lg-8">
				{#if data.sensor != undefined && data.sensorData != undefined}
					<SensorCapacityHistoryCard
						sensor={data.sensor}
						history={data.sensorData}
						bind:dateRange
					/>
				{/if}
			</div>

			<div class="col-12 col-md-7 col-lg-8">
				<!-- {#if data.sensor != undefined && data.sensorData != undefined}{/if} -->
			</div>
		</div>
	</div>
</div>

<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { fetchSensor, fetchSensorHistory } from '$lib/api.js';
	import { goto } from '$app/navigation';
	import SensorDetailCard from '$lib/components/sensor-detail-card.svelte';
	import SensorCapacityHistoryCard from '$lib/components/sensor-capacity-history-card.svelte';

	export let data;

	let dateRange = {
		startDate: data.startDate,
		endDate: data.endDate
	};

	function updateDate(dateRange: { startDate: Date; endDate: Date }) {
		const query = new URLSearchParams({
			from: dateRange.startDate.getTime().toString(),
			to: dateRange.endDate.getTime().toString()
		});
		goto(`?${query.toString()}`);
	}

	$: if (
		dateRange.startDate.getTime() != data.startDate.getTime() ||
		dateRange.endDate.getTime() != data.endDate.getTime()
	) {
		updateDate(dateRange);
	}

	$: sensorQuery = createQuery({
		queryKey: ['sensor', data.id],
		queryFn: () => fetchSensor(data.id),
		refetchInterval: 15 * 60 * 1000
	});

	$: historyQuery = createQuery({
		queryKey: ['sensor-data', data.id, data.startDate, data.endDate],
		queryFn: () => fetchSensorHistory(data.id, data.startDate, data.endDate),
		keepPreviousData: true,
		refetchInterval: 15 * 60 * 1000
	});
</script>

<div class="page-body">
	<div class="container container-xl">
		<div class="row row-cards row-deck">
			<div class="col-12 col-md-5 col-lg-4">
				{#if $sensorQuery.data != undefined}
					<SensorDetailCard sensor={$sensorQuery.data} />
				{/if}
			</div>

			<div class="col-12 col-md-7 col-lg-8">
				{#if $sensorQuery.data != undefined && $historyQuery.data != undefined}
					<SensorCapacityHistoryCard
						sensor={$sensorQuery.data}
						history={$historyQuery.data}
						bind:dateRange
					/>
				{/if}
			</div>
		</div>
	</div>
</div>

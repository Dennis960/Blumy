<script lang="ts">
	import Time from 'svelte-time';
	import IconWifi1 from '@tabler/icons-svelte/dist/svelte/icons/IconWifi1.svelte';
	import IconWifi2 from '@tabler/icons-svelte/dist/svelte/icons/IconWifi2.svelte';
	import IconWifiOff from '@tabler/icons-svelte/dist/svelte/icons/IconWifiOff.svelte';
	import IconClockExclamation from '@tabler/icons-svelte/dist/svelte/icons/IconClockExclamation.svelte';
	import IconAlertTriangle from '@tabler/icons-svelte/dist/svelte/icons/IconAlertTriangle.svelte';
	import { browser } from '$app/environment';
	import SensorSparkline from './sensor-sparkline.svelte';
	import { goto } from '$app/navigation';
	import type { SensorDTO } from '$lib/types/api';
	import { fetchSensorHistory } from '$lib/api';
	import { createQuery } from '@tanstack/svelte-query';

	export let sensor: SensorDTO;

	$: historyQuery = createQuery({
		queryKey: ['sensor-sparkline', sensor.id],
		queryFn: async () => {
			const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
			return await fetchSensorHistory(sensor.id, new Date(), threeDaysAgo)
		},
		refetchInterval: 15 * 60 * 1000,
	});

	$: availableWaterCapacityPercent = (sensor.lastUpdate?.waterCapacity ?? 0) * 100;
	$: waterToday =
		sensor.prediction != undefined &&
		(sensor.prediction.nextWatering <= new Date() ||
			sensor.prediction.nextWatering.toLocaleDateString() == new Date().toLocaleDateString());
	$: waterTomorrow =
		sensor.prediction != undefined &&
		sensor.prediction.nextWatering.toLocaleDateString() ==
			new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString();
</script>

<tr on:click={() => goto(`/sensor/${sensor.id}`)}>
	<th scope="row" class="sensor-name">{sensor.config.name}</th>
	<td>
		{#if sensor.lastUpdate == undefined}
			<span>No Data</span>
		{:else}
			<div class="progress progress-sm">
				<div
					class="progress-bar {sensor.plantHealth.critical ? 'bg-danger' : ''} {sensor.plantHealth
						.warning
						? 'bg-warning'
						: ''}"
					style="width: {availableWaterCapacityPercent}%"
					role="progressbar"
					aria-valuenow={availableWaterCapacityPercent}
					aria-valuemin={0}
					aria-valuemax={100}
					aria-label="{Math.round(availableWaterCapacityPercent)}% Complete"
				>
					<span class="visually-hidden">{Math.round(availableWaterCapacityPercent)}% Complete</span>
				</div>
			</div>
		{/if}
	</td>

	<td>
		{#if sensor.prediction != undefined}
			<div
				class="align-items-center {waterToday ? 'text-danger' : ''} {waterTomorrow
					? 'text-warning'
					: ''}"
			>
				{#if waterToday || waterTomorrow}
					<IconClockExclamation class="align-text-bottom" size={16} />
				{/if}
				<Time relative timestamp={sensor.prediction.nextWatering} />
			</div>
		{/if}
	</td>

	<td>
		<div
			class="text-nowrap {sensor.sensorHealth.critical
				? 'text-danger'
				: ''} {sensor.sensorHealth.warning
				? 'text-warning'
				: ''}"
		>
			{#if sensor.sensorHealth.signalStrength == 'offline'}
				<IconWifiOff class="align-text-bottom" size={16} />
			{:else if sensor.sensorHealth.lowBattery || sensor.sensorHealth.signalStrength == 'weak'}
				<IconAlertTriangle class="align-text-bottom" size={16} />
			{:else if sensor.sensorHealth.signalStrength == 'strong'}
				<IconWifi2 class="align-text-bottom" size={16} />
			{:else if sensor.sensorHealth.signalStrength == 'moderate'}
				<IconWifi1 class="align-text-bottom" size={16} />
			{/if}
			{#if sensor.sensorHealth.signalStrength == 'offline'}
				<span>offline</span>
			{:else if sensor.sensorHealth.lowBattery}
				<span>Low Battery</span>
			{:else if sensor.sensorHealth.signalStrength == 'weak'}
				<span>Poor Signal</span>
			{:else}
				<span>Ok</span>
			{/if}
		</div>
	</td>

	<td class="w-1 graph">
		{#if $historyQuery.data != undefined && $historyQuery.data.waterCapacityHistory.length > 0}
			{#if browser}
				<SensorSparkline sensor={sensor} history={$historyQuery.data} />
			{/if}
		{/if}
	</td>

	<td class="text-end">
		<a href="/sensor/{sensor.id}">Details</a>
	</td>
</tr>

<style>
	/* disable graph touch events on mobile to allow touch scrolling */
	.graph {
		pointer-events: none;
	}
	@media (hover: hover) {
		.graph {
			pointer-events: auto;
		}
	}

	.sensor-name {
		max-width: 12rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	@media (min-width: 992px) {
		.sensor-name {
			max-width: 20rem;
		}
	}

	tr {
		cursor: pointer;
	}
</style>

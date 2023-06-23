<script lang="ts">
	import Time from 'svelte-time';
	import {
		IconWifi1,
		IconWifi2,
		IconWifiOff,
		IconClockExclamation,
		IconAlertTriangle
	} from '@tabler/icons-svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { browser } from '$app/environment';
	import { fetchSensorData } from '$lib/api';
	import SensorSparkline from './sensor-sparkline.svelte';
	import { createEventDispatcher, onDestroy } from 'svelte';

	export let id: number;
	export let name: string;

	$: query = createQuery({
		queryKey: ['sensor-sparkline', id],
		queryFn: () => {
			const threeDaysAgo = new Date();
			threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
			return fetchSensorData(id, name, threeDaysAgo, new Date());
		},
		// refetch every 5 minutes
		refetchInterval: 5 * 60 * 1000
	});

	$: availableWaterCapacityPercent = ($query.data?.lastReading?.availableWaterCapacity ?? 0) * 100;

	const dispatch = createEventDispatcher();

	$: {
		if ($query.data != undefined) {
			dispatch('update-sensor', $query.data);
		}
	}

	onDestroy(() => {
		dispatch('remove-sensor', id);
	});
</script>

{#if $query.data != undefined}
	<tr>
		<th class="text-truncate" scope="row">{name}</th>
		<td>
			{#if $query.data?.lastReading == undefined}
				<span>No Data</span>
			{:else}
				<div class="progress progress-sm">
					<div
						class="progress-bar {$query.data.status.drowning || $query.data.status.wilting
							? 'bg-danger'
							: ''} {$query.data.status.overwatered || $query.data.status.underwatered
							? 'bg-warning'
							: ''}"
						style="width: {availableWaterCapacityPercent}%"
						role="progressbar"
						aria-valuenow={availableWaterCapacityPercent}
						aria-valuemin={0}
						aria-valuemax={100}
						aria-label="{Math.round(availableWaterCapacityPercent)}% Complete"
					>
						<span class="visually-hidden"
							>{Math.round(availableWaterCapacityPercent)}% Complete</span
						>
					</div>
				</div>
			{/if}
		</td>

		<td>
			{#if $query.data.estimatedNextWatering != undefined}
				<div
					class="align-items-center {$query.data.status.waterToday ? 'text-danger' : ''} {$query
						.data.status.waterTomorrow
						? 'text-warning'
						: ''}"
				>
					{#if $query.data.status.waterToday || $query.data.status.waterTomorrow}
						<IconClockExclamation class="align-text-bottom" size={16} />
					{/if}
					<Time relative timestamp={$query.data.estimatedNextWatering} />
				</div>
			{/if}
		</td>

		<td>
			<div
				class="{$query.data.status.signalStrength == 'offline' ? 'text-danger' : ''} {$query.data
					.status.lowBattery || $query.data.status.signalStrength == 'weak'
					? 'text-warning'
					: ''}"
			>
				{#if $query.data.status.signalStrength == 'offline'}
					<IconWifiOff class="align-text-bottom" size={16} />
				{:else if $query.data.status.lowBattery || $query.data.status.signalStrength == 'weak'}
					<IconAlertTriangle class="align-text-bottom" size={16} />
				{:else if $query.data.status.signalStrength == 'strong'}
					<IconWifi2 class="align-text-bottom" size={16} />
				{:else if $query.data.status.signalStrength == 'moderate'}
					<IconWifi1 class="align-text-bottom" size={16} />
				{/if}
				{#if $query.data.status.signalStrength == 'offline'}
					<span>offline</span>
				{:else if $query.data.status.lowBattery}
					<span>Low Battery</span>
				{:else if $query.data.status.signalStrength == 'weak'}
					<span>Poor Signal</span>
				{:else}
					<span>Ok</span>
				{/if}
			</div>
		</td>

		<td class="w-1">
			{#if $query.data.waterCapacityHistory.length > 0}
				{#if browser}
					<SensorSparkline sensor={$query.data} />
				{/if}
			{/if}
		</td>

		<td class="text-end">
			<a href="/sensor/{id}">Details</a>
		</td>
	</tr>
{/if}

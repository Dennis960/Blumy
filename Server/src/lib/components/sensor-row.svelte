<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import Time from '$lib/components/time.svelte';
	import {
		IconAlertTriangle,
		IconClockExclamation,
		IconWifi1,
		IconWifi2,
		IconWifiOff
	} from '$lib/icons';
	import type { SensorDTO, SensorHistoryDTO } from '$lib/types/api';
	import Base64Image from './base64-image.svelte';
	import SensorSparkline from './graphs/sensor-sparkline.svelte';
	import WaterCapacityBar from './water-capacity-bar.svelte';

	export let sensor: SensorDTO;
	export let sensorHistory: SensorHistoryDTO;

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
	<th class="w-1">
		<Base64Image class="avatar avatar-xs" imageBase64={sensor.config.imageBase64} />
	</th>
	<th scope="row" class="sensor-name">{sensor.config.name}</th>
	<td>
		{#if sensor.lastUpdate == undefined}
			<span>Keine Daten</span>
		{:else}
			<WaterCapacityBar {sensor} />
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
			class="text-nowrap {sensor.sensorHealth.critical ? 'text-danger' : ''} {sensor.sensorHealth
				.warning
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
				<span>Offline</span>
			{:else if sensor.sensorHealth.lowBattery}
				<span>Batterie schwach</span>
			{:else if sensor.sensorHealth.signalStrength == 'weak'}
				<span>Empfang schlecht</span>
			{:else}
				<span>Ok</span>
			{/if}
		</div>
	</td>

	<td class="w-1 graph">
		{#if browser && sensorHistory.waterCapacityHistory.length > 0}
			<SensorSparkline {sensor} history={sensorHistory} />
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

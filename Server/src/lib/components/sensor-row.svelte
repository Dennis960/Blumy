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
	import { route } from '$lib/ROUTES';
	import type { SensorDTO, SensorHistoryDTO } from '$lib/types/api';
	import SensorImage from './sensor-image.svelte';
	import SensorSparkline from './graphs/sensor-sparkline.svelte';
	import NotificationBell from './notification-bell.svelte';
	import WaterCapacityBar from './water-capacity-bar.svelte';

	interface Props {
		sensor: SensorDTO;
		sensorHistory: SensorHistoryDTO;
	}

	let { sensor, sensorHistory }: Props = $props();

	let waterToday = $derived(
		sensor.prediction != undefined &&
			(sensor.prediction.nextWatering <= new Date() ||
				sensor.prediction.nextWatering.toLocaleDateString() == new Date().toLocaleDateString())
	);
	let waterTomorrow = $derived(
		sensor.prediction != undefined &&
			sensor.prediction.nextWatering.toLocaleDateString() ==
				new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString()
	);

	function getSensorRoute(sensor: SensorDTO): string {
		if (!sensor.isCurrentUserOwner) {
			return (
				route('/dashboard/sensor/[id=sensorId]', { id: sensor.id.toString() }) +
				`?token=${sensor.sensorToken}`
			);
		}
		return route('/dashboard/sensor/[id=sensorId]', { id: sensor.id.toString() });
	}
</script>

<tr onclick={() => goto(getSensorRoute(sensor))}>
	<th class="w-1">
		<SensorImage class="avatar avatar-xs" {sensor} />
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
			{:else if sensor.sensorHealth.battery == 'low' || sensor.sensorHealth.signalStrength == 'weak'}
				<IconAlertTriangle class="align-text-bottom" size={16} />
			{:else if sensor.sensorHealth.signalStrength == 'strong'}
				<IconWifi2 class="align-text-bottom" size={16} />
			{:else if sensor.sensorHealth.signalStrength == 'moderate'}
				<IconWifi1 class="align-text-bottom" size={16} />
			{/if}
			{#if sensor.sensorHealth.signalStrength == 'offline'}
				<span>Offline</span>
			{:else if sensor.sensorHealth.battery == 'low'}
				<span>Batterie schwach</span>
			{:else if sensor.sensorHealth.signalStrength == 'weak'}
				<span>Empfang schlecht</span>
			{:else}
				<span>Ok</span>
			{/if}
		</div>
	</td>

	<td class="graph w-1">
		{#if browser && sensorHistory.waterCapacityHistory.length > 0}
			<SensorSparkline {sensor} history={sensorHistory} />
		{/if}
	</td>

	<td class="text-end">
		<a href={route('/dashboard/sensor/[id=sensorId]', { id: sensor.id.toString() })}>Details</a>
	</td>

	<td>
		<NotificationBell {sensor} />
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

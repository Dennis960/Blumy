<script lang="ts">
	import { IconDropletFilled } from '$lib/icons';
	import type { SensorDTO } from '$lib/types/api';

	export let sensor: SensorDTO;
	$: availableWaterCapacityPercent = (sensor.lastUpdate?.waterCapacity ?? 0) * 100;
	$: color = sensor.plantHealth.critical
		? 'danger'
		: sensor.plantHealth.warning
		? 'warning'
		: 'primary';
</script>

<div class="progress-container">
	<div class="progress progress-sm">
		<div
			class="progress-bar bg-{color}"
			style="width: {availableWaterCapacityPercent}%"
			role="progressbar"
			aria-valuenow={availableWaterCapacityPercent}
			aria-valuemin={0}
			aria-valuemax={100}
			aria-label="{Math.round(availableWaterCapacityPercent)}%"
		>
			<span class="visually-hidden">{Math.round(availableWaterCapacityPercent)}%</span>
		</div>
	</div>
	<span class="progress-bar-tick" style="left: {sensor.config.lowerThreshold * 100}%" />
	<span class="progress-bar-tick" style="left: {sensor.config.upperThreshold * 100}%" />
	{#if sensor.lastUpdate?.waterCapacity != undefined}
		<span class="progress-bar-icon text-{color}" style="left: {availableWaterCapacityPercent}%">
			<IconDropletFilled size={20} />
		</span>
	{/if}
</div>

<style>
	.progress-container {
		position: relative;
	}

	.progress-bar-icon {
		position: absolute;
		top: -0.5rem;
		margin-left: -0.5rem;
	}

	.progress-bar-tick {
		position: absolute;
		top: -0.25rem;
		height: 0.75rem;
		border-left: 1px solid black;
	}
</style>

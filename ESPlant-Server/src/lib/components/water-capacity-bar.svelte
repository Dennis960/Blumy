<script lang="ts">
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
	<div class="progress rounded-pill">
		<div
			class="progress-bar bg-{color}"
			style="width: {availableWaterCapacityPercent}%"
			role="progressbar"
			aria-valuenow={availableWaterCapacityPercent}
			aria-valuemin={0}
			aria-valuemax={100}
			aria-label="{Math.round(availableWaterCapacityPercent)}%"
		>
			{Math.round(availableWaterCapacityPercent)}%
		</div>
	</div>
	<span class="progress-bar-tick" style="left: {sensor.config.lowerThreshold * 100}%" />
	<span class="progress-bar-tick" style="left: {sensor.config.upperThreshold * 100}%" />
</div>

<style>
	.progress-container {
		position: relative;
		--bar-height: 1rem;
	}

	.progress {
		height: var(--bar-height);
	}

	.progress-bar-tick {
		position: absolute;
		top: 0;
		height: var(--bar-height);
		border-left: 2px solid rgba(0, 0, 0, 0.5);
	}
</style>

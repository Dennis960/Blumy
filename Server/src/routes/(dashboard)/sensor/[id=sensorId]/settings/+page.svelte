<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { DATA_DEPENDENCY } from '$lib/api.js';
	import SensorSettingsForm from '$lib/components/sensor-settings-form.svelte';
	import { onMount } from 'svelte';

	let { data } = $props();

	onMount(() => {
		const interval = setInterval(
			() => {
				invalidate(DATA_DEPENDENCY.SENSOR_VALUE_DISTRIBUTION);
			},
			15 * 60 * 1000
		);
		return () => clearInterval(interval);
	});
</script>

<div class="page-header">
	<div class="container">
		{#if data.sensor.config != undefined}
			<SensorSettingsForm
				sensorId={data.sensor.id}
				config={data.sensor.config}
				writeToken={data.writeToken ?? undefined}
				shareLink={data.shareLink}
				sensorValueDistribution={data.sensorValueDistribution}
				formAction="/api/sensors/{data.id}/settings"
				formMethod="PUT"
			>
				{#snippet formActions()}
					<a href={`/sensor/${data.id}`} class="btn btn-link">Abbrechen</a>
				{/snippet}
			</SensorSettingsForm>
		{/if}
	</div>
</div>

<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { DATA_DEPENDENCY } from '$lib/api.js';
	import SensorSettingsForm from '$lib/components/sensor-settings-form.svelte';
	import { onMount } from 'svelte';

	let { data } = $props();

	let error: string;

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
				{error}
				writeToken={data.writeToken ?? undefined}
				shareLink={data.shareLink}
				sensorValueDistribution={data.sensorValueDistribution}
				formAction="/api/sensors/{data.id}/settings"
				formMethod="PUT"
			>
				<!-- @migration-task: migrate this slot by hand, `form-actions` is an invalid identifier -->
				<a slot="form-actions" href={`/sensor/${data.id}`} class="btn btn-link">Abbrechen</a>
			</SensorSettingsForm>
		{/if}
	</div>
</div>

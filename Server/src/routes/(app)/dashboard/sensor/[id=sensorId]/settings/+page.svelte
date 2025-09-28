<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { DATA_DEPENDENCY } from '$lib/client/api.js';
	import SensorSettingsForm from '$lib/components/sensor-settings-form.svelte';
	import { route } from '$lib/ROUTES.js';
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

<svelte:head>
	<title>{data.sensor.config.name} - Sensor Einstellungen</title>
</svelte:head>

<div class="page-header">
	<div class="container">
		{#if data.sensor.config != undefined}
			<SensorSettingsForm
				sensor={data.sensor}
				shareLink={data.shareLink}
				sensorValueDistribution={data.sensorValueDistribution}
			>
				{#snippet formActions({ submitting })}
					<button
						type="button"
						class="btn btn-link"
						disabled={submitting}
						onclick={() =>
							goto(
								route('/dashboard/sensor/[id=sensorId]', {
									id: data.id.toString()
								})
							)}
					>
						Abbrechen
					</button>
				{/snippet}
			</SensorSettingsForm>
		{/if}
	</div>
</div>

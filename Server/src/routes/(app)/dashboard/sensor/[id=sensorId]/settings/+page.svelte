<script lang="ts">
	import { invalidate } from '$app/navigation';
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

<div class="page-header">
	<div class="container">
		{#if data.sensor.config != undefined}
			<SensorSettingsForm
				sensorId={data.sensor.id}
				config={data.sensor.config}
				writeToken={data.writeToken ?? undefined}
				shareLink={data.shareLink}
				sensorValueDistribution={data.sensorValueDistribution}
			>
				{#snippet formActions()}
					<a
						href={route('/dashboard/sensor/[id=sensorId]', { id: data.id.toString() })}
						class="btn btn-link">Abbrechen</a
					>
				{/snippet}
			</SensorSettingsForm>
		{/if}
	</div>
</div>

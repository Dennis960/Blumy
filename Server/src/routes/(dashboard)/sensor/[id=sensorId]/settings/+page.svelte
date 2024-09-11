<script lang="ts">
	import { invalidate } from '$app/navigation';
	import SensorSettingsForm from '$lib/components/sensor-settings-form.svelte';
	import { onMount } from 'svelte';

	export let data;

	let error: string;

	onMount(() => {
		const interval = setInterval(
			() => {
				invalidate('sensor-value-distribution');
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
				<a slot="form-actions" href={`/sensor/${data.id}`} class="btn btn-link">Abbrechen</a>
			</SensorSettingsForm>
		{/if}
	</div>
</div>

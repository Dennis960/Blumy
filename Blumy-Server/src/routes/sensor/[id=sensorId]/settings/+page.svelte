<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { base } from '$app/paths';
	import SensorSettingsForm from '$lib/components/sensor-settings-form.svelte';
	import { onMount } from 'svelte';

	export let data;

	let shareLink: string | undefined;
	let writeToken: string | undefined;

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
				config={data.sensor.config}
				{error}
				{writeToken}
				{shareLink}
				sensorValueDistribution={data.sensorValueDistribution}
				formAction="/api/sensors/{data.id}/settings"
				formMethod="PUT"
			>
				<a slot="form-actions" href={`${base}/sensor/${data.id}`} class="btn btn-link">Abbrechen</a>
			</SensorSettingsForm>
		{/if}
	</div>
</div>

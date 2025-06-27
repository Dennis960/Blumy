<script lang="ts">
	import { page } from '$app/stores';
	import { setupSensorOnLocalEsp } from '$lib/api';
	import SensorSettingsForm from '$lib/components/sensor-settings-form.svelte';
	import type { SensorCreatedDTO } from '$lib/types/api';

	let createdSensor: SensorCreatedDTO | undefined = $state();
	let error: string | undefined = $state();

	async function onSensorCreate(sensor: SensorCreatedDTO) {
		const redirectUrl = $page.url.searchParams.get('redirect');
		if (!redirectUrl) {
			error =
				'Ein Fehler ist aufgetreten. Bitte verbinde dich mit dem Sensor und versuche es erneut.';
			return;
		}
		setupSensorOnLocalEsp(sensor.tokens.write, redirectUrl);
	}
</script>

<div class="page-body">
	<div class="container-xl">
		{#if !error}
			{#if !createdSensor}
				<SensorSettingsForm bind:createdSensor {onSensorCreate} />
			{:else}
				<h2>Der Sensor wird nun eingerichtet, bitte warten...</h2>
			{/if}
		{:else}
			<h2>Ein Fehler ist aufgetreten</h2>
			<p>{error}</p>
		{/if}
	</div>
</div>

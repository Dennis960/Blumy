<script lang="ts">
	import { run } from 'svelte/legacy';

	import { page } from '$app/stores';
	import { setupSensorOnLocalEsp } from '$lib/api';
	import SensorSettingsForm from '$lib/components/sensor-settings-form.svelte';
	import type { SensorCreatedDTO } from '$lib/types/api';

	let createdSensor: SensorCreatedDTO = $state();
	let error: string | undefined = $state();

	async function onSensorCreate() {
		const redirectUrl = $page.url.searchParams.get('redirect');
		if (!redirectUrl) {
			error =
				'Ein Fehler ist aufgetreten. Bitte verbinde dich mit dem Sensor und versuche es erneut.';
			return;
		}
		setupSensorOnLocalEsp(createdSensor.tokens.write, redirectUrl);
	}

	run(() => {
		if (createdSensor) {
			onSensorCreate();
		}
	});
</script>

<div class="page-body">
	<div class="container-xl">
		{#if !error}
			{#if !createdSensor}
				<SensorSettingsForm bind:createdSensor />
			{:else}
				<h2>Der Sensor wird nun eingerichtet, bitte warten...</h2>
			{/if}
		{:else}
			<h2>Ein Fehler ist aufgetreten</h2>
			<p>{error}</p>
		{/if}
	</div>
</div>

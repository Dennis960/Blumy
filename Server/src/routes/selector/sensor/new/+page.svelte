<script lang="ts">
	import { setupSensorOnLocalEsp } from '$lib/api';
	import SensorSettingsForm from '$lib/components/sensor-settings-form.svelte';
	import type { SensorCreatedDTO } from '$lib/types/api';

	let createdSensor: SensorCreatedDTO;
	let error: string | undefined;

	async function onSensorCreate() {
		error = await setupSensorOnLocalEsp(createdSensor.tokens.write);
	}

	$: if (createdSensor) {
		onSensorCreate();
	}
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

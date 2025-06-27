<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { clientApi } from '$lib/client/api';
	import SensorSettingsForm from '$lib/components/sensor-settings-form.svelte';
	import type { SensorCreatedDTO } from '$lib/types/api';

	let createdSensor: SensorCreatedDTO | undefined = $state();
	let error: string | undefined = $state();
	let text = $state('Der Sensor wird nun eingerichtet, das sollte nur wenige Sekunden dauern.');

	async function onSensorCreate(sensor: SensorCreatedDTO) {
		const redirectUrl = page.url.searchParams.get('redirect');
		if (!redirectUrl) {
			error =
				'Ein Fehler ist aufgetreten. Bitte verbinde dich mit dem Sensor und versuche es erneut.';
			return;
		}
		clientApi(fetch).setupSensorOnLocalEsp(sensor.tokens.write, redirectUrl);
		text = 'Der Sensor wird nun eingerichtet, das sollte nur wenige Sekunden dauern.';
		setTimeout(() => {
			text = 'Etwas scheint nicht zu funktionieren. Bitte überprüfe die Verbindung zum Sensor.';
		}, 10000);
	}
</script>

<div class="page-body">
	<div class="container-xl">
		{#if !error}
			{#if !createdSensor}
				<SensorSettingsForm bind:createdSensor {onSensorCreate}>
					{#snippet formActions()}
						<button
							type="button"
							class="btn btn-link"
							onclick={() => goto(`/selector?${page.url.searchParams.toString()}`)}
						>
							Abbrechen
						</button>
					{/snippet}
				</SensorSettingsForm>
			{:else}
				<h2>{text}</h2>
			{/if}
		{:else}
			<h2>Ein Fehler ist aufgetreten</h2>
			<p>{error}</p>
		{/if}
	</div>
</div>

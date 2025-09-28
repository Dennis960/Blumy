<script lang="ts">
	import { goto } from '$app/navigation';
	import CopyText from '$lib/components/copy-text.svelte';
	import SensorSettingsForm from '$lib/components/sensor-settings-form.svelte';
	import { route } from '$lib/ROUTES';
	import type { SensorCreatedDTO } from '$lib/types/api';

	let createdSensor: SensorCreatedDTO | undefined = $state();

	function onSensorCreate(sensor: SensorCreatedDTO) {
		goto(route('/dashboard/sensor/[id=sensorId]', { id: sensor.id.toString() }), {
			invalidateAll: true
		});
	}
</script>

<svelte:head>
	<title>Neuen Sensor erstellen</title>
</svelte:head>

<div class="page-header">
	<div class="container">
		{#if createdSensor == undefined}
			<SensorSettingsForm bind:createdSensor {onSensorCreate}>
				{#snippet formActions({ submitting })}
					<button
						type="button"
						class="btn btn-link"
						onclick={() => goto(route(`/`))}
						disabled={submitting}
					>
						Abbrechen
					</button>
				{/snippet}
			</SensorSettingsForm>
		{:else}
			<div class="row row-gap-3 align-items-center">
				<div class="col-12">
					<div class="card">
						<div class="card-header">
							<h1 class="card-title">{createdSensor.config.name}</h1>
						</div>
						<div class="card-body">
							<div class="row mb-3">
								<div class="col-md-6 col-lg-4 col-12">
									<CopyText
										label="Zugangsschlüssel"
										value={createdSensor.tokens.write}
										hint="Kopiere den Zugangsschlüssel zur Einrichtung des Sensors."
										id="sensor-write-token"
									/>
								</div>
							</div>
						</div>
						<div class="card-footer text-end">
							<div class="d-flex justify-content-end column-gap-2">
								<a
									href={route(`/dashboard/sensor/[id=sensorId]`, {
										id: createdSensor.id.toString()
									})}
									class="btn btn-primary">Fertig</a
								>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

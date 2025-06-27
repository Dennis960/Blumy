<script lang="ts">
	import { goto } from '$app/navigation';
	import CopyText from '$lib/components/copy-text.svelte';
	import SensorSettingsForm from '$lib/components/sensor-settings-form.svelte';
	import type { SensorCreatedDTO } from '$lib/types/api';

	let createdSensor: SensorCreatedDTO | undefined = $state();

	function onSensorCreate(sensor: SensorCreatedDTO) {
		goto(`/sensor/${sensor.id}`, {
			invalidateAll: true
		});
	}
</script>

<div class="page-header">
	<div class="container">
		{#if createdSensor == undefined}
			<SensorSettingsForm bind:createdSensor {onSensorCreate}>
				{#snippet formActions()}
					<a href={`/`} class="btn btn-link">Abbrechen</a>
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
									/>
								</div>
							</div>
						</div>
						<div class="card-footer text-end">
							<div class="d-flex justify-content-end column-gap-2">
								<a href={`/sensor/${createdSensor.id}`} class="btn btn-primary">Fertig</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

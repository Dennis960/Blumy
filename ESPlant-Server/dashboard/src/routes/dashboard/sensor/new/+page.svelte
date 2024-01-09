<script lang="ts">
	import { base } from '$app/paths';
	import { createSensor } from '$lib/api.js';
	import SensorSettingsForm from '$lib/components/sensor-settings-form.svelte';
	import type { SensorCreatedDTO } from '$lib/types/api';

	let error: string;
	let createdSensor: SensorCreatedDTO;

	async function handleSubmit(e: CustomEvent) {
		try {
			createdSensor = await createSensor(e.detail.value);
		} catch (e) {
			console.error(e);
			error = `${e}`;
			return;
		}
	}

	let tokenInput: HTMLInputElement;
	let copied = false;

	async function handleCopy() {
		tokenInput.select();
        try {
            await navigator.clipboard.writeText(createdSensor.token);
            copied = true;
			setTimeout(() => { copied = false }, 2000);
        } catch (err) {
            console.error('Failed to copy token: ', err)
        }
	}
</script>

<div class="page-header">
	<div class="container">
		{#if createdSensor == undefined}
			<SensorSettingsForm error={error} on:submit={handleSubmit} />
		{:else}
			<div class="row row-gap-3 align-items-center">
				<div class="col-12">
					<div class="card">
						<div class="card-header">
							<h1 class="card-title">{createdSensor.config.name}</h1>
						</div>
						<div class="card-body">
							<div class="row mb-3">
								<div class="col-12 col-md-6 col-lg-4">
									<label for="token" class="form-label">Zugangsschlüssel</label>
									<div class="d-flex column-gap-1">
										<input bind:this={tokenInput} id="token" type="text" class="form-control" value={createdSensor.token} readonly>
										<button class="btn btn-outline-secondary" type="button" on:click={handleCopy}>Kopieren</button>
									</div>
									{#if copied}
										<small class="form-hint mt-2 text-success">In Zwischenablage kopiert!</small>
									{:else}
										<small class="form-hint mt-2">Kopiere den Zugangsschlüssel zur Einrichtung des Sensors.</small>
									{/if}
								</div>
							</div>
						</div>
						<div class="card-footer text-end">
							<div class="d-flex justify-content-end column-gap-2">
								<a href={`${base}/sensor/${createdSensor.id}`} class="btn btn-primary">Abschließen</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
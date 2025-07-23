<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { DATA_DEPENDENCY } from '$lib/client/api.js';
	import { SensorStorage } from '$lib/client/sensor-storage.js';
	import SensorCard from '$lib/components/sensor-card.svelte';
	import { route } from '$lib/ROUTES.js';
	import type { SensorDTO } from '$lib/types/api.js';
	import { onMount } from 'svelte';

	let { data } = $props();

	let sensorLink = $state('');
	let sensorLinkErrorText = $state('');

	let storedSensors: SensorDTO[] = $state([]);

	onMount(() => {
		SensorStorage.loadStoredSensors().then((sensors) => {
			storedSensors = sensors;
		});
		const interval = setInterval(
			() => {
				invalidate(DATA_DEPENDENCY.SENSOR_VALUE_DISTRIBUTION);
			},
			60 * 60 * 1000
		);
		return () => clearInterval(interval);
	});

	function addSensors() {
		const urls = sensorLink
			.split(/[\s,;]+/)
			.map((u) => u.trim())
			.filter((u) => u.length > 0);

		console.log('Adding sensors:', urls);

		if (urls.length === 0) {
			sensorLinkErrorText = 'Bitte gib mindestens einen gültigen Sensor-Link ein.';
			return;
		}

		let hasError = false;
		for (const urlStr of urls) {
			try {
				const url = new URL(urlStr);
				const searchParams = url.searchParams;
				const sensorId = url.pathname.split('/').pop() || null;
				const token = searchParams.get('token');
				if (!sensorId || !token) {
					sensorLinkErrorText = 'Ungültiger Sensor-Link. Bitte überprüfe die URL.';
					return;
				}
				const sensorIdNumber = parseInt(sensorId, 10);
				if (isNaN(sensorIdNumber)) {
					sensorLinkErrorText = 'Ungültiger Sensor-ID. Bitte überprüfe die URL.';
					return;
				}

				SensorStorage.addSensor(sensorIdNumber, token);
			} catch (error) {
				hasError = true;
			}
		}

		if (hasError) {
			sensorLinkErrorText = 'Mindestens ein Sensor-Link ist ungültig. Bitte überprüfe die Eingabe.';
			return;
		}
		SensorStorage.loadStoredSensors().then((sensors) => {
			storedSensors = sensors;
		});
		sensorLink = '';
		sensorLinkErrorText = '';
	}

	let filteredStoredSensors = $derived(
		storedSensors.filter((s) => !data.sensors.some((ds) => ds.id === s.id))
	);
</script>

<div class="page-body">
	<div class="container-xl">
		<div class="row row-deck row-cards">
			{#each data.sensors as sensor (sensor.id)}
				<div class="col-md-6 col-lg-4 col-12">
					<SensorCard
						onclick={() =>
							goto(route('/dashboard/sensor/[id=sensorId]', { id: sensor.id.toString() }))}
						{sensor}
					/>
				</div>
			{/each}

			{#if filteredStoredSensors.length > 0}
				<div class="col-12 mb-2 mt-4">
					<h2>Geteilte Sensoren</h2>
				</div>
				{#each filteredStoredSensors as sensor (sensor.id)}
					<div class="col-md-6 col-lg-4 col-12">
						<SensorCard
							onclick={() =>
								goto(
									`${route('/dashboard/sensor/[id=sensorId]', { id: sensor.id.toString() })}?token=${sensor.readToken}`
								)}
							{sensor}
						>
							<button
								class="btn text-info mt-4"
								onclick={(e) => {
									e.stopPropagation();
									if (
										!confirm(
											'Möchtest du diesen Sensor wirklich aus deinen geteilten Sensoren ausblenden?'
										)
									) {
										return;
									}
									SensorStorage.removeSensor(sensor.id);
									storedSensors = storedSensors.filter((s) => s.id !== sensor.id);
									invalidate(DATA_DEPENDENCY.SENSOR_VALUE_DISTRIBUTION);
								}}
							>
								Ausblenden
							</button>
						</SensorCard>
					</div>
				{/each}
			{/if}

			{#if data.authenticated}
				<div class="col-12">
					<div class="d-flex justify-content-end column-gap-2 w-full">
						<a href={route('/dashboard/sensor/new')} class="btn btn-primary">
							Neuen Sensor einrichten
						</a>
					</div>
				</div>
			{/if}
		</div>
		{#if !data.authenticated}
			<div class="d-flex flex-column align-items-center mt-5">
				<label for="sensor-link" class="mb-2">
					Einen oder mehrere Sensor Share-Links eingeben:
				</label>
				<div class="input-group mb-3" style="max-width: 400px;">
					<input
						id="sensor-link"
						type="text"
						class="form-control"
						bind:value={sensorLink}
						placeholder="z.B. https://blumy.cloud/sensor/1234?token=1234567890abcdef"
						autocomplete="off"
					/>
					<button class="btn btn-primary" type="button" onclick={addSensors}>Hinzufügen</button>
				</div>
				{#if sensorLinkErrorText}
					<p class="form-text text-danger">
						{sensorLinkErrorText}
					</p>
				{/if}
			</div>
		{/if}
	</div>
</div>

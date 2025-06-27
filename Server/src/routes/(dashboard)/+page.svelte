<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { clientApi, DATA_DEPENDENCY } from '$lib/client/api.js';
	import { SensorStorage } from '$lib/client/sensor-storage.js';
	import SensorCard from '$lib/components/sensor-card.svelte';
	import type { SensorDTO } from '$lib/types/api.js';
	import { onMount } from 'svelte';

	let { data } = $props();

	let sensorLink = $state('');

	let storedSensors: SensorDTO[] = $state([]);

	async function loadStoredSensors() {
		const sensors = SensorStorage.getSensors();
		const apiCall = clientApi().sensorList().withIdsAndTokens(sensors);
		if ((await apiCall.response()).ok) {
			storedSensors = await apiCall.parse();
			for (const sensor of storedSensors) {
				// TODO, make it so parsing string to date is not necessary (use superjson?)
				if (sensor.prediction?.nextWatering)
					sensor.prediction.nextWatering = new Date(sensor.prediction.nextWatering);
				if (sensor.lastUpdate?.timestamp)
					sensor.lastUpdate.timestamp = new Date(sensor.lastUpdate.timestamp);
			}
		}
	}

	onMount(() => {
		loadStoredSensors();
		const interval = setInterval(
			() => {
				invalidate(DATA_DEPENDENCY.SENSOR_VALUE_DISTRIBUTION);
			},
			60 * 60 * 1000
		);
		return () => clearInterval(interval);
	});

	function gotoSensor() {
		if (sensorLink.trim()) {
			goto(sensorLink.trim());
		}
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
					<SensorCard onclick={() => goto(`/sensor/${sensor.id}`)} {sensor} />
				</div>
			{/each}

			{#if filteredStoredSensors.length > 0}
				<div class="col-12 mb-2 mt-4">
					<h2>Geteilte Sensoren</h2>
				</div>
				{#each filteredStoredSensors as sensor (sensor.id)}
					<div class="col-md-6 col-lg-4 col-12">
						<SensorCard
							onclick={() => goto(`/sensor/${sensor.id}?token=${sensor.readToken}`)}
							{sensor}
						/>
					</div>
				{/each}
			{/if}

			{#if data.authenticated}
				<div class="col-12">
					<div class="d-flex justify-content-end column-gap-2 w-full">
						<a href="sensor/new" class="btn btn-primary">Neuen Sensor einrichten</a>
					</div>
				</div>
			{/if}
		</div>
		{#if !data.authenticated}
			<div class="d-flex flex-column align-items-center mt-5">
				<label for="sensor-link" class="mb-2">Sensor Share-Link eingeben:</label>
				<div class="input-group mb-3" style="max-width: 400px;">
					<input
						id="sensor-link"
						type="text"
						class="form-control"
						bind:value={sensorLink}
						placeholder="z.B. https://blumy.cloud/sensor/1234?token=1234567890abcdef"
						autocomplete="off"
					/>
					<button class="btn btn-primary" type="button" onclick={gotoSensor}>
						Gehe zu Sensor
					</button>
				</div>
			</div>

			<script lang="ts">
				let sensorLink = '';
			</script>
		{/if}
	</div>
</div>

<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { DATA_DEPENDENCY } from '$lib/api.js';
	import SensorCard from '$lib/components/sensor-card.svelte';
	import { onMount } from 'svelte';

	let { data } = $props();

	let sensorLink = $state('');

	onMount(() => {
		const interval = setInterval(
			() => {
				invalidate(DATA_DEPENDENCY.SENSOR_VALUE_DISTRIBUTION);
			},
			60 * 60 * 1000
		);
		return () => clearInterval(interval);
	});
</script>

<div class="page-body">
	<div class="container-xl">
		{#if data.authenticated}
			<div class="row row-deck row-cards">
				{#each data.sensors as sensor (sensor.id)}
					<div class="col-md-6 col-lg-4 col-12">
						<SensorCard onclick={() => goto(`/sensor/${sensor.id}`)} {sensor} />
					</div>
				{/each}
				<div class="col-12">
					<div class="d-flex justify-content-end column-gap-2 w-full">
						<a href="sensor/new" class="btn btn-primary">Neuen Sensor einrichten</a>
					</div>
				</div>
			</div>
		{:else}
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
					<button
						class="btn btn-primary"
						type="button"
						onclick={() => {
							if (sensorLink.trim()) goto(sensorLink.trim());
						}}
					>
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

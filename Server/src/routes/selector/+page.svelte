<script lang="ts">
	import SensorCard from '$lib/components/sensor-card.svelte';
	import type { SensorDTO } from '$lib/types/api.js';

	export let data;

	async function sensorClick(sensor: SensorDTO) {
		// TODO extract this constant value to an environment variable
		await fetch('http://192.168.4.1/api/cloudSetup/blumy', {
			method: 'POST',
			body: `token=${sensor.writeToken}\nurl=${window.location.origin}/api/v2/data\n`
		});
		location.href = 'http://192.168.4.1/?page=4';
	}
</script>

<div class="page-body">
	<div class="container-xl">
		<div class="row row-deck row-cards">
			{#each data.sensors as sensor (sensor.id)}
				<div class="col-12 col-md-6 col-lg-4">
					<SensorCard
						on:click={() => {
							sensorClick(sensor);
						}}
						{sensor}
					/>
				</div>
			{/each}
			<!-- TODO implement this -->
			<!-- <div class="col-12">
				<div class="w-full d-flex justify-content-end column-gap-2">
					<a href="sensor/new" class="btn btn-primary">Neuen Sensor einrichten</a>
				</div>
			</div> -->
		</div>
	</div>
</div>

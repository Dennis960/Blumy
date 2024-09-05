<script lang="ts">
	import { goto } from '$app/navigation';
	import { setupSensorOnLocalEsp } from '$lib/api.js';
	import SensorSelectionCard from '$lib/components/sensor-selection-card.svelte';
	import { IconPlus } from '$lib/icons.js';
	import type { SensorDTO } from '$lib/types/api.js';

	export let data;
	let error: string | undefined;
	let sensorClicked = false;

	async function sensorClick(sensor: SensorDTO) {
		sensorClicked = true;
		error = await setupSensorOnLocalEsp(sensor.writeToken);
	}
</script>

<div class="page-body">
	<div class="container-xl">
		{#if !error}
			{#if !sensorClicked}
				<h2>Wähle einen Sensor aus</h2>
				<div class="datagrid">
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<section
						on:click={() => goto('/selector/sensor/new')}
						class="card cursor-pointer bg-secondary text-white text-center"
					>
						<div
							class="card-body d-flex flex-column gap-4 align-items-center justify-content-center"
						>
							<IconPlus size={60}></IconPlus>
							<div class="card-title">
								<strong> Neuen Sensor einrichten</strong>
							</div>
						</div>
					</section>
					{#each data.sensors as sensor (sensor.id)}
						<SensorSelectionCard
							on:click={() => {
								sensorClick(sensor);
							}}
							{sensor}
						/>
					{/each}
				</div>
			{:else}
				<h2>Der Sensor wird nun eingerichtet, bitte warten...</h2>
			{/if}
		{:else}
			<h2>Ein Fehler ist aufgetreten</h2>
			<p>{error}</p>
		{/if}
	</div>
</div>

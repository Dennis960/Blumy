<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { DATA_DEPENDENCY } from '$lib/api.js';
	import SensorCard from '$lib/components/sensor-card.svelte';
	import { onMount } from 'svelte';

	let { data } = $props();

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

{#if data.authenticated}
	<div class="page-body">
		<div class="container-xl">
			<div class="row row-deck row-cards">
				{#each data.sensors as sensor (sensor.id)}
					<div class="col-md-6 col-lg-4 col-12">
						<SensorCard on:click={() => goto(`/sensor/${sensor.id}`)} {sensor} />
					</div>
				{/each}
				<div class="col-12">
					<div class="d-flex justify-content-end column-gap-2 w-full">
						<a href="sensor/new" class="btn btn-primary">Neuen Sensor einrichten</a>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

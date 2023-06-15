<script lang="ts">
	import Picker from '$lib/components/picker/picker.svelte';
    import { onMount } from 'svelte';
	import { getAllSensorIds } from '../../data-client'

	export let id = 1;

	let values: number[] = [];
	let valueDescriptions: string[] = [];

	onMount(() => {
		getAllSensorIds().then((apiResponse) => {
			values = apiResponse.data.map((sensor) => sensor.sensorAddress);
			valueDescriptions = apiResponse.data.map((sensor) => `${sensor.sensorAddress}: ${sensor.name}`);
		})
	})
</script>

<Picker {values} bind:value={id} {valueDescriptions} icon={'Sensor.png'} />

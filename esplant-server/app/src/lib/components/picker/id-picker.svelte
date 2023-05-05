<script lang="ts">
	import Picker from '$lib/components/picker/picker.svelte';

	export let id = 1;
	let values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	let valueDescriptions = values.map((value) => value.toString());
</script>

<Picker {values} bind:value={id} {valueDescriptions} icon={'Sensor.png'} />

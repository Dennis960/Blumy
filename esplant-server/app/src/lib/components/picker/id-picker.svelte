<script lang="ts">
	import Picker from '$lib/components/picker/picker.svelte';

	export let id = 1;
	let values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	let valueDescriptions = ["1 Bohnen draußen", "2 Test", "3 Drachenpalme", "4 Blume Oben", "5 Bohne Dennis", "6 Zucchini draußen", "7 Pflücksalat", "8 nicht belegt", "9 nicht belegt", "10 nicht belegt"];
</script>

<Picker {values} bind:value={id} {valueDescriptions} icon={'Sensor.png'} />

<script lang="ts">
	import Picker from '$lib/components/picker/picker.svelte';
	import { DEFAULT_DURATION } from '$lib/constants';
	import { durations, msToTime } from '$lib/durations';

	export let duration = DEFAULT_DURATION;
	let values = Object.values(durations);
	let valueDescriptions = Object.keys(durations).map((key) => key);

	$: isCustomDuration = !Object.values(durations).includes(duration);

	$: if (isCustomDuration) {
		values.unshift(duration);
		valueDescriptions.unshift(msToTime(duration));
	} else {
		values = Object.values(durations);
		valueDescriptions = Object.keys(durations).map((key) => key);
	}
</script>

<Picker {values} bind:value={duration} {valueDescriptions} icon={'Clock.png'} />

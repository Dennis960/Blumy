<script lang="ts" context="module">
	export type { Options as SliderOptions } from 'nouislider';
</script>

<script lang="ts">
	import type { API, Options } from 'nouislider';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';

	export let options: Options;
	export let values: (string | number)[];

	let slider: API;

	let container: HTMLDivElement;

	const dispatch = createEventDispatcher();

	onMount(async () => {
		const NoUiSlider = (await import('nouislider')).default;
		slider = NoUiSlider.create(container, options);
		slider.on('update', () => {
			const newValues = slider.getPositions();

			if (JSON.stringify(newValues) === JSON.stringify(values)) return;
			values = newValues;
			dispatch('input', { values: newValues });
		});
	});

	$: {
		if (slider) {
			slider.updateOptions(options, false);
		}
	}

	onDestroy(() => {
		slider?.destroy();
	});
</script>

<div bind:this={container} {...$$restProps} />

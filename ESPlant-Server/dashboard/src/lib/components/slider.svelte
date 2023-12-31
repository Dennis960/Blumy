<script lang="ts" context="module">
export type { Options as SliderOptions } from 'nouislider';
</script>

<script lang="ts">
	import type { API, Options } from 'nouislider';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';

	export let options: Options;

	let slider: API;

	let container: HTMLDivElement;

    let previousValues: (string|number)[]

    const dispatch = createEventDispatcher();

	onMount(async () => {
		const NoUiSlider = (await import('nouislider')).default;
		slider = NoUiSlider.create(container, options);
        slider.on('update', (values) => {
            if (JSON.stringify(values) === JSON.stringify(previousValues)) return;
            previousValues = values;
            dispatch('input', { values });
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

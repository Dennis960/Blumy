<script lang="ts" module>
	export type { Options as SliderOptions } from 'nouislider';
</script>

<script lang="ts">
	import { run } from 'svelte/legacy';

	import type { API, Options } from 'nouislider';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';

	interface Props {
		options: Options;
		values: (string | number)[];
		[key: string]: any;
	}

	let { options, values = $bindable(), ...rest }: Props = $props();

	let slider: API = $state();

	let container: HTMLDivElement = $state();

	const dispatch = createEventDispatcher();

	onMount(async () => {
		const NoUiSlider = (await import('nouislider')).default;
		slider = NoUiSlider.create(container, options);
		slider.updateOptions(options, false);
		slider.on('update', () => {
			const newValues = slider.getPositions();

			if (JSON.stringify(newValues) === JSON.stringify(values)) return;
			values = newValues;
			dispatch('input', { values: newValues });
		});
	});

	onDestroy(() => {
		slider?.destroy();
	});
</script>

<div bind:this={container} {...rest}></div>

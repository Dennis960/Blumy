<script lang="ts" module>
	export type { Options as SliderOptions } from 'nouislider';
</script>

<script lang="ts">
	import type { API, Options } from 'nouislider';
	import { onDestroy, onMount } from 'svelte';

	interface Props {
		options: Options;
		values: (string | number)[];
		change: (values: (string | number)[]) => void;
		[key: string]: any;
	}

	let { options, values = $bindable(), change, ...rest }: Props = $props();

	let slider: API | undefined = $state();

	let container: HTMLDivElement = $state()!;

	onMount(async () => {
		const NoUiSlider = (await import('nouislider')).default;
		slider = NoUiSlider.create(container, options);
		slider.updateOptions(options, false);
		slider.on('update', () => {
			const newValues = slider!.getPositions();

			if (JSON.stringify(newValues) === JSON.stringify(values)) return;
			values = newValues;
			change(values);
		});
	});

	onDestroy(() => {
		slider?.destroy();
	});
</script>

<div bind:this={container} {...rest}></div>

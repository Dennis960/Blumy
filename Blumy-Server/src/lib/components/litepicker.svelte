<script lang="ts">
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import type Litepicker from 'litepicker';
	import type { ILPConfiguration } from 'litepicker/dist/types/interfaces';

	export let options: ILPConfiguration;

	const dispatch = createEventDispatcher();

	let container: HTMLDivElement;
	let litepicker: Litepicker;
	onMount(async () => {
		const Litepicker = (await import('litepicker')).default;
		litepicker = new Litepicker({
			...options,
			element: (container.firstChild as HTMLElement) ?? container,
			setup: (picker) => {
				options.setup?.(picker);
				picker.on('selected', (date1, date2) => {
					dispatch('selected', {
						startDate: date1.dateInstance,
						endDate: date2.dateInstance
					});
				});
			}
		});
	});

	onDestroy(() => {
		if (litepicker) {
			litepicker.destroy();
		}
	});
</script>

<div class="datepicker-inline" bind:this={container}>
	<slot />
</div>

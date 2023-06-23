<script lang="ts">
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';

	export let options: any = {};

	const dispatch = createEventDispatcher();

	let container: HTMLDivElement;
	let litepicker: any;
	onMount(async () => {
		const Litepicker = (await import('litepicker')).default;
		litepicker = new Litepicker({
			element: container,
			...options,
			setup: (picker) => {
				options.setup?.(picker);
				(<any>picker).on('selected', (date1: any, date2: any) => {
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

<div class="datepicker-inline" bind:this={container} />

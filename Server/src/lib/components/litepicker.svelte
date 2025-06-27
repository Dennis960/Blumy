<script lang="ts">
	import type Litepicker from 'litepicker';
	import type { ILPConfiguration } from 'litepicker/dist/types/interfaces';
	import { onDestroy, onMount } from 'svelte';

	interface Props {
		options: ILPConfiguration;
		selected: (startDate: Date, endDate: Date) => void;
		children?: import('svelte').Snippet;
	}

	let { options, selected, children }: Props = $props();

	let container: HTMLDivElement = $state()!;
	let litepicker: Litepicker;
	onMount(async () => {
		const Litepicker = (await import('litepicker')).default;
		litepicker = new Litepicker({
			...options,
			element: (container.firstChild as HTMLElement) ?? container,
			setup: (picker) => {
				options.setup?.(picker);
				picker.on('selected', (date1, date2) => {
					selected(date1.dateInstance, date2.dateInstance);
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
	{@render children?.()}
</div>

<script context="module" lang="ts">
	import type { ApexOptions } from 'apexcharts';
	export type ChartOptions = ApexOptions;
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	export let options: ApexOptions;

	let chart: (
		node: HTMLElement,
		options: ApexOptions
	) => {
		update: (options: ApexOptions) => void;
		destroy: () => void;
	};
	onMount(async () => {
		const ApexCharts = (await import('apexcharts')).default;
		chart = (node, options) => {
			let myChart = new ApexCharts(node, options);
			myChart.render();

			return {
				update(options) {
					myChart.updateOptions(options);
				},
				destroy() {
					myChart.destroy();
				}
			};
		};
	});
</script>

{#if chart}
	<div use:chart={options} />
{/if}

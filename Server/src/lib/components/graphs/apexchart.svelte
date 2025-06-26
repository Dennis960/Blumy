<script module lang="ts">
	export type ChartOptions = ApexOptions;
	import type { ApexOptions } from 'apexcharts';
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		options: ApexOptions;
	}

	let { options }: Props = $props();

	let chart:
		| ((
				node: HTMLElement,
				options: ApexOptions
		  ) => {
				update: (options: ApexOptions) => void;
				destroy: () => void;
		  })
		| undefined = $state();
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
	<div use:chart={options}></div>
{/if}

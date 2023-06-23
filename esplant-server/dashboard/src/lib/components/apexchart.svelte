<script context="module" lang="ts">
    import type {ApexOptions} from 'apexcharts';
    export type ChartOptions = ApexOptions
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	export let options: ApexOptions

	let chart: any;
	onMount(async () => {
		// @ts-ignore
		chart = (await import('svelte-apexcharts')).chart;
	});
</script>

{#if chart}
	<div use:chart={options} />
{/if}

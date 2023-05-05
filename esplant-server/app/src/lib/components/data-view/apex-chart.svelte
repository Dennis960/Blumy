<script lang="ts">
	import { onMount } from 'svelte';

	export let options = {};

	let chart: any;
	onMount(async () => {
		// @ts-ignore
		chart = (await import('svelte-apexcharts')).chart;
	});
</script>

<div class="chart-container">
	{#if chart}
		<div class="chart" use:chart={options} />
	{/if}
</div>

<style>
	.chart-container {
		height: 100%;
	}
</style>

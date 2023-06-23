<script lang="ts">
	import { onMount } from 'svelte';
	import IconBucketDroplet from '@tabler/icons/bucket-droplet.svg';
	import type { Sensor } from '$lib/api';

	export let sensor: Sensor;

	let chart: any;
	onMount(async () => {
		// @ts-ignore
		chart = (await import('svelte-apexcharts')).chart;
	});

	$: historyEntriesMax = sensor.waterCapacityHistory
		.map((entry) => entry.availableWaterCapacity)
		.reduce((a, b) => Math.max(a, b), 0);
	$: historyEntriesMin = sensor.waterCapacityHistory
		.map((entry) => entry.availableWaterCapacity)
		.reduce((a, b) => Math.min(a, b), 1);

	$: chartOptions = {
		series: [
			{
				name: 'Available Water Capacity',
				data: sensor.waterCapacityHistory
					.filter((entry) => !entry.predicted)
					.map((entry) => ({
						x: entry.timestamp,
						y: entry.availableWaterCapacity
					})),
				color: 'var(--tblr-primary)'
			},
			{
				name: 'Predicted Available Water Capacity',
				data: sensor.waterCapacityHistory
					.filter((entry) => entry.predicted)
					.map((entry) => ({
						x: entry.timestamp,
						y: entry.availableWaterCapacity
					})),
				color: 'var(--tblr-primary)'
			}
		],
		stroke: {
			curve: 'straight',
			width: 1,
			dashArray: [0, 5]
		},
		fill: {
			gradient: {
				shade: 'light',
				gradientToColors: ['var(--tblr-primary)', 'var(--tblr-primary)'],
				opacityFrom: [0.4, 0.1],
				opacityTo: [0.4, 0.1]
			}
		},
		chart: {
			type: 'area',
			animations: {
				enabled: false
			},
			height: '100%',
			parentHeightOffset: 0
		},
		dataLabels: {
			enabled: false
		},
		legend: {
			show: false
		},
		tooltip: {
			x: {
				formatter: (v: number) => {
					return new Date(v).toLocaleString();
				}
			}
		},
		plotOptions: {
			area: {
				fillTo: 'end'
			}
		},
		xaxis: {
			type: 'datetime'
		},
		yaxis: {
			min: (min: number) => Math.min(0.0, min),
			max: (max: number) => Math.max(1.0, max),
			labels: {
				formatter: (value: number) => {
					return Math.round(value * 100) + '%';
				}
			},
			forceNiceScale: true
		},
		annotations: {
			yaxis: [
				{
					y: sensor.config.upperThreshold,
					borderColor: 'var(--tblr-warning)'
				},
				{
					y: 1.0,
					y2: Math.max(1.0, historyEntriesMax),
					fillColor: 'var(--tblr-danger)'
				},
				{
					y: sensor.config.lowerThreshold,
					borderColor: 'var(--tblr-warning)'
				},
				{
					y: Math.min(0.0, historyEntriesMin),
					y2: 0.0,
					fillColor: 'var(--tblr-danger)'
				}
			],
			points: [
				...(sensor.waterCapacityHistory
					.filter((entry) => entry.detectedWatering)
					.map((entry) => ({
						x: entry.timestamp.getTime(),
						y: entry.availableWaterCapacity,
						marker: {
							size: 0
						},
						image: {
							path: IconBucketDroplet,
							offsetX: 5,
							offsetY: -10
						}
					})) ?? [])
			]
		}
	};
</script>

{#if chart}
	<div use:chart={chartOptions} />
{/if}

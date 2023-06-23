<script lang="ts">
	import type { Sensor } from '$lib/api';
	import Apexchart, { type ChartOptions } from './apexchart.svelte';

	export let sensor: Sensor;

	function getOptions(): ChartOptions {
		return {
			series: [
				{
					name: 'RSSI',
					data: sensor.rssiHistory.map((entry) => ({
						x: entry.timestamp,
						y: entry.rssi
					})),
					color: 'var(--tblr-secondary)'
				}
			],
			stroke: {
				curve: 'straight',
				width: 1
			},
			chart: {
				type: 'line',
				animations: {
					enabled: false
				},
				parentHeightOffset: 0,
				zoom: {
					enabled: false
				},
				toolbar: {
					show: false
				}
			},
			dataLabels: {
				enabled: false
			},
			tooltip: {
				x: {
					formatter: (v: number) => {
						return new Date(v).toLocaleString();
					}
				}
			},
			xaxis: {
				type: 'datetime'
			},
			yaxis: {
				min: (min) => Math.min(min, -80),
				max: (max) => Math.max(max, -45)
			},
			annotations: {
				yaxis: [
					{
						y: 0,
						y2: -55,
						fillColor: 'var(--tblr-green)'
					},
					{
						y: -55,
						y2: -67,
						fillColor: 'var(--tblr-warning)'
					},
					{
						y: -67,
						y2: -100,
						fillColor: 'var(--tblr-danger)'
					}
				]
			}
		};
	}

	$: chartOptions = getOptions();
</script>

<Apexchart options={chartOptions} />

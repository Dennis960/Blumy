<script lang="ts">
	import type { Sensor } from '$lib/api';
	import Apexchart, { type ChartOptions } from './apexchart.svelte';

	export let sensor: Sensor;

	function getOptions(): ChartOptions {
		const waterCapacityMax = sensor.waterCapacityHistory
			.map((entry) => entry.availableWaterCapacity)
			.reduce((a, b) => Math.max(a, b), 0);
		const waterCapacityMin = sensor.waterCapacityHistory
			.map((entry) => entry.availableWaterCapacity)
			.reduce((a, b) => Math.min(a, b), 1);

		return {
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
				}
			],
			stroke: {
				curve: 'straight',
				width: 1
			},
			fill: {
				gradient: {
					shade: 'light',
					gradientToColors: ['var(--tblr-primary)'],
					opacityFrom: [0.4],
					opacityTo: [0.4]
				}
			},
			chart: {
				type: 'area',
				animations: {
					enabled: false
				},
				sparkline: {
					enabled: true
				},
				width: '100%',
				height: 20
			},
			tooltip: {
				enabled: false
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
				show: false,
				min: 0.0,
				max: 1.0
			},
			annotations: {
				yaxis: [
					{
						y: sensor.config.upperThreshold,
						borderColor: 'var(--tblr-warning)'
					},
					{
						y: 1.0,
						y2: Math.max(1.0, waterCapacityMax),
						fillColor: 'var(--tblr-danger)'
					},
					{
						y: sensor.config.lowerThreshold,
						borderColor: 'var(--tblr-warning)'
					},
					{
						y: Math.min(0.0, waterCapacityMin),
						y2: 0.0,
						fillColor: 'var(--tblr-danger)'
					}
				]
			}
		};
	}
	$: chartOptions = getOptions();
</script>

<Apexchart options={chartOptions} />

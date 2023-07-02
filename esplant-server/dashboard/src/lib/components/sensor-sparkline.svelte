<script lang="ts">
	import type { SensorDTO, SensorHistoryDTO } from '$lib/types/api';
	import Apexchart, { type ChartOptions } from './apexchart.svelte';

	export let sensor: SensorDTO;
	export let history: SensorHistoryDTO;

	function getOptions(sensor: SensorDTO, history: SensorHistoryDTO): ChartOptions {
		const waterCapacityMax = history.waterCapacityHistory
			.map((entry) => entry.waterCapacity)
			.reduce((a, b) => Math.max(a, b), 0);
		const waterCapacityMin = history.waterCapacityHistory
			.map((entry) => entry.waterCapacity)
			.reduce((a, b) => Math.min(a, b), 1);

		return {
			series: [
				{
					name: 'Available Water Capacity',
					data: history.waterCapacityHistory.map((entry) => ({
						x: entry.timestamp,
						y: entry.waterCapacity
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
	$: chartOptions = getOptions(sensor, history);
</script>

<Apexchart options={chartOptions} />

<script lang="ts">
	import IconBucketDroplet from '@tabler/icons/bucket-droplet.svg';
	import type { Sensor } from '$lib/api';
	import Apexchart, { type ChartOptions } from './apexchart.svelte';

	export let sensor: Sensor;

	function getOptions(): ChartOptions {
		const historyEntriesMax = sensor.waterCapacityHistory
			.map((entry) => entry.availableWaterCapacity)
			.reduce((a, b) => Math.max(a, b), 0);
		const historyEntriesMin = sensor.waterCapacityHistory
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
	}

	$: chartOptions = getOptions();
</script>

<Apexchart options={chartOptions} />

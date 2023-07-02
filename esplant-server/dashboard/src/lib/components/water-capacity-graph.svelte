<script lang="ts">
	import { IconBucketDropletSvg } from '$lib/icons';
	import type { SensorDTO, SensorHistoryDTO } from '$lib/types/api';
	import Apexchart, { type ChartOptions } from './apexchart.svelte';

	export let sensor: SensorDTO;
	export let history: SensorHistoryDTO;

	function getOptions(sensor: SensorDTO, history: SensorHistoryDTO): ChartOptions {
		const historyEntriesMax = history.waterCapacityHistory
			.map((entry) => entry.waterCapacity)
			.reduce((a, b) => Math.max(a, b), 0);
		const historyEntriesMin = history.waterCapacityHistory
			.map((entry) => entry.waterCapacity)
			.reduce((a, b) => Math.min(a, b), 1);

		const firstTimestamp =
			history.waterCapacityHistory.length > 0
				? history.waterCapacityHistory[0].timestamp
				: new Date(0);
		const lastTimestamp =
			history.waterCapacityHistory.length > 0
				? history.waterCapacityHistory[history.waterCapacityHistory.length - 1].timestamp
				: new Date();
		const graphEndsToday = lastTimestamp.toDateString() == new Date().toDateString();

		return {
			series: [
				{
					name: 'Available Water Capacity',
					data: history.waterCapacityHistory.map((entry) => ({
						x: entry.timestamp,
						y: entry.waterCapacity
					})),
					color: 'var(--tblr-primary)'
				},
				...(sensor.prediction != undefined && graphEndsToday
					? [
							{
								name: 'Predicted Available Water Capacity',
								data: sensor.prediction.predictedWaterCapacity
									.filter((entry) => entry.timestamp > firstTimestamp)
									.map((entry) => ({
										x: entry.timestamp,
										y: entry.waterCapacity
									})),
								color: 'var(--tblr-primary)'
							}
					  ]
					: [])
			],
			stroke: {
				curve: 'straight',
				width: 3,
				dashArray: [0, 5]
			},
			fill: {
				gradient: {
					shade: 'light',
					gradientToColors: ['var(--tblr-primary)', 'var(--tblr-primary)'],
					opacityFrom: [0.4, 0.0],
					opacityTo: [0.4, 0.0]
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
					...(history.waterCapacityHistory
						.filter((entry) => entry.detectedWatering)
						.map((entry) => ({
							x: entry.timestamp.getTime(),
							y: entry.waterCapacity,
							marker: {
								size: 0
							},
							image: {
								path: IconBucketDropletSvg,
								offsetX: 5,
								offsetY: -10
							}
						})) ?? [])
				]
			}
		};
	}

	$: chartOptions = getOptions(sensor, history);
</script>

<Apexchart options={chartOptions} />

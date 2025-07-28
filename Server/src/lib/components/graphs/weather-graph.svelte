<script lang="ts">
	import type { SensorHistoryDTO } from '$lib/types/api';
	import Apexchart, { type ChartOptions } from './apexchart.svelte';

	interface Props {
		history: SensorHistoryDTO;
	}

	let { history }: Props = $props();

	function getOptions(history: SensorHistoryDTO): ChartOptions {
		return {
			series: [
				{
					name: 'Temperatur',
					data: history.weatherHistory.map((entry) => ({
						x: entry.timestamp,
						y: Math.round(entry.temperature * 10) / 10
					})),
					color: '#ff0000'
				},
				{
					name: 'Luftfeuchtigkeit',
					data: history.weatherHistory.map((entry) => ({
						x: entry.timestamp,
						y: Math.round(entry.humidity)
					})),
					color: '#0074d9'
				}
			],
			chart: {
				type: 'line',
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
				show: true,
				labels: {
					colors: ['#ff0000', '#0074d9']
				}
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
			yaxis: [
				{
					title: {
						text: 'Temperatur'
					}
				},
				{
					opposite: true,
					title: {
						text: 'Luftfeuchtigkeit'
					}
				}
			]
		};
	}

	let chartOptions = $derived(getOptions(history));
</script>

<Apexchart options={chartOptions} />

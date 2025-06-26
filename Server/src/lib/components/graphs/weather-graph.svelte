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
					color: 'var(--tblr-primary)'
				},
				{
					name: 'Luftfeuchtigkeit',
					data: history.weatherHistory.map((entry) => ({
						x: entry.timestamp,
						y: Math.round(entry.humidity)
					})),
					color: 'var(--tblr-secondary)'
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
				show: false
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

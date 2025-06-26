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
					name: 'Volt',
					data: history.debugHistory.map((entry) => ({
						x: entry.timestamp,
						y: entry.voltage
					})),
					color: 'var(--tblr-black)'
				}
			],
			stroke: {
				curve: 'stepline',
				width: 2
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
				min: (min) => Math.min(min, 2.0),
				max: (max) => Math.max(max, 3.1)
			},
			annotations: {
				yaxis: [
					{
						y: 2.7,
						y2: 3.1,
						fillColor: 'var(--tblr-green)'
					},
					{
						y: 2.5,
						y2: 2.7,
						fillColor: 'var(--tblr-warning)'
					},
					{
						y: 2.1,
						y2: 2.5,
						fillColor: 'var(--tblr-danger)'
					}
				]
			}
		};
	}

	let chartOptions = $derived(getOptions(history));
</script>

<Apexchart options={chartOptions} />

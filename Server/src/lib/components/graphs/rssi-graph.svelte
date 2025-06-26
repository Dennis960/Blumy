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
					name: 'RSSI',
					data: history.debugHistory.map((entry) => ({
						x: entry.timestamp,
						y: entry.rssi
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

	let chartOptions = $derived(getOptions(history));
</script>

<Apexchart options={chartOptions} />

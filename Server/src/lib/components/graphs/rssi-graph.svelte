<script lang="ts">
	import {
		MAX_RSSI_GRAPH,
		MIN_RSSI_GRAPH,
		RSSI_MODERATE_THRESHOLD,
		RSSI_STRONG_THRESHOLD
	} from '$lib/client/config';
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
						y: Math.round(entry.rssi)
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
				min: (min) => Math.min(min, MIN_RSSI_GRAPH),
				max: (max) => Math.max(max, MAX_RSSI_GRAPH)
			},
			annotations: {
				yaxis: [
					{
						y: 0,
						y2: RSSI_STRONG_THRESHOLD,
						fillColor: 'var(--tblr-green)'
					},
					{
						y: RSSI_STRONG_THRESHOLD,
						y2: RSSI_MODERATE_THRESHOLD,
						fillColor: 'var(--tblr-warning)'
					},
					{
						y: RSSI_MODERATE_THRESHOLD,
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

<script lang="ts">
	import {
		BATTERY_EMPTY_THRESHOLD,
		BATTERY_LOW_THRESHOLD,
		MAX_BATTERY_VOLTAGE,
		MAX_VOLTAGE_GRAPH,
		MIN_BATTERY_VOLTAGE,
		MIN_VOLTAGE_GRAPH
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
					name: 'Volt',
					data: history.debugHistory.map((entry) => ({
						x: entry.timestamp,
						y: Math.round(entry.voltage * 100) / 100
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
				min: (min) => Math.min(min, MIN_BATTERY_VOLTAGE),
				max: (max) => Math.max(max, MAX_BATTERY_VOLTAGE)
			},
			annotations: {
				yaxis: [
					{
						y: BATTERY_LOW_THRESHOLD,
						y2: MAX_VOLTAGE_GRAPH,
						fillColor: 'var(--tblr-green)'
					},
					{
						y: BATTERY_EMPTY_THRESHOLD,
						y2: BATTERY_LOW_THRESHOLD,
						fillColor: 'var(--tblr-warning)'
					},
					{
						y: MIN_VOLTAGE_GRAPH,
						y2: BATTERY_EMPTY_THRESHOLD,
						fillColor: 'var(--tblr-danger)'
					}
				]
			}
		};
	}

	let chartOptions = $derived(getOptions(history));
</script>

<Apexchart options={chartOptions} />

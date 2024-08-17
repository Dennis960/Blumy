<script lang="ts">
	import type { SensorHistoryDTO } from '$lib/types/api';
	import Apexchart, { type ChartOptions } from './apexchart.svelte';

	export let history: SensorHistoryDTO;

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
				min: (min) => Math.min(min, 2.00),
				max: (max) => Math.max(max, 3.10)
			},
			annotations: {
				yaxis: [
					{
						y: 2.70,
						y2: 3.10,
						fillColor: 'var(--tblr-green)'
					},
					{
						y: 2.50,
						y2: 2.70,
						fillColor: 'var(--tblr-warning)'
					},
					{
						y: 2.10,
						y2: 2.50,
						fillColor: 'var(--tblr-danger)'
					}
				]
			}
		};
	}

	$: chartOptions = getOptions(history);
</script>

<Apexchart options={chartOptions} />

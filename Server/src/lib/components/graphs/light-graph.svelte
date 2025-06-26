<script lang="ts">
	import type { SensorHistoryDTO } from '$lib/types/api';
	import Apexchart, { type ChartOptions } from './apexchart.svelte';

	interface Props {
		history: SensorHistoryDTO;
	}

	let { history }: Props = $props();

	function getOptions(history: SensorHistoryDTO): ChartOptions {
		// resample data into fixed-interval timestamp buckets

		const minDate = history.lightHistory[0].timestamp;
		const maxDate = history.lightHistory[history.lightHistory.length - 1].timestamp;
		const interval = (maxDate.valueOf() - minDate.valueOf()) / history.lightHistory.length;
		const resampledData: {
			x: number;
			y: number | null;
		}[] = [];
		for (let date = minDate.valueOf(); date < maxDate.valueOf(); date += interval) {
			const yValues = history.lightHistory
				.filter(
					(entry) =>
						entry.timestamp.valueOf() >= date && entry.timestamp.valueOf() < date + interval
				)
				.map((entry) => entry.light);
			if (yValues.length == 0) {
				resampledData.push({
					x: date,
					y: null
				});
			} else {
				resampledData.push({
					x: date,
					y: yValues.reduce((a, b) => a + b, 0) / yValues.length
				});
			}
		}

		return {
			series: [
				{
					name: 'Helligkeit',
					data: resampledData,
					color: '#f59f00' // tblr-yellow, variables are not supported
				}
			],
			chart: {
				type: 'heatmap',
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
			}
		};
	}

	let chartOptions = $derived(getOptions(history));
</script>

<Apexchart options={chartOptions} />

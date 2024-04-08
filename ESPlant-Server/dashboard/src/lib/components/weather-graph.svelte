<script lang="ts">
	import type { SensorDTO, SensorHistoryDTO } from '$lib/types/api';
	import Apexchart, { type ChartOptions } from './apexchart.svelte';

	export let sensor: SensorDTO;
	export let history: SensorHistoryDTO;

	function getOptions(sensor: SensorDTO, history: SensorHistoryDTO): ChartOptions {
		return {
			series: [ {
                name: 'Temperatur',
                data: history.weatherHistory.map((entry) => ({
                    x: entry.timestamp,
                    y: entry.temperature
                })),
                color: 'var(--tblr-primary)'
            }, {
                name: 'Luftfeuchtigkeit',
                data: history.weatherHistory.map((entry) => ({
                    x: entry.timestamp,
                    y: entry.humidity
                })),
                color: 'var(--tblr-secondary)'
            } ],
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
                        text: 'Temperatur',
                    },
                },
                {
                    opposite: true,
                    title: {
                        text: 'Luftfeuchtigkeit',
                    },
                },
            ],
		};
	}

	$: chartOptions = getOptions(sensor, history);
</script>

<Apexchart options={chartOptions} />

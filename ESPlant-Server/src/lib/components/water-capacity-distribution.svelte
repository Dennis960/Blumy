<script lang="ts">
	import {
		IconDropletFilled2Svg,
		IconDropletFilledSvg,
		IconDropletSvg,
		IconGraveSvg,
		IconScubeMaskSvg
	} from '$lib/icons';
	import type { SensorConfigurationDTO, SensorValueDistributionDTO } from '$lib/types/api';
	import { debounce } from 'lodash-es';
	import Apexchart, { type ChartOptions } from './apexchart.svelte';

	export let sensorValueDistribution: SensorValueDistributionDTO;
	export let sensorConfig: SensorConfigurationDTO;

	function getOptions(
		sensorValueDistribution: SensorValueDistributionDTO,
		sensorConfig: SensorConfigurationDTO
	): ChartOptions {
		const isCritical = (bucket: number) =>
			bucket <= sensorConfig.permanentWiltingPoint || bucket >= sensorConfig.fieldCapacity;
		const isWarning = (bucket: number) =>
			!isCritical(bucket) &&
			(bucket <= sensorConfig.lowerThreshold * sensorConfig.fieldCapacity ||
				bucket >= sensorConfig.upperThreshold * sensorConfig.fieldCapacity);

		const sensorValueMax = 1024;
		const distributionMap: Map<number, number> = new Map();
		for (
			let x = 0;
			x < sensorValueMax;
			x += sensorValueDistribution.waterCapacityDistribution.bucketSize
		) {
			distributionMap.set(x, 0);
		}
		sensorValueDistribution.waterCapacityDistribution.entries.forEach((entry) => {
			distributionMap.set(entry.bucket, entry.count);
		});
		const data = [...distributionMap.entries()].map(([x, y]) => ({ x, y }));

		const height = 48;

		return {
			series: [{ data }],
			stroke: {
				curve: 'straight',
				width: 1
			},
			chart: {
				type: 'bar',
				animations: {
					enabled: false
				},
				sparkline: {
					enabled: true
				},
				width: '100%',
				height
			},
			tooltip: {
				enabled: false
			},
			xaxis: {
				min: 0,
				max: sensorValueMax
			},
			plotOptions: {
				bar: {
					columnWidth: '100%'
				}
			},
			grid: {
				padding: {
					// align with slider
					left: -12,
					right: -4
				}
			},
			colors: [
				function ({ dataPointIndex }: { dataPointIndex: number }) {
					const value = data[dataPointIndex].x;
					if (isCritical(value)) {
						return 'var(--tblr-danger)';
					}
					if (isWarning(value)) {
						return 'var(--tblr-warning)';
					}
					return 'var(--tblr-success)';
				}
			],
			annotations: {
				xaxis: [
					{
						x: sensorConfig.permanentWiltingPoint,
						borderColor: 'var(--tblr-danger)',
						strokeDashArray: 0
					},
					{
						x: sensorConfig.fieldCapacity,
						borderColor: 'var(--tblr-danger)',
						strokeDashArray: 0
					},
					{
						x: sensorConfig.lowerThreshold * sensorConfig.fieldCapacity,
						borderColor: 'var(--tblr-warning)',
						strokeDashArray: 0
					},
					{
						x: sensorConfig.upperThreshold * sensorConfig.fieldCapacity,
						borderColor: 'var(--tblr-warning)',
						strokeDashArray: 0
					}
				],
				points: [
					{
						x: sensorConfig.permanentWiltingPoint / 2,
						y: 0,
						marker: {
							size: 0
						},
						image: {
							path: IconGraveSvg,
							offsetX: 0,
							offsetY: -height / 2
						}
					},
					{
						x:
							(sensorConfig.permanentWiltingPoint +
								sensorConfig.lowerThreshold * sensorConfig.fieldCapacity) /
							2,
						y: 0,
						marker: {
							size: 0
						},
						image: {
							path: IconDropletSvg,
							offsetX: 0,
							offsetY: -height / 2
						}
					},
					{
						x:
							(sensorConfig.lowerThreshold * sensorConfig.fieldCapacity +
								sensorConfig.upperThreshold * sensorConfig.fieldCapacity) /
							2,
						y: 0,
						marker: {
							size: 0
						},
						image: {
							path: IconDropletFilled2Svg,
							offsetX: 0,
							offsetY: -height / 2
						}
					},
					{
						x:
							(sensorConfig.upperThreshold * sensorConfig.fieldCapacity +
								sensorConfig.fieldCapacity) /
							2,
						y: 0,
						marker: {
							size: 0
						},
						image: {
							path: IconDropletFilledSvg,
							offsetX: 0,
							offsetY: -height / 2
						}
					},
					{
						x: (sensorConfig.fieldCapacity + sensorValueMax) / 2,
						y: 0,
						marker: {
							size: 0
						},
						image: {
							path: IconScubeMaskSvg,
							offsetX: 0,
							offsetY: -height / 2
						}
					}
				]
			}
		};
	}

	let chartOptions: ChartOptions;
	function updateChartOptions(
		sensorValueDistribution: SensorValueDistributionDTO,
		sensorConfig: SensorConfigurationDTO
	) {
		chartOptions = getOptions(sensorValueDistribution, sensorConfig);
	}

	const updateChartOptionsDebounced = debounce(updateChartOptions, 100);

	updateChartOptions(sensorValueDistribution, sensorConfig);
	$: updateChartOptionsDebounced(sensorValueDistribution, sensorConfig);
</script>

<Apexchart options={chartOptions} />

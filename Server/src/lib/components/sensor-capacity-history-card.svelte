<script lang="ts">
	import { page } from '$app/stores';
	import Litepicker from '$lib/components/litepicker.svelte';
	import { IconCalendar, IconChevronLeftRaw, IconChevronRightRaw } from '$lib/icons';
	import type { SensorDTO, SensorHistoryDTO } from '$lib/types/api';
	import type { ILPConfiguration } from 'litepicker/dist/types/interfaces';
	import LightGraph from './graphs/light-graph.svelte';
	import RssiGraph from './graphs/rssi-graph.svelte';
	import VoltageGraph from './graphs/voltage-graph.svelte';
	import WaterCapacityGraph from './graphs/water-capacity-graph.svelte';
	import WeatherGraph from './graphs/weather-graph.svelte';

	interface Props {
		sensor: SensorDTO;
		history: SensorHistoryDTO;
		dateRange: { startDate: Date; endDate: Date };
	}

	let { sensor, history, dateRange = $bindable() }: Props = $props();

	const litepickerOptions = {
		singleMode: false,
		buttonText: {
			previousMonth: IconChevronLeftRaw,
			nextMonth: IconChevronRightRaw
		},
		maxDate: new Date(),
		startDate: dateRange.startDate,
		endDate: dateRange.endDate
	} as ILPConfiguration;

	function handleDateChange(e: CustomEvent) {
		const newStartDate = e.detail.startDate;
		newStartDate.setHours(0, 0, 0, 0);
		const newEndDate = e.detail.endDate;
		newEndDate.setHours(23, 59, 59, 999);
		dateRange = { startDate: newStartDate, endDate: newEndDate };
	}

	// true if "debug" is in the URL query
	const debugMode = $page.url.searchParams.has('debug');
</script>

<section class="card">
	<div class="card-header">
		<h1 class="card-title">Verlauf der Wasserkapazität</h1>
		<div class="card-actions">
			<div class="input-icon">
				<Litepicker options={litepickerOptions} on:selected={handleDateChange}>
					<input class="form-control pe-5" />
				</Litepicker>
				<span class="input-icon-addon">
					<IconCalendar />
				</span>
			</div>
		</div>
	</div>
	<div class="card-body">
		<div class="charts">
			{#if history.waterCapacityHistory.length > 2}
				<div class="charts__graph">
					<WaterCapacityGraph {sensor} {history} />
				</div>
			{/if}
			{#if history.weatherHistory.length > 2}
				<div class="charts__graph">
					<WeatherGraph {history} />
				</div>
			{/if}
			{#if history.lightHistory.length > 2}
				<div class="charts__graph">
					<LightGraph {history} />
				</div>
			{/if}
		</div>

		{#if debugMode && history.debugHistory.length > 2}
			<div>
				<div class="charts__graph">
					<RssiGraph {history} />
				</div>
				<div class="charts__graph">
					<VoltageGraph {history} />
				</div>
			</div>
		{/if}
	</div>
</section>

<style>
	.charts {
		height: calc(100vh - 200px);
		display: grid;
		grid-template-rows: minmax(0, 4fr) minmax(0, 3fr) minmax(0, 1fr);
	}

	.charts__graph {
		height: 100%;
		/* disable graph touch events on mobile to allow touch scrolling */
		pointer-events: none;
	}
	@media (hover: hover) {
		.charts__graph {
			pointer-events: auto;
		}
	}
</style>

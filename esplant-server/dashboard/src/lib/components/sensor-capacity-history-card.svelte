<script lang="ts">
	import { IconCalendar, IconChevronLeftRaw, IconChevronRightRaw } from '$lib/icons';
	import type { SensorDTO, SensorHistoryDTO } from '$lib/types/api';
	import Litepicker from '$lib/components/litepicker.svelte';
	import WaterCapacityGraph from './water-capacity-graph.svelte';

	export let sensor: SensorDTO;
	export let history: SensorHistoryDTO;
	export let dateRange: { startDate: Date; endDate: Date };

	const litepickerOptions = {
		singleMode: false,
		buttonText: {
			previousMonth: IconChevronLeftRaw,
			nextMonth: IconChevronRightRaw
		},
		maxDate: new Date(),
		startDate: dateRange.startDate,
		endDate: dateRange.endDate
	};

	function handleDateChange(e: CustomEvent) {
		const newStartDate = e.detail.startDate;
		newStartDate.setHours(0, 0, 0, 0);
		const newEndDate = e.detail.endDate;
		newEndDate.setHours(23, 59, 59, 999);
		dateRange = { startDate: newStartDate, endDate: newEndDate };
	}
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
		<div class="graph ratio ratio-4x3">
			<WaterCapacityGraph {sensor} {history} />
		</div>
	</div>
</section>

<style>
	/* disable graph touch events on mobile to allow touch scrolling */
	.graph {
		pointer-events: none;
	}
	@media (hover: hover) {
		.graph {
			pointer-events: auto;
		}
	}
</style>
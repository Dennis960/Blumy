<script lang="ts">
	import Time from 'svelte-time';
	import {
		IconWifi1,
		IconWifi2,
		IconWifiOff,
		IconDroplet,
		IconDropletFilled2,
		IconDropletFilled,
		IconScubaMask,
		IconGrave,
		IconClockExclamation,
		IconClock,
		IconAlertTriangle
	} from '@tabler/icons-svelte';
	import IconChevronLeft from '@tabler/icons/chevron-left.svg?raw';
	import IconChevronRight from '@tabler/icons/chevron-right.svg?raw';
	import { createQuery } from '@tanstack/svelte-query';
	import { fetchSensorData } from '$lib/api';
	import SensorGraph from '$lib/components/sensor-graph.svelte';
	import Litepicker from '$lib/components/litepicker.svelte';

	export let data;

	let dropdown: HTMLDivElement;

	const litepickerOptions = {
		singleMode: false,
		inlineMode: true,
		buttonText: {
			previousMonth: IconChevronLeft,
			nextMonth: IconChevronRight
		},
		maxDate: new Date(),
		startDate: data.startDate,
		endDate: data.endDate
	};

	function handleDateChange(e: CustomEvent) {
		const dropdownControl = new (<any>window).bootstrap.Dropdown(dropdown);
		dropdownControl.hide();
		const newStartDate = e.detail.startDate;
		newStartDate.setHours(0, 0, 0, 0);
		startDate = newStartDate;
		const newEndDate = e.detail.endDate;
		newEndDate.setHours(23, 59, 59, 999);
		endDate = newEndDate;
	}

	let startDate = data.startDate;
	let endDate = data.endDate;

	$: statusQuery = createQuery({
		queryKey: ['sensor-data', data.id],
		queryFn: () => {
			const oneWeekAgo = new Date();
			oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
			return fetchSensorData(data.id, data.name, oneWeekAgo, new Date());
		},
		refetchInterval: 1 * 60 * 1000
	});

	$: historyQuery = createQuery({
		queryKey: ['sensor-data', data.id, startDate, endDate],
		queryFn: () => fetchSensorData(data.id, data.name, startDate, endDate)
	});
</script>

<div class="row">
	<div class="col">
		<h1 class="page-title">{data.name}</h1>
	</div>
</div>
<div class="page-body">
	<div class="row row-decks row-cards">
		{#if $statusQuery.data?.lastReading == undefined}
			<div class="col-12 col-md-4 col-lg-3">
				<section class="card">
					<div class="card-body">
						<h1 class="subheader mb-0">Sensor Health</h1>
						<div class="h1 text-danger">
							<IconAlertTriangle class="align-text-bottom" size={24} />
							<span class="ms-1">No Data</span>
						</div>
					</div>
				</section>
			</div>
		{:else}
			<div class="col-12 col-md-4 col-lg-3">
				<section class="card">
					<div class="card-body">
						<h1 class="subheader mb-0">Water Capacity</h1>
						<div class="h1">
							{#if $statusQuery.data.status.drowning}
								<IconScubaMask class="align-text-bottom" size={24} />
							{:else if $statusQuery.data.status.wilting}
								<IconGrave class="align-text-bottom" size={24} />
							{:else if $statusQuery.data.status.overwatered}
								<IconDropletFilled class="align-text-bottom" size={24} />
							{:else if $statusQuery.data.status.underwatered}
								<IconDroplet class="align-text-bottom" size={24} />
							{:else}
								<IconDropletFilled2 class="align-text-bottom" size={24} />
							{/if}
							<span class="ms-1">
								{#if $statusQuery.data.status.drowning}
									&gt;100%
								{:else if $statusQuery.data.status.wilting}
									&lt;0%
								{:else}
									{Math.round($statusQuery.data.lastReading.availableWaterCapacity * 100)}%
								{/if}
							</span>
						</div>
					</div>
				</section>
			</div>

			{#if $statusQuery.data.estimatedNextWatering != undefined}
			<div class="col-12 col-md-4 col-lg-3">
					<section class="card">
						<div class="card-body">
							<h1 class="subheader mb-0">Next Watering</h1>
							<div
								class="h1 {$statusQuery.data.status.waterToday ? 'text-danger' : ''} {$statusQuery
									.data.status.waterTomorrow
									? 'text-warning'
									: ''}"
							>
								{#if $statusQuery.data.status.waterToday || $statusQuery.data.status.waterTomorrow}
									<IconClockExclamation class="align-text-bottom" size={24} />
								{:else}
									<IconClock class="align-text-bottom" size={24} />
								{/if}
								<Time class="ms-1" relative timestamp={$statusQuery.data.estimatedNextWatering} />
							</div>
						</div>
					</section>
				</div>
			{/if}

			<div class="col-12 col-md-4 col-lg-3">
				<section class="card">
					<div class="card-body">
						<h1 class="subheader mb-0">Sensor Health</h1>
						<div
							class="h1 {$statusQuery.data.status.signalStrength == 'offline'
								? 'text-danger'
								: ''} {$statusQuery.data.status.lowBattery ||
							$statusQuery.data.status.signalStrength == 'weak'
								? 'text-warning'
								: ''}"
						>
							{#if $statusQuery.data.status.signalStrength == 'offline'}
								<IconWifiOff class="align-text-bottom" size={24} />
							{:else if $statusQuery.data.status.lowBattery || $statusQuery.data.status.signalStrength == 'weak'}
								<IconAlertTriangle class="align-text-bottom" size={24} />
							{:else if $statusQuery.data.status.signalStrength == 'strong'}
								<IconWifi2 class="align-text-bottom" size={24} />
							{:else if $statusQuery.data.status.signalStrength == 'moderate'}
								<IconWifi1 class="align-text-bottom" size={24} />
							{/if}
							<span class="ms-1">
								{#if $statusQuery.data.status.signalStrength == 'offline'}
									offline
								{:else if $statusQuery.data.status.lowBattery}
									Low Battery
								{:else if $statusQuery.data.status.signalStrength == 'weak'}
									Poor Signal
								{:else}
									Ok
								{/if}
							</span>
						</div>
					</div>
				</section>
			</div>
		{/if}

		<div class="col-12">
			<section class="card">
				<div class="card-body">
					<div class="d-flex flex-wrap">
						<h1 class="card-title">Water Capacity History</h1>
						<div class="ms-auto lh-1">
							<div class="dropdown">
								<a
									class="dropdown-toggle text-muted"
									href="#"
									data-bs-toggle="dropdown"
									aria-haspopup="true"
									aria-expanded="false"
									data-bs-auto-close="false"
								>
									<Time timestamp={startDate} /> - <Time timestamp={endDate} />
								</a>
								<div class="dropdown-menu dropdown-menu-end p-0" bind:this={dropdown}>
									<Litepicker options={litepickerOptions} on:selected={handleDateChange} />
								</div>
							</div>
						</div>
					</div>
					<div class="sensor-graph">
						{#if $historyQuery.data != undefined}
							<SensorGraph sensor={$historyQuery.data} />
						{/if}
					</div>
				</div>
			</section>
		</div>
	</div>
</div>

<style>
	.sensor-graph {
		height: 60vh;
	}
</style>

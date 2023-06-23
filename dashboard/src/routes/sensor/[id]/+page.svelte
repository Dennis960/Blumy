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
		IconAlertTriangle,
		IconBucketDroplet
	} from '@tabler/icons-svelte';
	import IconChevronLeft from '@tabler/icons/chevron-left.svg?raw';
	import IconChevronRight from '@tabler/icons/chevron-right.svg?raw';
	import { createQuery } from '@tanstack/svelte-query';
	import { fetchSensorData } from '$lib/api';
	import SensorGraph from '$lib/components/sensor-graph.svelte';
	import Litepicker from '$lib/components/litepicker.svelte';
	import SensorStatusCard from '$lib/components/sensor-status-card.svelte';

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
				<SensorStatusCard title="Sensor Health" value="No Data" critical>
					<IconAlertTriangle slot="icon" class="align-text-bottom" size={24} />
				</SensorStatusCard>
			</div>
		{:else}
			<div class="col-12 col-md-4 col-lg-3">
				<SensorStatusCard
					title="Water Capacity"
					value={$statusQuery.data.status.drowning
						? '>100%'
						: $statusQuery.data.status.wilting
						? '<0%'
						: Math.round($statusQuery.data.lastReading.availableWaterCapacity * 100) + '%'}
					warning={$statusQuery.data.status.overwatered || $statusQuery.data.status.underwatered}
					critical={$statusQuery.data.status.drowning || $statusQuery.data.status.wilting}
				>
					<svelte:fragment slot="icon">
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
					</svelte:fragment>
				</SensorStatusCard>
			</div>

			{#if $statusQuery.data.estimatedNextWatering != undefined}
				<div class="col-12 col-md-4 col-lg-3">
					<SensorStatusCard
						title="Next Watering"
						critical={$statusQuery.data.status.waterToday}
						warning={$statusQuery.data.status.waterTomorrow}
					>
						<svelte:fragment slot="icon">
							{#if $statusQuery.data.status.waterToday || $statusQuery.data.status.waterTomorrow}
								<IconClockExclamation class="align-text-bottom" size={24} />
							{:else}
								<IconBucketDroplet class="align-text-bottom" size={24} />
							{/if}
						</svelte:fragment>
						<Time slot="value" relative timestamp={$statusQuery.data.estimatedNextWatering} />
					</SensorStatusCard>
				</div>
			{/if}

			<div class="col-12 col-md-4 col-lg-3">
				<SensorStatusCard
					title="Sensor Health"
					value={$statusQuery.data.status.signalStrength == 'offline'
						? 'offline'
						: $statusQuery.data.status.lowBattery
						? 'Low Battery'
						: $statusQuery.data.status.signalStrength == 'weak'
						? 'Poor Signal'
						: 'Ok'}
					critical={$statusQuery.data.status.signalStrength == 'offline'}
					warning={$statusQuery.data.status.lowBattery ||
						$statusQuery.data.status.signalStrength == 'weak'}
				>
					<svelte:fragment slot="icon">
						{#if $statusQuery.data.status.signalStrength == 'offline'}
							<IconWifiOff class="align-text-bottom" size={24} />
						{:else if $statusQuery.data.status.lowBattery || $statusQuery.data.status.signalStrength == 'weak'}
							<IconAlertTriangle class="align-text-bottom" size={24} />
						{:else if $statusQuery.data.status.signalStrength == 'strong'}
							<IconWifi2 class="align-text-bottom" size={24} />
						{:else if $statusQuery.data.status.signalStrength == 'moderate'}
							<IconWifi1 class="align-text-bottom" size={24} />
						{/if}
					</svelte:fragment>
				</SensorStatusCard>
			</div>

			<div class="col-12 col-md-4 col-lg-3">
				<SensorStatusCard
					title="Last Update"
					warning={$statusQuery.data.status.signalStrength == 'offline'}
				>
					<svelte:fragment slot="icon">
						{#if $statusQuery.data.status.signalStrength == 'offline'}
							<IconWifiOff class="align-text-bottom" size={24} />
						{:else}
							<IconClock class="align-text-bottom" size={24} />
						{/if}
					</svelte:fragment>
					<Time slot="value" relative timestamp={$statusQuery.data.lastReading.timestamp} />
				</SensorStatusCard>
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

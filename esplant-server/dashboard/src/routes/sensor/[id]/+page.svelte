<script lang="ts">
	import Time from 'svelte-time';
	import IconWifi1 from '@tabler/icons-svelte/dist/svelte/icons/IconWifi1.svelte';
	import IconWifi2 from '@tabler/icons-svelte/dist/svelte/icons/IconWifi2.svelte';
	import IconWifiOff from '@tabler/icons-svelte/dist/svelte/icons/IconWifiOff.svelte';
	import IconDroplet from '@tabler/icons-svelte/dist/svelte/icons/IconDroplet.svelte';
	import IconDropletFilled2 from '@tabler/icons-svelte/dist/svelte/icons/IconDropletFilled2.svelte';
	import IconDropletFilled from '@tabler/icons-svelte/dist/svelte/icons/IconDropletFilled.svelte';
	import IconScubaMask from '@tabler/icons-svelte/dist/svelte/icons/IconScubaMask.svelte';
	import IconGrave from '@tabler/icons-svelte/dist/svelte/icons/IconGrave.svelte';
	import IconClockExclamation from '@tabler/icons-svelte/dist/svelte/icons/IconClockExclamation.svelte';
	import IconClock from '@tabler/icons-svelte/dist/svelte/icons/IconClock.svelte';
	import IconAlertTriangle from '@tabler/icons-svelte/dist/svelte/icons/IconAlertTriangle.svelte';
	import IconBucketDroplet from '@tabler/icons-svelte/dist/svelte/icons/IconBucketDroplet.svelte';
	import IconCalendar from '@tabler/icons-svelte/dist/svelte/icons/IconCalendar.svelte';
	import IconChevronLeft from '@tabler/icons/chevron-left.svg?raw';
	import IconChevronRight from '@tabler/icons/chevron-right.svg?raw';
	import { createQuery } from '@tanstack/svelte-query';
	import { fetchSensorData } from '$lib/api';
	import WaterCapacityGraph from '$lib/components/water-capacity-graph.svelte';
	import Litepicker from '$lib/components/litepicker.svelte';
	import SensorStatusCard from '$lib/components/sensor-status-card.svelte';
	import RssiGraph from '$lib/components/rssi-graph.svelte';
	import { goto } from '$app/navigation';

	export let data;

	const litepickerOptions = {
		singleMode: false,
		buttonText: {
			previousMonth: IconChevronLeft,
			nextMonth: IconChevronRight
		},
		maxDate: new Date(),
		startDate: data.startDate,
		endDate: data.endDate
	};

	function updateDate(startDate: Date, endDate: Date) {
		const query = new URLSearchParams({
			from: startDate.getTime().toString(),
			to: endDate.getTime().toString()
		});
		goto(`?${query.toString()}`);
	}

	function handleDateChange(e: CustomEvent) {
		const newStartDate = e.detail.startDate;
		newStartDate.setHours(0, 0, 0, 0);
		const newEndDate = e.detail.endDate;
		newEndDate.setHours(23, 59, 59, 999);
		updateDate(newStartDate, newEndDate);
	}

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
		queryKey: ['sensor-data', data.id, data.startDate, data.endDate],
		queryFn: () => fetchSensorData(data.id, data.name, data.startDate, data.endDate),
		keepPreviousData: true
	});
</script>

<div class="page-header">
	<div class="container-xl">
		<div class="row row-gap-3 align-items-center">
			<div class="col-12 col-md-auto me-auto">
				<h1 class="page-title">{data.name}</h1>
			</div>

			<div class="col-auto">
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
	</div>
</div>

<div class="page-body">
	<div class="container-xl">
		<div class="row row-decks row-cards">
			{#if $statusQuery.data?.lastReading == undefined}
				<div class="col-6 col-md-3 col-lg-2">
					<SensorStatusCard title="Sensor Health" value="No Data" critical>
						<IconAlertTriangle slot="icon" size={24} />
					</SensorStatusCard>
				</div>
			{:else}
				<div class="col-6 col-md-3 col-lg-2">
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
								<IconScubaMask size={24} />
							{:else if $statusQuery.data.status.wilting}
								<IconGrave size={24} />
							{:else if $statusQuery.data.status.overwatered}
								<IconDropletFilled size={24} />
							{:else if $statusQuery.data.status.underwatered}
								<IconDroplet size={24} />
							{:else}
								<IconDropletFilled2 size={24} />
							{/if}
						</svelte:fragment>
					</SensorStatusCard>
				</div>

				{#if $statusQuery.data.estimatedNextWatering != undefined}
					<div class="col-6 col-md-3 col-lg-2">
						<SensorStatusCard
							title="Next Watering"
							critical={$statusQuery.data.status.waterToday}
							warning={$statusQuery.data.status.waterTomorrow}
						>
							<svelte:fragment slot="icon">
								{#if $statusQuery.data.status.waterToday || $statusQuery.data.status.waterTomorrow}
									<IconClockExclamation size={24} />
								{:else}
									<IconBucketDroplet size={24} />
								{/if}
							</svelte:fragment>
							<Time slot="value" relative timestamp={$statusQuery.data.estimatedNextWatering} />
						</SensorStatusCard>
					</div>
				{/if}

				<div class="col-6 col-md-3 col-lg-2">
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
								<IconWifiOff size={24} />
							{:else if $statusQuery.data.status.lowBattery || $statusQuery.data.status.signalStrength == 'weak'}
								<IconAlertTriangle size={24} />
							{:else if $statusQuery.data.status.signalStrength == 'strong'}
								<IconWifi2 size={24} />
							{:else if $statusQuery.data.status.signalStrength == 'moderate'}
								<IconWifi1 size={24} />
							{/if}
						</svelte:fragment>
					</SensorStatusCard>
				</div>

				<div class="col-6 col-md-3 col-lg-2">
					<SensorStatusCard
						title="Last Update"
						critical={$statusQuery.data.status.signalStrength == 'offline'}
					>
						<svelte:fragment slot="icon">
							{#if $statusQuery.data.status.signalStrength == 'offline'}
								<IconWifiOff size={24} />
							{:else}
								<IconClock size={24} />
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
						</div>
						<div class="graph water-capacity-graph">
							{#if $historyQuery.data != undefined}
								<WaterCapacityGraph sensor={$historyQuery.data} />
							{/if}
						</div>
					</div>
				</section>
			</div>

			<div class="col-12 col-lg-6">
				<section class="card">
					<div class="card-body">
						<div class="d-flex flex-wrap">
							<h1 class="card-title">RSSI History</h1>
						</div>
						<div class="graph">
							{#if $historyQuery.data != undefined}
								<RssiGraph sensor={$historyQuery.data} />
							{/if}
						</div>
					</div>
				</section>
			</div>
		</div>
	</div>
</div>

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

	.water-capacity-graph {
		height: 60vh;
	}
</style>

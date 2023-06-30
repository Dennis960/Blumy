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
	import { fetchSensor, fetchSensorHistory } from '$lib/api.js';
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

	$: sensorQuery = createQuery({
		queryKey: ['sensor', data.id],
		queryFn: () => fetchSensor(data.id)
	});

	$: historyQuery = createQuery({
		queryKey: ['sensor-data', data.id, data.startDate, data.endDate],
		queryFn: () => fetchSensorHistory(data.id, data.startDate, data.endDate),
		keepPreviousData: true
	});

	$: waterToday =
		$sensorQuery.data?.prediction != undefined &&
		$sensorQuery.data.prediction.nextWatering.getTime() <
			new Date().getTime() + 24 * 60 * 60 * 1000;
	$: waterTomorrow =
		$sensorQuery.data?.prediction != undefined &&
		$sensorQuery.data.prediction.nextWatering.getTime() <
			new Date().getTime() + 48 * 60 * 60 * 1000;
</script>

<div class="page-header">
	<div class="container-xl">
		<div class="row row-gap-3 align-items-center">
			<div class="col-12 col-md-auto me-auto">
				<h1 class="page-title">{$sensorQuery.data?.config.name}</h1>
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
			{#if $sensorQuery.data?.lastUpdate == undefined}
				<div class="col-6 col-md-3 col-lg-2">
					<SensorStatusCard title="Sensor Health" value="No Data" critical>
						<IconAlertTriangle slot="icon" size={24} />
					</SensorStatusCard>
				</div>
			{:else}
				<div class="col-6 col-md-3 col-lg-2">
					<SensorStatusCard
						title="Water Capacity"
						value={$sensorQuery.data.plantHealth.drowning
							? '>100%'
							: $sensorQuery.data.plantHealth.wilting
							? '<0%'
							: Math.round($sensorQuery.data.lastUpdate.waterCapacity * 100) + '%'}
						warning={$sensorQuery.data.plantHealth.overwatered ||
							$sensorQuery.data.plantHealth.underwatered}
						critical={$sensorQuery.data.plantHealth.drowning ||
							$sensorQuery.data.plantHealth.wilting}
					>
						<svelte:fragment slot="icon">
							{#if $sensorQuery.data.plantHealth.drowning}
								<IconScubaMask size={24} />
							{:else if $sensorQuery.data.plantHealth.wilting}
								<IconGrave size={24} />
							{:else if $sensorQuery.data.plantHealth.overwatered}
								<IconDropletFilled size={24} />
							{:else if $sensorQuery.data.plantHealth.underwatered}
								<IconDroplet size={24} />
							{:else}
								<IconDropletFilled2 size={24} />
							{/if}
						</svelte:fragment>
					</SensorStatusCard>
				</div>

				{#if $sensorQuery.data.prediction != undefined}
					<div class="col-6 col-md-3 col-lg-2">
						<SensorStatusCard title="Next Watering" critical={waterToday} warning={waterTomorrow}>
							<svelte:fragment slot="icon">
								{#if waterToday || waterTomorrow}
									<IconClockExclamation size={24} />
								{:else}
									<IconBucketDroplet size={24} />
								{/if}
							</svelte:fragment>
							<Time slot="value" relative timestamp={$sensorQuery.data.prediction.nextWatering} />
						</SensorStatusCard>
					</div>
				{/if}

				<div class="col-6 col-md-3 col-lg-2">
					<SensorStatusCard
						title="Sensor Health"
						value={$sensorQuery.data.sensorHealth.signalStrength == 'offline'
							? 'offline'
							: $sensorQuery.data.sensorHealth.lowBattery
							? 'Low Battery'
							: $sensorQuery.data.sensorHealth.signalStrength == 'weak'
							? 'Poor Signal'
							: 'Ok'}
						critical={$sensorQuery.data.sensorHealth.critical}
						warning={$sensorQuery.data.sensorHealth.warning}
					>
						<svelte:fragment slot="icon">
							{#if $sensorQuery.data.sensorHealth.signalStrength == 'offline'}
								<IconWifiOff size={24} />
							{:else if $sensorQuery.data.sensorHealth.lowBattery || $sensorQuery.data.sensorHealth.signalStrength == 'weak'}
								<IconAlertTriangle size={24} />
							{:else if $sensorQuery.data.sensorHealth.signalStrength == 'strong'}
								<IconWifi2 size={24} />
							{:else if $sensorQuery.data.sensorHealth.signalStrength == 'moderate'}
								<IconWifi1 size={24} />
							{/if}
						</svelte:fragment>
					</SensorStatusCard>
				</div>

				<div class="col-6 col-md-3 col-lg-2">
					<SensorStatusCard title="Last Update" critical={$sensorQuery.data.sensorHealth.critical}>
						<svelte:fragment slot="icon">
							{#if $sensorQuery.data.sensorHealth.signalStrength == 'offline'}
								<IconWifiOff size={24} />
							{:else}
								<IconClock size={24} />
							{/if}
						</svelte:fragment>
						<Time slot="value" relative timestamp={$sensorQuery.data.lastUpdate.timestamp} />
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
							{#if $sensorQuery.data != undefined && $historyQuery.data != undefined}
								<WaterCapacityGraph sensor={$sensorQuery.data} history={$historyQuery.data} />
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
								<RssiGraph history={$historyQuery.data} />
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

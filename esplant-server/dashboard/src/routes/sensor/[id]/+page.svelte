<script lang="ts">
	import Time from '$lib/components/time.svelte';
	import {
		IconAlertTriangle,
		IconBucketDroplet,
		IconCalendar,
		IconChevronLeftRaw,
		IconChevronRightRaw,
		IconClock,
		IconClockExclamation,
		IconDroplet,
		IconDropletFilled,
		IconDropletFilled2,
		IconGrave,
		IconScubaMask,
		IconSettings,
		IconWifi1,
		IconWifi2,
		IconWifiOff
	} from '$lib/icons.js';
	import { createQuery } from '@tanstack/svelte-query';
	import { fetchSensor, fetchSensorHistory } from '$lib/api.js';
	import WaterCapacityGraph from '$lib/components/water-capacity-graph.svelte';
	import Litepicker from '$lib/components/litepicker.svelte';
	import SensorStatusCard from '$lib/components/sensor-status-card.svelte';
	import RssiGraph from '$lib/components/rssi-graph.svelte';
	import { goto } from '$app/navigation';
	import NotificationToggle from '$lib/components/notification-toggle.svelte';

	export let data;

	const litepickerOptions = {
		singleMode: false,
		buttonText: {
			previousMonth: IconChevronLeftRaw,
			nextMonth: IconChevronRightRaw
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
		queryFn: () => fetchSensor(data.id),
		refetchInterval: 15 * 60 * 1000
	});

	$: historyQuery = createQuery({
		queryKey: ['sensor-data', data.id, data.startDate, data.endDate],
		queryFn: () => fetchSensorHistory(data.id, data.startDate, data.endDate),
		keepPreviousData: true,
		refetchInterval: 15 * 60 * 1000
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
	<div class="container">
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
			<div class="col-auto">
				<a class="btn" href={`/sensor/${data.id}/settings`}>
					<IconSettings />
					<span class="ms-2">Einstellungen</span>
				</a>
			</div>
		</div>
	</div>
</div>

<div class="page-body">
	<div class="container-xl">
		<div class="row row-decks row-cards">
			{#if $sensorQuery.data?.lastUpdate == undefined}
				<div class="col-6 col-md-3 col-lg-2">
					<SensorStatusCard title="Sensor-Status" value="Keine Daten" critical>
						<IconAlertTriangle slot="icon" size={24} />
					</SensorStatusCard>
				</div>
			{:else}
				<div class="col-6 col-md-3 col-lg-2">
					<SensorStatusCard
						title="Wasserkapazität"
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
						<SensorStatusCard
							title="Nächste Bewässerung"
							critical={waterToday}
							warning={waterTomorrow}
						>
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
						title="Sensor-Status"
						value={$sensorQuery.data.sensorHealth.signalStrength == 'offline'
							? 'Offline'
							: $sensorQuery.data.sensorHealth.lowBattery
							? 'Batterie schwach'
							: $sensorQuery.data.sensorHealth.signalStrength == 'weak'
							? 'Empfang schlecht'
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
					<SensorStatusCard
						title="Letzte Aktualisierung"
						critical={$sensorQuery.data.sensorHealth.critical}
					>
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
					<div class="card-header">
						<h1 class="card-title">Verlauf der Wasserkapazität</h1>
						<div class="card-actions">
							{#if $sensorQuery.data != undefined}
								<NotificationToggle sensor={$sensorQuery.data} />
							{/if}
						</div>
					</div>
					<div class="card-body">
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
							<h1 class="card-title">Signalstärke</h1>
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

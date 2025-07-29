<script lang="ts">
	import {
		IconAlertTriangle,
		IconBattery2,
		IconBattery4,
		IconBatteryCharging2,
		IconBatteryOff,
		IconBucketDroplet,
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
	} from '$lib/icons';
	import { route } from '$lib/ROUTES';
	import type { SensorDTO } from '$lib/types/api';
	import NotificationToggle from './notification-toggle.svelte';
	import SensorImage from './sensor-image.svelte';
	import SensorStatusDatagridItem from './sensor-status-datagrid-item.svelte';
	import Time from './time.svelte';
	import WaterCapacityBar from './water-capacity-bar.svelte';

	interface Props {
		sensor: SensorDTO;
	}

	let { sensor }: Props = $props();

	let waterToday = $derived(
		sensor.prediction != undefined &&
			sensor.prediction.nextWatering.getTime() < new Date().getTime() + 24 * 60 * 60 * 1000
	);
	let waterTomorrow = $derived(
		sensor.prediction != undefined &&
			sensor.prediction.nextWatering.getTime() < new Date().getTime() + 48 * 60 * 60 * 1000
	);
</script>

<section class="card">
	<SensorImage class="img-responsive img-responsive-16x9 card-img-top" {sensor} />
	<div class="card-header">
		<h1 class="card-title">{sensor.config.name}</h1>
	</div>
	<div class="card-body">
		<div class="datagrid">
			{#if sensor?.lastUpdate == undefined}
				<SensorStatusDatagridItem title="Sensor-Status" critical>
					{#snippet icon()}
						<IconAlertTriangle size={20} />
					{/snippet}
					Keine Daten
				</SensorStatusDatagridItem>
			{:else}
				<SensorStatusDatagridItem
					title="Wasserkapazität"
					warning={sensor.plantHealth.overwatered || sensor.plantHealth.underwatered}
					critical={sensor.plantHealth.drowning || sensor.plantHealth.wilting}
				>
					{#snippet icon()}
						{#if sensor.plantHealth.drowning}
							<span title="Pflanze ertrinkt">
								<IconScubaMask size={20} />
							</span>
						{:else if sensor.plantHealth.wilting}
							<span title="Pflanze vertrocknet">
								<IconGrave size={20} />
							</span>
						{:else if sensor.plantHealth.overwatered}
							<span title="Zu viel Wasser">
								<IconDropletFilled size={20} />
							</span>
						{:else if sensor.plantHealth.underwatered}
							<span title="Zu wenig Wasser">
								<IconDroplet size={20} />
							</span>
						{:else}
							<span title="Wasserstand normal">
								<IconDropletFilled2 size={20} />
							</span>
						{/if}
					{/snippet}
					<div class="w-100 me-4">
						<WaterCapacityBar {sensor} />
					</div>
				</SensorStatusDatagridItem>

				{#if sensor.prediction != undefined}
					<SensorStatusDatagridItem
						title="Nächste Bewässerung"
						critical={waterToday}
						warning={waterTomorrow}
					>
						{#snippet icon()}
							{#if waterToday || waterTomorrow}
								<IconClockExclamation size={20} />
							{:else}
								<IconBucketDroplet size={20} />
							{/if}
						{/snippet}
						<Time relative timestamp={sensor.prediction.nextWatering} />
					</SensorStatusDatagridItem>
				{/if}

				<NotificationToggle {sensor} />

				<SensorStatusDatagridItem
					title="Sensor-Status"
					critical={sensor.sensorHealth.critical}
					warning={sensor.sensorHealth.warning}
				>
					{#snippet icon()}
						{#if sensor.sensorHealth.signalStrength == 'offline'}
							<IconWifiOff size={16} />
						{:else if sensor.sensorHealth.battery == 'low' || sensor.sensorHealth.signalStrength == 'weak'}
							<IconAlertTriangle size={16} />
						{:else if sensor.sensorHealth.signalStrength == 'strong'}
							<IconWifi2 size={16} />
						{:else if sensor.sensorHealth.signalStrength == 'moderate'}
							<IconWifi1 size={16} />
						{/if}
					{/snippet}
					{#if sensor.sensorHealth.signalStrength == 'offline'}
						Offline
					{:else if sensor.sensorHealth.battery == 'low'}
						Batterie schwach
					{:else if sensor.sensorHealth.signalStrength == 'weak'}
						Empfang schlecht
					{:else}
						Ok
					{/if}
				</SensorStatusDatagridItem>

				<SensorStatusDatagridItem
					title="Letzte Aktualisierung"
					critical={sensor.sensorHealth.signalStrength == 'offline'}
				>
					{#snippet icon()}
						<IconClock size={20} />
					{/snippet}
					<Time relative timestamp={sensor.lastUpdate.timestamp} />
				</SensorStatusDatagridItem>

				<SensorStatusDatagridItem
					title="Batteriestatus"
					warning={sensor.sensorHealth.battery == 'low'}
					critical={sensor.sensorHealth.battery == 'empty'}
				>
					{#snippet icon()}
						{#if sensor.sensorHealth.battery == 'empty'}
							<IconBatteryOff size={20} />
						{:else if sensor.sensorHealth.battery == 'low'}
							<IconBattery2 size={20} />
						{:else if sensor.sensorHealth.battery == 'usb'}
							<IconBatteryCharging2 size={20} />
						{:else}
							<IconBattery4 size={20} />
						{/if}
					{/snippet}
					{Math.floor(100 * sensor.lastUpdate.batteryCapacity) + '%'}
				</SensorStatusDatagridItem>
			{/if}
		</div>
	</div>
	{#if sensor.canEdit}
		<div class="card-footer">
			<div class="d-flex justify-content-end">
				<a
					class="btn"
					href={route('/dashboard/sensor/[id=sensorId]/settings', { id: sensor.id.toString() })}
				>
					<IconSettings />
					<span class="ms-2">Einstellungen</span>
				</a>
			</div>
		</div>
	{/if}
</section>

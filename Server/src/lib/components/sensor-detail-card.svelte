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
	import type { SensorDTO } from '$lib/types/api';
	import Base64Image from './base64-image.svelte';
	import NotificationToggle from './notification-toggle.svelte';
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
	<Base64Image
		class="img-responsive img-responsive-16x9 card-img-top"
		imageBase64={sensor.config.imageBase64}
	/>
	<div class="card-header">
		<h1 class="card-title">{sensor.config.name}</h1>
	</div>
	<div class="card-body">
		<div class="datagrid">
			{#if sensor?.lastUpdate == undefined}
				<SensorStatusDatagridItem title="Sensor-Status" value="Keine Daten" critical>
					{#snippet icon()}
						<IconAlertTriangle size={20} />
					{/snippet}
				</SensorStatusDatagridItem>
			{:else}
				<SensorStatusDatagridItem
					title="Wasserkapazität"
					value={sensor.plantHealth.drowning
						? '>100%'
						: sensor.plantHealth.wilting
							? '<0%'
							: Math.round(sensor.lastUpdate.waterCapacity * 100) + '%'}
					warning={sensor.plantHealth.overwatered || sensor.plantHealth.underwatered}
					critical={sensor.plantHealth.drowning || sensor.plantHealth.wilting}
				>
					{#snippet icon()}
						{#if sensor.plantHealth.drowning}
							<IconScubaMask size={20} />
						{:else if sensor.plantHealth.wilting}
							<IconGrave size={20} />
						{:else if sensor.plantHealth.overwatered}
							<IconDropletFilled size={20} />
						{:else if sensor.plantHealth.underwatered}
							<IconDroplet size={20} />
						{:else}
							<IconDropletFilled2 size={20} />
						{/if}
					{/snippet}

					<!-- @migration-task: migrate this slot by hand, `value` would shadow a prop on the parent component -->
					<div slot="value" class="me-4 w-100">
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
						{#snippet value()}
							<Time relative timestamp={sensor.prediction.nextWatering} />
						{/snippet}
					</SensorStatusDatagridItem>
				{/if}

				<NotificationToggle {sensor} />

				<SensorStatusDatagridItem
					title="Sensor-Status"
					value={sensor.sensorHealth.signalStrength == 'offline'
						? 'Offline'
						: sensor.sensorHealth.battery == 'low'
							? 'Batterie schwach'
							: sensor.sensorHealth.signalStrength == 'weak'
								? 'Empfang schlecht'
								: 'Ok'}
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
				</SensorStatusDatagridItem>

				<SensorStatusDatagridItem
					title="Letzte Aktualisierung"
					critical={sensor.sensorHealth.signalStrength == 'offline'}
				>
					{#snippet icon()}
						<IconClock size={20} />
					{/snippet}
					{#snippet value()}
						<Time relative timestamp={sensor.lastUpdate.timestamp} />
					{/snippet}
				</SensorStatusDatagridItem>

				<SensorStatusDatagridItem
					title="Batteriestatus"
					value={Math.floor(100 * sensor.lastUpdate.batteryCapacity) + '%'}
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
				</SensorStatusDatagridItem>
			{/if}
		</div>
	</div>
	<div class="card-footer">
		<div class="d-flex justify-content-end">
			<a class="btn" href={`/sensor/${sensor.id}/settings`}>
				<IconSettings />
				<span class="ms-2">Einstellungen</span>
			</a>
		</div>
	</div>
</section>

<script lang="ts">
	import { base } from '$app/paths';
	import {
		IconSettings,
		IconAlertTriangle,
		IconScubaMask,
		IconGrave,
		IconDropletFilled,
		IconDroplet,
		IconDropletFilled2,
		IconClockExclamation,
		IconBucketDroplet,
		IconWifiOff,
		IconWifi2,
		IconWifi1,
		IconClock,
		IconBatteryOff,
		IconBattery2,
		IconBattery4,
		IconBatteryCharging2
	} from '$lib/icons';
	import type { SensorDTO } from '$lib/types/api';
	import NotificationToggle from './notification-toggle.svelte';
	import SensorStatusDatagridItem from './sensor-status-datagrid-item.svelte';
	import Time from './time.svelte';
	import WaterCapacityBar from './water-capacity-bar.svelte';

	export let sensor: SensorDTO;

	$: waterToday =
		sensor.prediction != undefined &&
		sensor.prediction.nextWatering.getTime() < new Date().getTime() + 24 * 60 * 60 * 1000;
	$: waterTomorrow =
		sensor.prediction != undefined &&
		sensor.prediction.nextWatering.getTime() < new Date().getTime() + 48 * 60 * 60 * 1000;
</script>

<section class="card">
	<span
		style="background-image: url({sensor.config.imageUrl})"
		class="img-responsive img-responsive-16x9 card-img-top"
	/>
	<div class="card-header">
		<h1 class="card-title">{sensor.config.name}</h1>
	</div>
	<div class="card-body">
		<div class="datagrid">
			{#if sensor?.lastUpdate == undefined}
				<SensorStatusDatagridItem title="Sensor-Status" value="Keine Daten" critical>
					<IconAlertTriangle slot="icon" size={20} />
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
					<svelte:fragment slot="icon">
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
					</svelte:fragment>

					<div slot="value" class="w-100 me-4">
						<WaterCapacityBar {sensor} />
					</div>
				</SensorStatusDatagridItem>

				{#if sensor.prediction != undefined}
					<SensorStatusDatagridItem
						title="Nächste Bewässerung"
						critical={waterToday}
						warning={waterTomorrow}
					>
						<svelte:fragment slot="icon">
							{#if waterToday || waterTomorrow}
								<IconClockExclamation size={20} />
							{:else}
								<IconBucketDroplet size={20} />
							{/if}
						</svelte:fragment>
						<Time slot="value" relative timestamp={sensor.prediction.nextWatering} />
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
					<svelte:fragment slot="icon">
						{#if sensor.sensorHealth.signalStrength == 'offline'}
							<IconWifiOff size={16} />
						{:else if sensor.sensorHealth.battery == 'low' || sensor.sensorHealth.signalStrength == 'weak'}
							<IconAlertTriangle size={16} />
						{:else if sensor.sensorHealth.signalStrength == 'strong'}
							<IconWifi2 size={16} />
						{:else if sensor.sensorHealth.signalStrength == 'moderate'}
							<IconWifi1 size={16} />
						{/if}
					</svelte:fragment>
				</SensorStatusDatagridItem>

				<SensorStatusDatagridItem
					title="Letzte Aktualisierung"
					critical={sensor.sensorHealth.signalStrength == 'offline'}
				>
					<svelte:fragment slot="icon">
						<IconClock size={20} />
					</svelte:fragment>
					<Time slot="value" relative timestamp={sensor.lastUpdate.timestamp} />
				</SensorStatusDatagridItem>

				<SensorStatusDatagridItem
					title="Batteriestatus"
					value={Math.floor(100 * sensor.lastUpdate.batteryCapacity) + '%'}
					warning={sensor.sensorHealth.battery == 'low'}
					critical={sensor.sensorHealth.battery == 'empty'}
				>
					<svelte:fragment slot="icon">
						{#if sensor.sensorHealth.battery == 'empty'}
							<IconBatteryOff size={20} />
						{:else if sensor.sensorHealth.battery == 'low'}
							<IconBattery2 size={20} />
						{:else if sensor.sensorHealth.battery == 'usb'}
							<IconBatteryCharging2 size={20} />
						{:else}
							<IconBattery4 size={20} />
						{/if}
					</svelte:fragment>
				</SensorStatusDatagridItem>
			{/if}
		</div>
	</div>
	<div class="card-footer">
		<div class="d-flex justify-content-end">
			<a class="btn" href={`${base}/sensor/${sensor.id}/settings`}>
				<IconSettings />
				<span class="ms-2">Einstellungen</span>
			</a>
		</div>
	</div>
</section>

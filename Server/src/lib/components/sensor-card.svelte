<script lang="ts">
	import Time from '$lib/components/time.svelte';
	import {
		IconAlertTriangle,
		IconBatteryOff,
		IconClockExclamation,
		IconDroplet,
		IconDropletFilled,
		IconGrave,
		IconScubaMask,
		IconWifiOff
	} from '$lib/icons';
	import type { SensorDTO } from '$lib/types/api';
	import type { Snippet } from 'svelte';
	import SensorImage from './sensor-image.svelte';
	import WaterCapacityBar from './water-capacity-bar.svelte';

	interface Props {
		sensor: SensorDTO;
		href?: string;
		children?: Snippet;
	}

	let { sensor, href, children }: Props = $props();

	let waterToday = $derived(
		sensor.prediction != undefined &&
			(sensor.prediction.nextWatering <= new Date() ||
				sensor.prediction.nextWatering.toLocaleDateString() == new Date().toLocaleDateString())
	);
	let waterTomorrow = $derived(
		sensor.prediction != undefined &&
			sensor.prediction.nextWatering.toLocaleDateString() ==
				new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString()
	);
</script>

<a {href} class="card d-flex flex-column cursor-pointer">
	<div class="row row-0 h-100">
		<div class="col-4">
			<SensorImage class="ratio ratio-1x1 d-block rounded-start-1 h-100 w-100 bg-cover" {sensor} />
		</div>
		<div class="col-8">
			<div class="card-body d-flex flex-column h-100">
				<div class="row">
					<div class="col me-auto">
						<h1 class="card-title text-truncate mb-2 text-nowrap">
							<span>{sensor.config.name}</span>
						</h1>
					</div>
					<div
						class="col-auto {waterToday ||
						sensor.plantHealth.critical ||
						sensor.sensorHealth.critical
							? 'text-danger'
							: ''} {waterTomorrow || sensor.plantHealth.warning || sensor.sensorHealth.warning
							? 'text-warning'
							: ''}"
					>
						{#if waterToday || waterTomorrow}
							<span title="Baldige Bewässerung erforderlich">
								<IconClockExclamation size={16} />
							</span>
						{:else if sensor.plantHealth.drowning}
							<span title="Pflanze ertrinkt">
								<IconScubaMask size={16} />
							</span>
						{:else if sensor.plantHealth.wilting}
							<span title="Pflanze vertrocknet">
								<IconGrave size={16} />
							</span>
						{:else if sensor.plantHealth.overwatered}
							<span title="Zu viel Wasser">
								<IconDropletFilled size={16} />
							</span>
						{:else if sensor.plantHealth.underwatered}
							<span title="Zu wenig Wasser">
								<IconDroplet size={16} />
							</span>
						{:else if sensor.sensorHealth.signalStrength == 'offline'}
							<span title="Sensor offline">
								<IconWifiOff size={16} />
							</span>
						{:else if sensor.sensorHealth.battery == 'empty'}
							<span title="Batterie leer">
								<IconBatteryOff size={16} />
							</span>
						{:else if sensor.sensorHealth.battery == 'low'}
							<span title="Warnung: Schwache Batterie">
								<IconAlertTriangle size={16} />
							</span>
						{:else if sensor.sensorHealth.signalStrength == 'weak'}
							<span title="Warnung: Schwaches Signal">
								<IconAlertTriangle size={16} />
							</span>
						{/if}
					</div>
				</div>
				{#if sensor.prediction != undefined}
					<div class="datagrid mb-2">
						<div class="datagrid-item">
							<div class="datagrid-title mb-0">Nächste Bewässerung</div>
							<div
								class="datagrid-content {waterToday ? 'text-danger' : ''} {waterTomorrow
									? 'text-warning'
									: ''}"
							>
								<Time relative timestamp={sensor.prediction.nextWatering} />
							</div>
						</div>
					</div>
				{/if}
				<div class="mt-auto">
					<WaterCapacityBar {sensor} />
				</div>
				{@render children?.()}
			</div>
		</div>
	</div>
</a>

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
	import Base64Image from './base64-image.svelte';
	import WaterCapacityBar from './water-capacity-bar.svelte';

	interface Props {
		sensor: SensorDTO;
		onclick?: () => void;
	}

	let { sensor, onclick }: Props = $props();

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

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<section {onclick} class="card d-flex flex-column cursor-pointer">
	<div class="row row-0 h-100">
		<div class="col-4">
			<Base64Image
				class="ratio ratio-1x1 d-block rounded-start-1 h-100 w-100 bg-cover"
				imageBase64={sensor.config.imageBase64}
			/>
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
							<IconClockExclamation size={16} />
						{:else if sensor.plantHealth.drowning}
							<IconScubaMask size={16} />
						{:else if sensor.plantHealth.wilting}
							<IconGrave size={16} />
						{:else if sensor.plantHealth.overwatered}
							<IconDropletFilled size={16} />
						{:else if sensor.plantHealth.underwatered}
							<IconDroplet size={16} />
						{:else if sensor.sensorHealth.signalStrength == 'offline'}
							<IconWifiOff size={16} />
						{:else if sensor.sensorHealth.battery == 'empty'}
							<IconBatteryOff size={16} />
						{:else if sensor.sensorHealth.battery == 'low' || sensor.sensorHealth.signalStrength == 'weak'}
							<IconAlertTriangle size={16} />
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
			</div>
		</div>
	</div>
</section>

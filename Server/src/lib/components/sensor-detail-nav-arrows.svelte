<script lang="ts">
	import { goto } from '$app/navigation';
	import { SensorStorage } from '$lib/client/sensor-storage.js';
	import { route } from '$lib/ROUTES.js';
	import type { SensorDTO } from '$lib/types/api';
	import { default as LeftArrow } from '@tabler/icons-svelte/icons/arrow-left';
	import { default as RightArrow } from '@tabler/icons-svelte/icons/arrow-right';
	import { onMount } from 'svelte';

	let {
		sensors,
		currentSensor
	}: {
		sensors: SensorDTO[];
		currentSensor: SensorDTO;
	} = $props();

	let storedSensors: SensorDTO[] = $state([]);

	/**
	 * List of sensors that the current user does not own but has access to.
	 */
	let sharedSensors = $derived(
		storedSensors.filter((sensor) => !sensors.some((s) => s.id === sensor.id))
	);

	let allSensors = $derived(
		sensors
			.map((sensor) => ({
				id: sensor.id,
				accessThroughReadToken: false,
				readToken: sensor.readToken
			}))
			.concat(
				sharedSensors.map((sensor) => ({
					id: sensor.id,
					accessThroughReadToken: true,
					readToken: sensor.readToken
				}))
			)
	);

	let currentSensorIndex = $derived(
		allSensors.findIndex((sensor) => sensor.id === currentSensor.id)
	);

	let nextSensor = $derived.by(() => {
		const nextSensorIndex = currentSensorIndex + 1;
		if (nextSensorIndex < 0 || nextSensorIndex >= allSensors.length) {
			return allSensors[0];
		}
		return allSensors[nextSensorIndex];
	});
	let previousSensor = $derived.by(() => {
		const previousSensorIndex = currentSensorIndex - 1;
		if (previousSensorIndex < 0 || previousSensorIndex >= allSensors.length) {
			return allSensors[allSensors.length - 1];
		}
		return allSensors[previousSensorIndex];
	});

	async function navigatToSensor(sensor: {
		id: number;
		accessThroughReadToken: boolean;
		readToken: string;
	}) {
		if (sensor.accessThroughReadToken) {
			await goto(
				route('/dashboard/sensor/[id=sensorId]', { id: sensor.id.toString() }) +
					`?token=${sensor.readToken}`
			);
		} else {
			await goto(route('/dashboard/sensor/[id=sensorId]', { id: sensor.id.toString() }));
		}
	}

	onMount(() => {
		SensorStorage.loadStoredSensors().then((sensors) => {
			storedSensors = sensors;
		});
	});
</script>

<div class="row justify-content-between mb-3">
	<div class="col-auto">
		<button class="btn btn-icon" onclick={() => navigatToSensor(previousSensor)}>
			<LeftArrow />
		</button>
	</div>
	<div class="col-auto">
		<button class="btn btn-icon" onclick={() => navigatToSensor(nextSensor)}>
			<RightArrow />
		</button>
	</div>
</div>

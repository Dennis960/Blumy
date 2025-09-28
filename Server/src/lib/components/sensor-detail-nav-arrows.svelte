<script lang="ts">
	import { browser } from '$app/environment';
	import { goto, preloadData } from '$app/navigation';
	import { SensorStorage } from '$lib/client/sensor-storage.js';
	import { SwipeListener as TouchGestureListener } from '$lib/client/touch-gesture-listener';
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

	let allSensors = $derived(sensors.concat(sharedSensors));

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

	function getSensorRoute(sensor: SensorDTO): string {
		if (!sensor.isCurrentUserOwner) {
			return (
				route('/dashboard/sensor/[id=sensorId]', { id: sensor.id.toString() }) +
				`?token=${sensor.sensorToken}`
			);
		}
		return route('/dashboard/sensor/[id=sensorId]', { id: sensor.id.toString() });
	}

	async function navigateToSensor(sensor: SensorDTO) {
		await goto(getSensorRoute(sensor), {
			noScroll: true
		});
	}

	async function navigateToNextSensor() {
		await navigateToSensor(nextSensor);
	}

	async function navigateToPreviousSensor() {
		await navigateToSensor(previousSensor);
	}

	function preloadPreviousSensor() {
		const previousSensorRoute = getSensorRoute(previousSensor);
		preloadData(previousSensorRoute);
	}

	function preloadNextSensor() {
		const nextSensorRoute = getSensorRoute(nextSensor);
		preloadData(nextSensorRoute);
	}

	onMount(() => {
		if (!browser) return;
		SensorStorage.loadStoredSensors().then((sensors) => {
			storedSensors = sensors;
		});
		const swipeListener = new TouchGestureListener();
		swipeListener.addEventListener('swipeleft', navigateToNextSensor);
		swipeListener.addEventListener('swiperight', navigateToPreviousSensor);
		swipeListener.addEventListener('swipeleftstart', preloadNextSensor);
		swipeListener.addEventListener('swiperightstart', preloadPreviousSensor);
		return () => {
			swipeListener.removeEventListener('swipeleft', navigateToNextSensor);
			swipeListener.removeEventListener('swiperight', navigateToPreviousSensor);
			swipeListener.removeEventListener('swipeleftstart', preloadNextSensor);
			swipeListener.removeEventListener('swiperightstart', preloadPreviousSensor);
		};
	});
</script>

<div class="row justify-content-between mb-3">
	<div class="col-auto">
		<button class="btn btn-icon" onclick={() => navigateToSensor(previousSensor)}>
			<LeftArrow />
		</button>
	</div>
	<div class="col-auto">
		<button class="btn btn-icon" onclick={() => navigateToSensor(nextSensor)}>
			<RightArrow />
		</button>
	</div>
</div>

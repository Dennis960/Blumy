<script lang="ts">
	import {
		checkSubscription,
		fetchPublicVapidKey,
		submitSubscription,
		submitUnsubscription
	} from '$lib/api';
	import type { SensorDTO } from '$lib/types/api';
	import { onMount } from 'svelte';

	export let sensor: SensorDTO;

	let subscription: PushSubscription | null;
	let subscribed: boolean = false;

	onMount(async () => {
		const sw = await navigator.serviceWorker.ready;
		subscription = await sw.pushManager.getSubscription();
		if (subscription == null) {
			const key = await fetchPublicVapidKey();
			subscription = await sw.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: key
			});
		} else {
			subscribed = await checkSubscription(sensor.id, subscription);
		}
	});

	async function handleToggleNotifications() {
		if (subscription == null) {
			return;
		}
		if (subscribed) {
			await submitUnsubscription(sensor.id, subscription);
			subscribed = false;
		} else {
			await submitSubscription(sensor.id, subscription);
			subscribed = true;
		}
	}
</script>

<label class="form-check form-switch">
	<input
		class="form-check-input"
		type="checkbox"
		checked={subscribed}
		on:input={handleToggleNotifications}
	/>
	<span class="form-check-label">Push Notifications</span>
</label>

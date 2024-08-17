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

<div class="datagrid-item">
	<label for="push-switch" class="datagrid-title">Push-Benachrichtigungen</label>
	<div class="datagrid-content">
		<div class="form-check form-switch">
			<input
				class="form-check-input"
				type="checkbox"
				id="push-switch"
				checked={subscribed}
				on:input={handleToggleNotifications}
			/>
			<span>{subscribed ? 'Aktiviert' : 'Deaktiviert'}</span>
		</div>
	</div>
</div>

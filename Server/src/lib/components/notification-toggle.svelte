<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { clientApi } from '$lib/client/api';
	import type { SensorDTO } from '$lib/types/api';
	import { onMount } from 'svelte';

	interface Props {
		sensor: SensorDTO;
	}

	let { sensor }: Props = $props();

	let subscription: PushSubscription | null;
	let subscribed: boolean = $state(false);

	onMount(async () => {
		const sw = await navigator.serviceWorker.ready;
		subscription = await sw.pushManager.getSubscription();
		if (subscription == null) {
			const key = env.PUBLIC_VAPID_KEY;
			subscription = await sw.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: key
			});
		} else {
			subscribed = await clientApi()
				.sensors()
				.withId(sensor.id, sensor.readToken)
				.checkSubscription(subscription)
				.parse();
		}
	});

	async function handleToggleNotifications() {
		if (subscription == null) {
			return;
		}
		if (subscribed) {
			if (
				await clientApi()
					.sensors()
					.withId(sensor.id, sensor.readToken)
					.submitUnsubscription(subscription)
					.parse()
			) {
				subscribed = false;
			}
		} else {
			if (
				await clientApi()
					.sensors()
					.withId(sensor.id, sensor.readToken)
					.submitSubscription(subscription)
					.parse()
			) {
				subscribed = true;
			}
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
				oninput={handleToggleNotifications}
			/>
			<span>{subscribed ? 'Aktiviert' : 'Deaktiviert'}</span>
		</div>
	</div>
</div>

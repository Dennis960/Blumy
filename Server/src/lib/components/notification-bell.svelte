<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { clientApi } from '$lib/client/api';
	import { IconBellOff, IconBellRinging } from '$lib/icons';
	import type { SensorDTO } from '$lib/types/api';

	interface Props {
		sensor: SensorDTO;
	}

	let { sensor }: Props = $props();

	let subscription: PushSubscription | null = $state(null);
	let checkingSubscription: boolean = $state(true);
	let subscribed: boolean = $state(false);

	$effect(() => {
		sensor;
		(async () => {
			checkingSubscription = true;
			const sw = await navigator.serviceWorker.ready;
			try {
				subscription = await sw.pushManager.getSubscription();
			} catch (err) {
				subscription = null;
			}

			if (subscription == null) {
				const key = env.PUBLIC_VAPID_KEY;
				try {
					subscription = await sw.pushManager.subscribe({
						userVisibleOnly: true,
						applicationServerKey: key
					});
				} catch (err) {
					// user denied or browser blocked subscription
					subscription = null;
				}
			}

			if (subscription != null) {
				try {
					subscribed = await clientApi()
						.sensors()
						.withId(sensor.id, sensor.sensorToken)
						.checkSubscription(subscription)
						.parse();
				} catch (err) {
					subscribed = false;
				}
			} else {
				subscribed = false;
			}
			checkingSubscription = false;
		})();
	});

	async function toggleSubscription(e: Event) {
		e.stopPropagation();
		e.preventDefault();
		if (subscription == null) return;
		checkingSubscription = true;
		if (subscribed) {
			if (
				await clientApi()
					.sensors()
					.withId(sensor.id, sensor.sensorToken)
					.submitUnsubscription(subscription)
					.parse()
			) {
				subscribed = false;
			}
		} else {
			if (
				await clientApi()
					.sensors()
					.withId(sensor.id, sensor.sensorToken)
					.submitSubscription(subscription)
					.parse()
			) {
				subscribed = true;
			}
		}
		checkingSubscription = false;
	}
</script>

<button
    class="btn bg-white border-0 p-1 text-reset"
	onclick={toggleSubscription}
	aria-pressed={subscribed}
	title={subscribed ? 'Benachrichtigungen deaktivieren' : 'Benachrichtigungen aktivieren'}
	disabled={checkingSubscription}
>
	{#if subscribed}
		<IconBellRinging />
	{:else}
		<IconBellOff />
	{/if}
</button>

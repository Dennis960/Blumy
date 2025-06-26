<script lang="ts">
	import { run } from 'svelte/legacy';

	import dayjs from 'dayjs';
	import 'dayjs/locale/de';
	import relativeTime from 'dayjs/plugin/relativeTime.js';
	import { onMount } from 'svelte';

	dayjs.extend(relativeTime);
	dayjs.locale('de');

	interface Props {
		timestamp?: Date | string;
		relative?: boolean;
		[key: string]: any;
	}

	let { timestamp = new Date(), relative = false, ...rest }: Props = $props();

	let parsed = dayjs(timestamp);
	let isValid = parsed.isValid();
	let formatted = $state('');
	let title: string | undefined = $state();
	let interval: NodeJS.Timeout;

	onMount(() => {
		if (!isValid) return;

		if (relative) {
			interval = setInterval(() => {
				formatted = parsed.from(undefined);
			}, 60 * 1000);
		}

		return () => clearInterval(interval);
	});

	run(() => {
		if (isValid) {
			formatted = relative ? parsed.from(undefined) : parsed.format();
			title = relative ? parsed.format() : undefined;
		}
	});
</script>

{#if isValid}
	<time {...rest} {title} datetime={parsed.toISOString()}>
		{formatted}
	</time>
{:else}
	<span style="color: red; font-weight: bold;">
		⚠️ Invalid timestamp: "{timestamp}"
	</span>
{/if}

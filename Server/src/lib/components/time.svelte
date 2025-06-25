<script lang="ts">
	import dayjs from 'dayjs';
	import 'dayjs/locale/de';
	import relativeTime from 'dayjs/plugin/relativeTime.js';
	import { onMount } from 'svelte';

	dayjs.extend(relativeTime);
	dayjs.locale('de');

	export let timestamp: Date | string = new Date();
	export let relative = false;

	let parsed = dayjs(timestamp);
	let isValid = parsed.isValid();
	let formatted = '';
	let title: string | undefined;
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

	$: if (isValid) {
		formatted = relative ? parsed.from(undefined) : parsed.format();
		title = relative ? parsed.format() : undefined;
	}
</script>

{#if isValid}
	<time {...$$restProps} {title} datetime={parsed.toISOString()}>
		{formatted}
	</time>
{:else}
	<span style="color: red; font-weight: bold;">
		⚠️ Invalid timestamp: "{timestamp}"
	</span>
{/if}

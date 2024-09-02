<script lang="ts">
	import dayjs from 'dayjs';
	import 'dayjs/locale/de';
	import relativeTime from 'dayjs/plugin/relativeTime.js';
	import { onMount } from 'svelte';

	dayjs.extend(relativeTime);
	dayjs.locale('de');

	export let timestamp: Date = new Date();
	export let relative = false;

	// eslint-disable-next-line no-undef
	let interval: NodeJS.Timeout;

	onMount(() => {
		if (relative) {
			interval = setInterval(() => {
				formatted = dayjs(timestamp).from(undefined);
			}, 60 * 1000);
		}

		return () => clearInterval(interval);
	});

	$: formatted = relative ? dayjs(timestamp).from(undefined) : dayjs(timestamp).format();
	$: title = relative ? dayjs(timestamp).format() : undefined;
</script>

<time {...$$restProps} {title} datetime={timestamp.toISOString()}>
	{formatted}
</time>

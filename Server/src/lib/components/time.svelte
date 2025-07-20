<script lang="ts">
	import dayjs from 'dayjs';
	import 'dayjs/locale/de';
	import relativeTime from 'dayjs/plugin/relativeTime.js';
	import { onMount } from 'svelte';

	dayjs.extend(relativeTime);
	dayjs.locale('de');

	interface Props {
		timestamp: Date | string;
		relative?: boolean;
	}

	let { timestamp = new Date(), relative = false, ...rest }: Props = $props();

	let parsed = $derived(dayjs(timestamp));
	let formatted = $derived(relative ? parsed.from(undefined) : parsed.format());
	let title: string | undefined = $derived(relative ? parsed.format() : undefined);
	let interval: NodeJS.Timeout;
	let dateISOString: string = $derived.by(() => {
		try {
			return parsed.toISOString();
		} catch (e) {
			return '';
		}
	});

	onMount(() => {
		if (relative) {
			interval = setInterval(() => {
				formatted = parsed.from(undefined);
			}, 60 * 1000);
		}

		return () => clearInterval(interval);
	});
</script>

<time {...rest} {title} datetime={dateISOString}>
	{formatted}
</time>

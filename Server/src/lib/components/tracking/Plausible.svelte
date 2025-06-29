<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { env } from '$env/dynamic/public';

	interface Props {
		enabled?: boolean;
	}

	let { enabled = true }: Props = $props();
</script>

<svelte:head>
	{#if browser && env.PUBLIC_MODE === 'production' && enabled}
		<script
			defer
			data-domain={page.url.host}
			src="https://plausible.paramecad.com/js/script.tagged-events.js"
		></script>
		<script>
			window.plausible =
				window.plausible ||
				function () {
					(window.plausible.q = window.plausible.q || []).push(arguments);
				};
		</script>
	{/if}
</svelte:head>

<script>
	// TODO remove all vendors except litepicker
	import '@tabler/core/dist/css/tabler-vendors.css';
	import '@tabler/core/dist/css/tabler.css';
	import { onMount } from 'svelte';

	onMount(async () => {
		// @ts-expect-error no declaration file
		await import('@tabler/core/dist/js/tabler.js');
	});
</script>

<slot />

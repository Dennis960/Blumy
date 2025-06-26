<script lang="ts">
	// TODO remove all vendors except litepicker
	import AuthenticateModal from '$lib/components/modals/AuthenticateModal.svelte';
	import '@tabler/core/dist/css/tabler-vendors.css';
	import '@tabler/core/dist/css/tabler.css';
	import 'nouislider/dist/nouislider.css';
	import { onMount } from 'svelte';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	onMount(async () => {
		// @ts-expect-error no declaration file
		await import('@tabler/core/dist/js/tabler.js');
	});
</script>

<AuthenticateModal />
{@render children?.()}

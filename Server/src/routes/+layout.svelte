<script lang="ts">
	import 'nouislider/dist/nouislider.css';
	// nouislider Needs to be imported first
	import AuthenticateModal from '$lib/components/modals/AuthenticateModal.svelte';
	import Plausible from '$lib/components/tracking/Plausible.svelte';
	// TODO remove all vendors except litepicker
	import '@tabler/core/dist/css/tabler-vendors.css';
	import '@tabler/core/dist/css/tabler.css';
	// @ts-expect-error no declaration file
	import { pwaInfo } from 'virtual:pwa-info';

	let webManifestLink = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');
	let { children } = $props();
</script>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html webManifestLink}
	<link rel="manifest" href="/manifest.json" />
	<meta name="theme-color" content="#2E7D32" />
</svelte:head>

<Plausible enabled={true} />
<AuthenticateModal />

{@render children()}

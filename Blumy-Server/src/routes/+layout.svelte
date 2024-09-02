<script>
	// TODO remove all vendors except litepicker
	import { page } from '$app/stores';
	import '@tabler/core/dist/css/tabler-vendors.css';
	import '@tabler/core/dist/css/tabler.css';
	import { onMount } from 'svelte';
	// @ts-expect-error no declaration file
	import { pwaInfo } from 'virtual:pwa-info';
	import { PUBLIC_MODE } from '$env/static/public';

	export let data;

	onMount(async () => {
		// @ts-expect-error no declaration file
		await import('@tabler/core/dist/js/tabler.js');
	});

	$: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : '';
</script>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html webManifestLink}
</svelte:head>

<div class="page">
	<header class="navbar navbar-expand-sm d-print-none">
		<div class="container-xl">
			<button
				class="navbar-toggler"
				type="button"
				data-bs-toggle="collapse"
				data-bs-target="#navbarNav"
				aria-controls="navbarNav"
				aria-expanded="false"
				aria-label="Toggle navigation"
			>
				<span class="navbar-toggler-icon" />
			</button>
			<a class="navbar-brand ms-2 ms-lg-0 me-auto" href={$page.url.origin}
				>Blumy Dashboard{PUBLIC_MODE === 'test' ? ' - Test' : ''}</a
			>
			<div class="collapse navbar-collapse" id="navbarNav">
				<ul class="navbar-nav">
					<li class="nav-item">
						<a class="nav-link {$page.url.pathname == `/` ? 'active' : ''}" href={$page.url.origin}>
							Sensoren
						</a>
					</li>
				</ul>
			</div>
			{#if data.authenticated}
				<div class="collapse navbar-collapse" id="navbarNav">
					<ul class="navbar-nav">
						<li class="nav-item">
							<form method="POST" action="/auth?/logout">
								<button class="nav-link" data-testid="logout-button">Log out</button>
							</form>
						</li>
					</ul>
				</div>
			{/if}
		</div>
	</header>
	<div class="page-wrapper">
		<slot />
	</div>
</div>

<script>
	import '@tabler/core/dist/css/tabler.css';
	import '@tabler/core/dist/css/tabler-vendors.css'; // TODO remove all vendors except litepicker
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	onMount(async () => {
		// @ts-ignore
		await import('@tabler/core/dist/js/tabler.js');
	});

	export let data;
</script>

<QueryClientProvider client={data.queryClient}>
	<div class="page">
		<header class="navbar navbar-expand-sm navbar-light d-print-none">
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
				<a class="navbar-brand ms-2 ms-lg-0 me-auto" href="/">
					PlantFi Dashboard
				</a>
				<div class="collapse navbar-collapse" id="navbarNav">
					<ul class="navbar-nav">
						<li class="nav-item">
							<a class="nav-link {$page.url.pathname == '/' ? 'active' : ''}" href="/">Sensors</a>
						</li>
					</ul>
				</div>
			</div>
		</header>
		<div class="page-wrapper">
			<div class="page-body">
				<div class="container-xl">
					<slot />
				</div>
			</div>
		</div>
	</div>
</QueryClientProvider>

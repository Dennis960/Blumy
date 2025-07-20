<script lang="ts">
	import { route } from '$lib/ROUTES';

	const tutorialPages = [
		{ name: 'Erste Schritte', href: route('/tutorials/getting-started') },
		{ name: 'Home Assistant', href: route('/tutorials/home-assistant') },
		{ name: 'Mehrere Sensoren einrichten', href: route('/tutorials/multiconfiguration') }
	];

	let { children } = $props();
</script>

<div class="page">
	<div class="page-wrapper">
		<nav class="navbar navbar-expand-lg">
			<div class="container-fluid">
				<a class="navbar-brand" href={route('/tutorials/getting-started')}>Tutorials</a>
				<ul class="navbar-nav flex-row">
					{#each tutorialPages as page}
						<li class="nav-item mx-2">
							<a class="nav-link" href={page.href}>
								<span class="nav-link-title">{page.name}</span>
							</a>
						</li>
					{/each}
				</ul>
			</div>
		</nav>
		<main class="page-body">
			{@render children()}
		</main>
	</div>
</div>

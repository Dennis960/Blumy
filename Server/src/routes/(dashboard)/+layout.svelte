<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	// TODO remove all vendors except litepicker
	import { page } from '$app/stores';
	import { env } from '$env/dynamic/public';
	import { clientApi } from '$lib/client/api.js';
	import LoginButtonGoogle from '$lib/components/LoginButtonGoogle.svelte';
	import { authenticationModalStore } from '$lib/components/modals/AuthenticateModal.svelte';
	// @ts-expect-error no declaration file
	import { pwaInfo } from 'virtual:pwa-info';

	let { data, children } = $props();

	let webManifestLink = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');

	async function logout() {
		await clientApi(fetch).auth().logout().response();
		await invalidateAll();
	}

	function login() {
		authenticationModalStore.set({
			authenticationType: 'login'
		});
	}

	function register() {
		authenticationModalStore.set({
			authenticationType: 'register'
		});
	}
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
				<span class="navbar-toggler-icon"></span>
			</button>
			<a class="navbar-brand ms-lg-0 me-auto ms-2" href={$page.url.origin}
				>Blumy Dashboard{env.PUBLIC_MODE === 'test' ? ' - Test' : ''}</a
			>
			<div class="navbar-collapse collapse" id="navbarNav">
				<ul class="navbar-nav">
					<li class="nav-item">
						<a class="nav-link {$page.url.pathname == `/` ? 'active' : ''}" href={$page.url.origin}>
							Sensoren
						</a>
					</li>
					{#if !data.authenticated}
						<li class="nav-item">
							<button
								type="button"
								class="nav-link btn btn-link p-0"
								onclick={login}
								data-testid="nav-bar-login"
								data-bs-toggle="modal"
								data-bs-target="#authentication-modal"
							>
								Login
							</button>
						</li>
						<li class="nav-item ms-2">
							<button
								type="button"
								class="nav-link btn btn-link p-0"
								onclick={register}
								data-testid="nav-bar-register"
								data-bs-toggle="modal"
								data-bs-target="#authentication-modal"
							>
								Register
							</button>
						</li>
						<li class="nav-item ms-2">
							<LoginButtonGoogle />
						</li>
					{:else}
						<li class="nav-item">
							<div class="dropdown">
								<a
									href="#"
									class="nav-link dropdown-toggle cursor-pointer"
									id="navbarAccountDropdown"
									role="button"
									data-bs-toggle="dropdown"
									aria-expanded="false"
									data-testid="nav-bar-account"
								>
									<div>Account</div>
								</a>
								<div class="dropdown-menu" aria-labelledby="navbarAccountDropdown">
									<a class="dropdown-item" href="/account" data-testid="nav-bar-account-settings">
										Account settings
									</a>
									<div class="dropdown-divider"></div>
									<button
										type="button"
										class="dropdown-item"
										onclick={logout}
										data-testid="nav-bar-logout"
									>
										Logout
									</button>
								</div>
							</div>
						</li>
					{/if}
				</ul>
			</div>
		</div>
	</header>
	<div class="page-wrapper">
		{@render children?.()}
	</div>
</div>

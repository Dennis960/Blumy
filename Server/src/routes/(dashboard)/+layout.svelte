<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	// TODO remove all vendors except litepicker
	import { page } from '$app/stores';
	import { env } from '$env/dynamic/public';
	import { clientApi } from '$lib/client/api.js';
	import LoginButtonGoogle from '$lib/components/LoginButtonGoogle.svelte';
	import { authenticationModalStore } from '$lib/components/modals/AuthenticateModal.svelte';
	import ToastContainer from '$lib/components/ToastContainer.svelte';
	import ChevronDown from '@tabler/icons-svelte/icons/chevron-down';
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
			open: true,
			authenticationType: 'login'
		});
	}

	function register() {
		authenticationModalStore.set({
			open: true,
			authenticationType: 'register'
		});
	}
</script>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html webManifestLink}
</svelte:head>

<div class="page">
	<div class="absolute right-6 top-6">
		<ToastContainer />
	</div>
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
							<a class="nav-link cursor-pointer" onclick={login} data-testid="nav-bar-login"
								>Login</a
							>
						</li>
						<li class="nav-item">
							<a class="nav-link cursor-pointer" onclick={register} data-testid="nav-bar-register"
								>Register</a
							>
						</li>
						<li class="nav-item">
							<LoginButtonGoogle />
						</li>
					{:else}
						<li class="nav-item dropdown">
							<a
								class="nav-link dropdown-toggle cursor-pointer"
								id="navbarAccountDropdown"
								role="button"
								data-bs-toggle="dropdown"
								aria-expanded="false"
								data-testid="nav-bar-account"
							>
								<div>
									Account
									<ChevronDown
										class="text-primary-800 ms-2 dark:text-white"
										style="width: 1.5em; height: 1.5em; vertical-align: middle;"
									/>
								</div>
							</a>
							<ul class="dropdown-menu" aria-labelledby="navbarAccountDropdown">
								<li>
									<a class="dropdown-item" href="/account" data-testid="nav-bar-account-settings"
										>Account settings</a
									>
								</li>
								<li><hr class="dropdown-divider" /></li>
								<li>
									<a class="dropdown-item" onclick={logout} data-testid="nav-bar-logout">Logout</a>
								</li>
							</ul>
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

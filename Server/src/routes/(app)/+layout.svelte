<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { env } from '$env/dynamic/public';
	import { clientApi } from '$lib/client/api.js';
	import LoginButtonGoogle from '$lib/components/LoginButtonGoogle.svelte';
	import { authenticationModalStore } from '$lib/components/modals/AuthenticateModal.svelte';
	import { route } from '$lib/ROUTES.js';

	let { data, children } = $props();

	async function logout() {
		await clientApi().auth().logout().response();
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
			<a class="navbar-brand ms-lg-0 me-auto ms-2" href={route('/')}>
				Blumy{env.PUBLIC_MODE === 'test' ? ' - Test' : ''}
			</a>
			<div class="navbar-collapse collapse" id="navbarNav">
				<ul class="navbar-nav me-auto ms-4 gap-3">
					<li class="nav-item">
						<a class="nav-link}" href={route('/dashboard')}>Dashboard</a>
					</li>
					<li class="nav-item">
						<a class="nav-link}" href={route('/tutorials/getting-started')}>Erste Schritte</a>
					</li>
					<li class="nav-item">
						<a class="nav-link}" href={route('/shop')}>Shop</a>
					</li>
				</ul>
				<ul class="navbar-nav ms-auto gap-4">
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
						<li class="nav-item">
							<button
								type="button"
								class="nav-link btn btn-link p-0"
								onclick={register}
								data-testid="nav-bar-register"
								data-bs-toggle="modal"
								data-bs-target="#authentication-modal"
							>
								Registrieren
							</button>
						</li>
						<li class="nav-item">
							<LoginButtonGoogle />
						</li>
					{:else}
						<li class="nav-item">
							<div class="dropdown">
								<div
									class="nav-link dropdown-toggle cursor-pointer"
									id="navbarAccountDropdown"
									role="button"
									data-bs-toggle="dropdown"
									aria-expanded="false"
									data-testid="nav-bar-account"
								>
									<div>Konto</div>
								</div>
								<div
									class="dropdown-menu dropdown-menu-end"
									aria-labelledby="navbarAccountDropdown"
								>
									<a
										class="dropdown-item"
										href={route('/account')}
										data-testid="nav-bar-account-settings"
									>
										Kontoeinstellungen
									</a>
									<div class="dropdown-divider"></div>
									<button
										type="button"
										class="dropdown-item"
										onclick={logout}
										data-testid="nav-bar-logout"
									>
										Abmelden
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
	<footer class="footer bg-light border-top mt-auto py-3">
		<div class="container-xl text-center">
			<span class="text-muted">
				&copy; {new Date().getFullYear()} Blumy. Alle Rechte vorbehalten.
			</span>
			<span class="mx-2">|</span>
			<a href={route('/impressum')} class="text-muted" data-testid="footer-impressum-link">
				Impressum
			</a>
			<span class="mx-2">|</span>
			<a
				href={route('/privacy-policy')}
				class="text-muted"
				data-testid="footer-privacy-policy-link"
			>
				Datenschutzerklärung
			</a>
		</div>
	</footer>
</div>

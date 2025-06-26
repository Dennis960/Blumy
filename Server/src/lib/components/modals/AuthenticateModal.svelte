<script module lang="ts">
	import { writable } from 'svelte/store';
	export const authenticationModalStore = writable({
		authenticationType: 'login' as 'login' | 'register'
	});
</script>

<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { clientApi } from '$lib/client/api';
	import Modal from '$lib/components/Modal.svelte';
	import LoginButtonGoogle from '../LoginButtonGoogle.svelte';

	let email = $state('');
	let password = $state('');
	let repeatPassword = $state('');
	let errorText = $state('');
	async function login() {
		return clientApi(fetch).auth().default().login(email, password).response();
	}

	async function register() {
		return clientApi(fetch).auth().default().register(email, password).response();
	}

	async function authenticate(event: Event) {
		event.preventDefault();

		let res;
		if ($authenticationModalStore.authenticationType === 'login') {
			res = await login();
		} else {
			if (password !== repeatPassword) {
				errorText = 'Passwords do not match';
				return;
			}
			res = await register();
		}

		if (res.ok) {
			await invalidateAll();
			email = '';
			password = '';
			errorText = '';
			const redirectUrl = page.url.searchParams.get('redirectUrl');
			if (redirectUrl) {
				goto(decodeURIComponent(redirectUrl));
			}
		} else {
			errorText = await res.text();
		}
	}
</script>

<Modal
	title={$authenticationModalStore.authenticationType === 'login' ? 'Login' : 'Register'}
	dataTestId="authentication-modal"
	modalId="authentication-modal"
>
	<form onsubmit={authenticate} class="d-flex flex-column w-100 align-items-start gap-3">
		<label for="email" class="form-label fw-medium">Email</label>
		<input
			id="email"
			type="email"
			class="form-control"
			bind:value={email}
			data-testid="authentication-modal-email"
		/>
		{#if errorText.toLowerCase().includes('email') && !errorText.toLowerCase().includes('password')}
			<p class="form-text text-danger" data-testid="authentication-modal-error">{errorText}</p>
		{/if}

		<label for="password" class="form-label fw-medium">Password</label>
		<input
			id="password"
			type="password"
			class="form-control"
			bind:value={password}
			data-testid="authentication-modal-password"
		/>

		{#if $authenticationModalStore.authenticationType === 'register'}
			<label for="repeat-password" class="form-label fw-medium">Repeat Password</label>
			<input
				id="repeat-password"
				type="password"
				class="form-control"
				bind:value={repeatPassword}
				data-testid="authentication-modal-repeat-password"
			/>
		{/if}

		{#if errorText.toLowerCase().includes('password')}
			<p class="form-text text-danger" data-testid="authentication-modal-error">{errorText}</p>
		{/if}

		<input type="submit" class="d-none" />

		<button
			type="submit"
			onclick={authenticate}
			class="w-100 btn btn-primary mt-2"
			data-testid="authentication-modal-submit"
			data-bs-dismiss="modal"
		>
			{$authenticationModalStore.authenticationType === 'login' ? 'Login' : 'Register'}
		</button>

		{#if errorText && !errorText.toLowerCase().includes('email') && !errorText
				.toLowerCase()
				.includes('password')}
			<p class="form-text text-danger" data-testid="authentication-modal-error">{errorText}</p>
		{/if}

		<div class="form-text">
			{#if $authenticationModalStore.authenticationType === 'login'}
				Don't have an account?
				<button
					type="button"
					onclick={() => ($authenticationModalStore.authenticationType = 'register')}
					class="link-primary text-decoration-underline btn btn-link cursor-pointer p-0"
					data-testid="authentication-modal-register"
					style="cursor:pointer"
				>
					Register
				</button>
			{:else}
				Already have an account?
				<button
					type="button"
					onclick={() => ($authenticationModalStore.authenticationType = 'login')}
					class="link-primary text-decoration-underline btn btn-link cursor-pointer p-0"
					data-testid="authentication-modal-login"
					style="cursor:pointer"
				>
					Login
				</button>
			{/if}
		</div>

		<LoginButtonGoogle />
	</form>
</Modal>

<script module lang="ts">
	import { writable } from 'svelte/store';
	export const authenticationModalStore = writable({
		open: false,
		authenticationType: 'login' as 'login' | 'register'
	});
</script>

<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { clientApi } from '$lib/client/api';
	import Modal from '$lib/components/Modal.svelte';
	import LoginButtonGoogle from '../LoginButtonGoogle.svelte';
	import { page } from '$app/state';

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

	async function authenticate(event) {
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
			$authenticationModalStore.open = false;
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
	bind:open={$authenticationModalStore.open}
	dataTestId="authentication-modal"
>
	<form onsubmit={authenticate} class="flex w-full flex-col items-start gap-4">
		<label for="email" class="text-sm font-medium">Email</label>
		<input
			id="email"
			type="email"
			class="w-full rounded border px-3 py-2 text-sm"
			bind:value={email}
			data-testid="authentication-modal-email"
		/>
		{#if errorText.toLowerCase().includes('email') && !errorText.toLowerCase().includes('password')}
			<p class="text-sm text-red-500" data-testid="authentication-modal-error">{errorText}</p>
		{/if}

		<label for="password" class="text-sm font-medium">Password</label>
		<input
			id="password"
			type="password"
			class="w-full rounded border px-3 py-2 text-sm"
			bind:value={password}
			data-testid="authentication-modal-password"
		/>

		{#if $authenticationModalStore.authenticationType === 'register'}
			<label for="repeat-password" class="text-sm font-medium">Repeat Password</label>
			<input
				id="repeat-password"
				type="password"
				class="w-full rounded border px-3 py-2 text-sm"
				bind:value={repeatPassword}
				data-testid="authentication-modal-repeat-password"
			/>
		{/if}

		{#if errorText.toLowerCase().includes('password')}
			<p class="text-sm text-red-500" data-testid="authentication-modal-error">{errorText}</p>
		{/if}

		<input type="submit" class="hidden" />

		<button
			type="submit"
			onclick={authenticate}
			class="mt-2 w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
			data-testid="authentication-modal-submit"
		>
			{$authenticationModalStore.authenticationType === 'login' ? 'Login' : 'Register'}
		</button>

		{#if errorText && !errorText.toLowerCase().includes('email') && !errorText
				.toLowerCase()
				.includes('password')}
			<p class="text-sm text-red-500" data-testid="authentication-modal-error">{errorText}</p>
		{/if}

		<div class="text-sm">
			{#if $authenticationModalStore.authenticationType === 'login'}
				Don't have an account?
				<a
					onclick={() => ($authenticationModalStore.authenticationType = 'register')}
					class="cursor-pointer text-blue-600 hover:underline"
					data-testid="authentication-modal-register"
				>
					Register
				</a>
			{:else}
				Already have an account?
				<a
					onclick={() => ($authenticationModalStore.authenticationType = 'login')}
					class="cursor-pointer text-blue-600 hover:underline"
					data-testid="authentication-modal-login"
				>
					Login
				</a>
			{/if}
		</div>

		<LoginButtonGoogle />
	</form>
</Modal>

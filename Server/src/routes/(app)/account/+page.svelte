<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { clientApi } from '$lib/client/api';
	import IconCheck from '@tabler/icons-svelte/icons/check';
	import IconLoader2 from '@tabler/icons-svelte/icons/loader-2';
	import IconX from '@tabler/icons-svelte/icons/x';

	let { data } = $props();
	let email = $state(data.user.email);
	let emailUpdateStatus: 'unchanged' | 'updating' | 'success' | 'error' = $state('unchanged');
	let passwordUpdateStatus: 'unchanged' | 'updating' | 'success' | 'error' = $state('unchanged');
	let currentPassword = $state('');
	let newPassword = $state('');

	async function changeEmail() {
		if (!email) return;
		emailUpdateStatus = 'updating';
		const updateEmailApiCall = clientApi().currentAccount().updateEmail(email);
		const updateEmailResponse = await updateEmailApiCall.response();
		if (updateEmailResponse.ok) {
			emailUpdateStatus = 'success';
			invalidateAll();
		} else {
			emailUpdateStatus = 'error';
		}
	}

	async function changePassword() {
		passwordUpdateStatus = 'updating';
		const updatePasswordApiCall = clientApi()
			.currentAccount()
			.updatePassword(currentPassword, newPassword);
		const updatePasswordResponse = await updatePasswordApiCall.response();
		if (updatePasswordResponse.ok) {
			passwordUpdateStatus = 'success';
			invalidateAll();
		} else {
			passwordUpdateStatus = 'error';
		}
	}

	async function deleteAccount() {
		if (
			confirm(
				'Bist du sicher, dass du dein Konto löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.'
			)
		) {
			const deleteApiCall = clientApi().currentAccount().delete();
			const deleteResponse = await deleteApiCall.response();
			if (deleteResponse.ok) {
				invalidateAll();
			}
		}
	}
</script>

<div class="container mt-4" style="max-width: 600px;">
	<div class="row mb-4">
		<div class="col">
			<h4>Kontoeinstellungen</h4>
		</div>
	</div>

	<div class="row align-items-center mb-3">
		<label for="email" class="col-form-label col-12">E-Mail</label>
		<div class="position-relative col-8">
			<input
				type="text"
				id="email"
				placeholder="E-Mail"
				bind:value={email}
				data-testid="account-settings-email"
				class="form-control"
				disabled={!data.user.isDefaultLogin}
			/>
			<span class="position-absolute translate-middle-y top-50 end-0 me-2">
				{#if emailUpdateStatus === 'updating'}
					<IconLoader2 class="text-muted" size={20} />
				{:else if emailUpdateStatus === 'success'}
					<IconCheck class="text-success" size={20} data-testid="account-settings-email-success" />
				{:else if emailUpdateStatus === 'error'}
					<IconX class="text-danger" size={20} />
				{/if}
			</span>
		</div>
		{#if data.user.isDefaultLogin}
			<div class="col-4">
				<button
					class="btn btn-primary w-100"
					onclick={changeEmail}
					disabled={email === data.user.email}
					data-testid="account-settings-change-email"
				>
					E-Mail ändern
				</button>
			</div>
		{/if}
	</div>

	{#if data.user.isDefaultLogin}
		<div class="row mb-3">
			<div class="col-6">
				<label for="current-password" class="form-label">Aktuelles Passwort</label>
				<input
					type="password"
					id="current-password"
					placeholder="Aktuelles Passwort"
					bind:value={currentPassword}
					data-testid="account-settings-current-password"
					class="form-control"
				/>
			</div>
			<div class="col-6">
				<label for="new-password" class="form-label">Neues Passwort</label>
				<input
					type="password"
					id="new-password"
					placeholder="Neues Passwort"
					bind:value={newPassword}
					data-testid="account-settings-new-password"
					class="form-control"
				/>
			</div>
		</div>
		<div class="row align-items-center mb-3">
			<div class="position-relative col-8">
				<span class="position-absolute translate-middle-y top-50 end-0 me-2">
					{#if passwordUpdateStatus === 'updating'}
						<IconLoader2 class="text-muted" size={20} />
					{:else if passwordUpdateStatus === 'success'}
						<IconCheck class="text-success" size={20} />
					{:else if passwordUpdateStatus === 'error'}
						<IconX class="text-danger" size={20} />
					{/if}
				</span>
			</div>
			<div class="col-4">
				<button
					class="btn btn-primary w-100"
					onclick={changePassword}
					disabled={currentPassword === '' || newPassword === ''}
					data-testid="account-settings-change-password"
				>
					Passwort ändern
				</button>
			</div>
		</div>
	{:else}
		<div class="row mb-3">
			<div class="col">
				<p class="text-muted">
					Du bist mit einem Drittanbieter angemeldet. Du kannst deine E-Mail oder dein Passwort
					nicht ändern.
				</p>
			</div>
		</div>
	{/if}

	<hr class="my-4" />
	<div class="row mb-3">
		<div class="col">
			<h4>Gefahrenzone</h4>
		</div>
	</div>
	<div class="row">
		<div class="col">
			<button class="btn btn-danger w-100" onclick={deleteAccount}> Konto löschen </button>
		</div>
	</div>
</div>

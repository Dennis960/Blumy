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
		const updateEmailApiCall = clientApi(fetch).currentAccount().updateEmail(email);
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
		const updatePasswordApiCall = clientApi(fetch)
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
		if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
			const deleteApiCall = clientApi(fetch).currentAccount().delete();
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
			<h4>Account Settings</h4>
		</div>
	</div>

	<div class="row align-items-center mb-3">
		<label for="email" class="col-12 col-form-label">Email</label>
		<div class="col-8 position-relative">
			<input
				type="text"
				id="email"
				placeholder="Email"
				bind:value={email}
				data-testid="account-settings-email"
				class="form-control"
				disabled={!data.user.isDefaultLogin}
			/>
			<span class="position-absolute top-50 translate-middle-y end-0 me-2">
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
					Change Email
				</button>
			</div>
		{/if}
	</div>

	{#if data.user.isDefaultLogin}
		<div class="row mb-3">
			<div class="col-6">
				<label for="current-password" class="form-label">Current Password</label>
				<input
					type="password"
					id="current-password"
					placeholder="Current Password"
					bind:value={currentPassword}
					data-testid="account-settings-current-password"
					class="form-control"
				/>
			</div>
			<div class="col-6">
				<label for="new-password" class="form-label">New Password</label>
				<input
					type="password"
					id="new-password"
					placeholder="New Password"
					bind:value={newPassword}
					data-testid="account-settings-new-password"
					class="form-control"
				/>
			</div>
		</div>
		<div class="row align-items-center mb-3">
			<div class="col-8 position-relative">
				<span class="position-absolute top-50 translate-middle-y end-0 me-2">
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
					Change Password
				</button>
			</div>
		</div>
	{:else}
		<div class="row mb-3">
			<div class="col">
				<p class="text-muted">
					You are logged in with a third-party provider. You cannot change your email or password.
				</p>
			</div>
		</div>
	{/if}

	<hr class="my-4" />
	<div class="row mb-3">
		<div class="col">
			<h4>Danger Zone</h4>
		</div>
	</div>
	<div class="row">
		<div class="col">
			<button class="btn btn-danger w-100" onclick={deleteAccount}> Delete Account </button>
		</div>
	</div>
</div>

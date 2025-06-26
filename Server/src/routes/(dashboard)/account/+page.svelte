<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { clientApi } from '$lib/client/api';
	import { addToast } from '$lib/components/toastModalStore.js';
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
		if (
			confirm(
				'Are you sure you want to delete your account? This action cannot be undone. All projects and data will be lost. All of your purchases will be deleted immediately. Your credits will not be refunded.'
			)
		) {
			const deleteApiCall = clientApi(fetch).currentAccount().delete();
			const deleteResponse = await deleteApiCall.response();
			if (deleteResponse.ok) {
				invalidateAll();
				addToast({
					type: 'success',
					message: 'Account deleted.'
				});
			} else {
				addToast({
					type: 'error',
					message: 'Failed to delete account.'
				});
			}
		}
	}
</script>

<div class="mx-auto grid grid-cols-[2fr,2fr,1fr] gap-4 lg:w-1/2">
	<h4 class="col-span-full my-4 text-lg font-semibold">Account Settings</h4>

	<label for="email" class="col-span-full -mb-2 text-sm font-medium">Email</label>
	<div class="col-span-2">
		<input
			type="text"
			id="email"
			placeholder="Email"
			bind:value={email}
			data-testid="account-settings-email"
			class="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
			disabled={!data.user.isDefaultLogin}
		/>
		<div class="absolute right-2 top-1/2 -translate-y-1/2">
			{#if emailUpdateStatus === 'updating'}
				<IconLoader2 class="animate-spin text-gray-500" size={20} />
			{:else if emailUpdateStatus === 'success'}
				<IconCheck class="text-green-500" size={20} data-testid="account-settings-email-success" />
			{:else if emailUpdateStatus === 'error'}
				<IconX class="text-red-500" size={20} />
			{/if}
		</div>
	</div>

	{#if data.user.isDefaultLogin}
		<button
			class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
			on:click={changeEmail}
			disabled={email === data.user.email}
			data-testid="account-settings-change-email"
		>
			Change Email
		</button>

		<label for="current-password" class="-mb-2 text-sm font-medium">Current Password</label>
		<label for="new-password" class="-mb-2 text-sm font-medium">New Password</label>
		<div></div>

		<input
			type="password"
			id="current-password"
			placeholder="Current Password"
			bind:value={currentPassword}
			data-testid="account-settings-current-password"
			class="col-span-1 rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
		/>

		<input
			type="password"
			id="new-password"
			placeholder="New Password"
			bind:value={newPassword}
			data-testid="account-settings-new-password"
			class="col-span-1 rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
		/>
		<div class="absolute right-2 top-1/2 -translate-y-1/2">
			{#if passwordUpdateStatus === 'updating'}
				<IconLoader2 class="animate-spin text-gray-500" size={20} />
			{:else if passwordUpdateStatus === 'success'}
				<IconCheck class="text-green-500" size={20} />
			{:else if passwordUpdateStatus === 'error'}
				<IconX class="text-red-500" size={20} />
			{/if}
		</div>

		<button
			class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
			on:click={changePassword}
			disabled={currentPassword === '' || newPassword === ''}
			data-testid="account-settings-change-password"
		>
			Change Password
		</button>
	{:else}
		<div class="col-span-2">
			<p class="text-sm text-gray-500">
				You are logged in with a third-party provider. You cannot change your email or password.
			</p>
		</div>
	{/if}

	<hr class="col-span-full my-4 border-t border-gray-300" />
	<h4 class="col-span-full my-4 text-lg font-semibold">Danger Zone</h4>

	<button class="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700" on:click={deleteAccount}>
		Delete Account
	</button>
</div>

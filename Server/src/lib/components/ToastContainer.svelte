<script lang="ts">
	import Toast from './Toast.svelte';

	// Import Tabler icons
	import {
		IconAlertTriangleFilled,
		IconCircleCheckFilled,
		IconCircleXFilled,
		IconInfoCircle
	} from '@tabler/icons-svelte';

	import { toastStore, type CustomToast, type CustomToastType } from './toastModalStore';

	function getColorFromType(type: CustomToastType) {
		switch (type) {
			case 'success':
				return 'green';
			case 'error':
				return 'red';
			case 'warning':
				return 'yellow';
			case 'info':
				return 'blue';
		}
	}

	let sortedToasts: CustomToast[] = $derived(
		$toastStore.sort((a, b) => b.lastUpdate.getTime() - a.lastUpdate.getTime())
	);
</script>

<div class="flex min-w-56 flex-col justify-end gap-3">
	{#each sortedToasts as toast}
		<Toast
			color={getColorFromType(toast.type)}
			class="bg-primary-100 dark:bg-primary-950 outline-primary-200 dark:outline-primary-900 z-10 opacity-100 outline outline-1 dark:text-gray-300"
		>
			<svelte:fragment slot="icon">
				{#if toast.type === 'success'}
					<IconCircleCheckFilled class="h-5 w-5" />
					<span class="sr-only">Success</span>
				{:else if toast.type === 'error'}
					<IconCircleXFilled class="h-5 w-5" />
					<span class="sr-only">Error</span>
				{:else if toast.type === 'warning'}
					<IconAlertTriangleFilled class="h-5 w-5" />
					<span class="sr-only">Warning</span>
				{:else if toast.type === 'info'}
					<IconInfoCircle class="h-5 w-5" />
					<span class="sr-only">Info</span>
				{/if}
			</svelte:fragment>
			{#if toast.numberOfDuplicates > 1}
				(x{toast.numberOfDuplicates})
			{/if}
			{toast.message}
		</Toast>
	{/each}
</div>

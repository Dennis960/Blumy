<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { z } from 'zod';

	onMount(async () => {
		if (browser) {
			const response = await fetch('/auth?/loginGoogle', { method: 'POST', body: '' });
			const redirect = z
				.object({
					status: z.number(),
					location: z.string()
				})
				.parse(await response.json());

			// if code is 302, redirect to the google login page
			if (redirect.status === 302) {
				window.location.href = redirect.location;
			}
		}
	});
</script>

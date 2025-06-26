<script lang="ts">
	import { page } from '$app/state';
	import { clientApi } from '$lib/client/api';
	interface Props {
		[key: string]: any;
	}

	let { ...rest }: Props = $props();

	async function googleLogin() {
		const queryRedirectUrl =
			page.url.searchParams.get('redirectUrl') ?? encodeURIComponent(page.url.toString());
		const google_redirect_url = await clientApi(fetch)
			.auth()
			.google()
			.login(queryRedirectUrl)
			.parse();
		window.location.href = google_redirect_url;
	}
</script>

<button
	onclick={googleLogin}
	{...rest}
	class="flex gap-2 rounded-lg border border-slate-200 px-4 py-2 text-slate-700 transition duration-150 hover:border-slate-400 hover:text-slate-900 hover:shadow dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-slate-300"
	type="button"
>
	<img
		class="h-6 w-6"
		src="https://www.svgrepo.com/show/475656/google-color.svg"
		loading="lazy"
		alt="google logo"
	/>
	<span>Login with Google</span>
</button>

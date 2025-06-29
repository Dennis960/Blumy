<script lang="ts">
	import { page } from '$app/state';
	import { clientApi } from '$lib/client/api';

	let { ...rest } = $props();

	async function googleLogin() {
		const queryRedirectUrl =
			page.url.searchParams.get('redirectUrl') ?? encodeURIComponent(page.url.toString());
		const google_redirect_url = await clientApi().auth().google().login(queryRedirectUrl).parse();
		window.location.href = google_redirect_url;
	}
</script>

<button onclick={googleLogin} {...rest} class="btn" type="button">
	<img
		class="me-2"
		style="height: 20px; width: 20px;"
		src="https://www.svgrepo.com/show/475656/google-color.svg"
		loading="lazy"
		alt="google logo"
	/>
	<span> Über Google anmelden </span>
</button>

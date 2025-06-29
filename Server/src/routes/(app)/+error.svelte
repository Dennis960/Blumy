<script>
	import { route } from '$lib/ROUTES';
	import { default as IconAlertCircle } from '@tabler/icons-svelte/icons/alert-circle';
</script>

<svelte:head>
	<title>Fehler</title>
</svelte:head>

<main style="text-align: center; margin-top: 5rem;">
	<IconAlertCircle size={64} class="mb-4"/>
	<h2>Etwas ist schiefgelaufen</h2>
	<p>Ein unerwarteter Fehler ist aufgetreten.</p>
	<a href={route('/')}>Zur Startseite</a>
</main>

<script lang="ts">
	interface Props {
		label: string;
		value: string;
		hint: string;
		id: string;
	}

	let { label, value, hint, id }: Props = $props();

	let tokenInput: HTMLInputElement = $state()!;
	let copied = $state(false);

	async function handleCopy() {
		tokenInput.select();
		try {
			await navigator.clipboard.writeText(value);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch (err) {
			console.error('Failed to copy token: ', err);
		}
	}
</script>

<label for={id} class="form-label">{label}</label>
<div class="d-flex column-gap-1">
	<input bind:this={tokenInput} {id} type="text" class="form-control" {value} readonly />
	<button class="btn btn-outline-secondary" type="button" onclick={handleCopy}>Kopieren</button>
</div>
{#if copied}
	<small class="form-hint text-success mt-2">In Zwischenablage kopiert!</small>
{:else}
	<small class="form-hint mt-2">{hint}</small>
{/if}

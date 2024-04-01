<script lang="ts">
    export let label: string
    export let value: string
    export let hint: string;

	let tokenInput: HTMLInputElement;
	let copied = false;

	async function handleCopy() {
		tokenInput.select();
        try {
            await navigator.clipboard.writeText(value);
            copied = true;
			setTimeout(() => { copied = false }, 2000);
        } catch (err) {
            console.error('Failed to copy token: ', err)
        }
	}
</script>

<label for="token" class="form-label">{label}</label>
<div class="d-flex column-gap-1">
    <input bind:this={tokenInput} id="token" type="text" class="form-control" value={value} readonly>
    <button class="btn btn-outline-secondary" type="button" on:click={handleCopy}>Kopieren</button>
</div>
{#if copied}
    <small class="form-hint mt-2 text-success">In Zwischenablage kopiert!</small>
{:else}
    <small class="form-hint mt-2">{hint}</small>
{/if}
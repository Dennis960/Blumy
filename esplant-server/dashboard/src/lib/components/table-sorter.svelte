<script context="module" lang="ts">
	export type SortDirection = 'asc' | 'desc' | undefined;
</script>

<script lang="ts">
	import type { SortKey } from '$lib/sort-query-data';

	import { createEventDispatcher } from 'svelte';

    export let sortKey: SortKey;
	export let sortDirection: SortDirection = undefined;

	$: asc = sortDirection === 'asc';
	$: desc = sortDirection === 'desc';

	const dispatch = createEventDispatcher();

	function handleSortClick() {
		dispatch('sort', { key: sortKey, direction: sortDirection });
	}
	function click() {
		if (sortDirection === 'asc') {
			sortDirection = 'desc';
		} else if (sortDirection === 'desc') {
			sortDirection = undefined;
		} else {
			sortDirection = 'asc';
		}
		handleSortClick();
	}
</script>
<svelte:options accessors/>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="sort-container" on:click={click}>
	<slot />
	<div class="sort-icons">
		<span class="sort-icon asc" class:active={asc} />
		<span class="sort-icon desc" class:active={desc} />
	</div>
</div>

<style>
	.sort-container {
		display: flex;
		align-items: center;
		gap: 5px;
		cursor: pointer;
	}
	.sort-icons {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.sort-icon {
		display: inline-block;
		width: 0;
		height: 0;
		border-left: 4px solid transparent;
		border-right: 4px solid transparent;
		margin-left: 5px;
		vertical-align: middle;
		opacity: 0.2;
	}
	.asc {
		border-bottom: 4px solid #000;
	}
	.desc {
		border-top: 4px solid #000;
	}
	.active {
		opacity: 1;
	}
</style>

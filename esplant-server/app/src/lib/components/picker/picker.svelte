<script lang="ts">
	import Icon from '$lib/components/icon.svelte';

	export let values: any[];
	export let valueDescriptions: any[];
	export let value: any;
	export let color: string | undefined = undefined;
	export let icon: string | undefined = undefined;
</script>

<div class="picker-container">
	<div class="icon">
		{#if icon}
			<Icon size={25} {icon} />
		{/if}
		{#if color}
			<div class="circle" style="background-color: {color}" />
		{/if}
	</div>
	<select bind:value>
		{#each values as value, index}
			<option {value}>{valueDescriptions[index]}</option>
		{/each}
	</select>
</div>

<style>
	select {
		padding-left: 40px;
		width: 100%;
		margin: 10px;
		/* Width should not exceed body width as that breaks the layout */
		max-width: calc(100vw - 20px);
	}
	.picker-container {
		position: relative;
	}
	.circle {
		width: 20px;
		height: 20px;
		border-radius: 100%;
	}
	.icon {
		position: absolute;
		padding: 22px;
		width: 0px;
		height: 100%;
	}
</style>

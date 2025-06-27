<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		icon,
		children,
		ok = false,
		warning = false,
		critical = false
	}: {
		title: string;
		icon?: Snippet;
		children?: Snippet;
		ok?: boolean;
		warning?: boolean;
		critical?: boolean;
	} = $props();
</script>

<div class="datagrid-item text-truncate text-nowrap">
	<dt class="datagrid-title">{title}</dt>
	<dd
		class="datagrid-content d-flex align-items-center space-x-2 {ok && !warning && !critical
			? 'text-green'
			: ''} {warning && !critical ? 'text-warning' : ''} {critical ? 'text-danger' : ''}"
	>
		{@render icon?.()}
		{@render children?.()}
	</dd>
</div>

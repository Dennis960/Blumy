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
		children?: Snippet;
		icon?: Snippet;
		ok?: boolean;
		warning?: boolean;
		critical?: boolean;
	} = $props();
</script>

<section class="card">
	<div class="card-body text-truncate text-nowrap">
		<h1 class="subheader mb-0">{title}</h1>
		<div
			class="h2 d-flex align-items-center space-x-2 {ok && !warning && !critical
				? 'text-green'
				: ''} {warning && !critical ? 'text-warning' : ''} {critical ? 'text-danger' : ''}"
		>
			{@render icon?.()}
			{@render children?.()}
		</div>
	</div>
</section>

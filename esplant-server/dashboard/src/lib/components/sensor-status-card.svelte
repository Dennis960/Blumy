<script lang="ts">
	export let title: string;
	export let value: string = '';
	export let ok: boolean = false;
	export let warning: boolean = false;
	export let critical: boolean = false;
</script>

<section class="card">
	<div class="card-body text-nowrap text-truncate">
		<h1 class="subheader mb-0">{title}</h1>
		<div
			class="h2 d-flex align-items-center space-x-2 {ok && !warning && !critical
				? 'text-green'
				: ''} {warning && !critical ? 'text-warning' : ''} {critical ? 'text-danger' : ''}"
		>
			<slot name="icon" />
			<slot name="value">
				{value}
			</slot>
		</div>
	</div>
</section>

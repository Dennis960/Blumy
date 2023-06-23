<script lang="ts">
	export let title: string;
	export let value: string = '';
	export let ok: boolean = false;
	export let warning: boolean = false;
	export let critical: boolean = false;
</script>

<section class="card">
	<div class="card-body">
		<h1 class="subheader mb-0">{title}</h1>
		<div
			class="h1 {ok && !warning && !critical ? 'text-green' : ''} {warning && !critical
				? 'text-warning'
				: ''} {critical ? 'text-danger' : ''}"
		>
			<slot name="icon" />
			<span class={$$slots.icon ? 'ms-1' : ''}>
				<slot name="value">
					{value}
				</slot>
			</span>
		</div>
	</div>
</section>

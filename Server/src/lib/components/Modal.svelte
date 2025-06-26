<script lang="ts">
	let {
		title = '',
		dataTestId = '',
		modalId = 'modal',
		children
	}: {
		title?: string;
		dataTestId?: string;
		modalId?: string;
		children?: import('svelte').Snippet;
	} = $props();
</script>

<div class="modal" id={modalId} tabindex="-1" data-testid={dataTestId}>
	<div class="modal-dialog" role="document">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title">{title}</h5>
				<button type="button" class="btn-close" aria-label="Close" data-bs-dismiss="modal"></button>
			</div>
			<div class="modal-body">
				{@render children?.()}
			</div>
		</div>
	</div>
</div>

<!-- TODO: Use tabler modal -->
<script>
	export let open = false;
	export let title = '';
	export let dataTestId = '';
	export let modalId = 'exampleModal';

	// Dispatch close event for parent handling if needed
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	function closeModal() {
		open = false;
		dispatch('close');
	}
</script>

<div
	class="modal fade {open ? 'show d-block' : ''}"
	id={modalId}
	tabindex="-1"
	aria-hidden={!open}
	style="display: {open ? 'block' : 'none'};"
	data-testid={dataTestId}
>
	<div class="modal-dialog" role="document">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title">{title}</h5>
				<button
					type="button"
					class="btn-close"
					data-bs-dismiss="modal"
					aria-label="Close"
					on:click={closeModal}
				></button>
			</div>
			<div class="modal-body">
				<slot />
			</div>
			<div class="modal-footer">
				<slot name="footer">
					<button type="button" class="btn me-auto" data-bs-dismiss="modal" on:click={closeModal}
						>Close</button
					>
					<button
						type="button"
						class="btn btn-primary"
						data-bs-dismiss="modal"
						on:click={closeModal}>Save changes</button
					>
				</slot>
			</div>
		</div>
	</div>
</div>

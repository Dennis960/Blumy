<script lang="ts">
	import { default as IconChecklist } from '@tabler/icons-svelte/icons/checklist';
	let {
		title,
		description,
		steps
	}: {
		title: string;
		description: string;
		steps: { icon: any; img?: string; imgAlt?: string; title: string; desc: string }[];
	} = $props();
</script>

<div class="container py-4">
	<div class="row justify-content-center">
		<div class="col-md-8">
			<div class="card mb-4 shadow-sm">
				<div class="card-body">
					<div class="d-flex align-items-center mb-3">
						<span class="avatar avatar-lg bg-blue-lt me-3">
							<IconChecklist size={40} />
						</span>
						<div>
							<h2 class="h3 mb-0">{title}</h2>
							<div class="text-muted">
								{description}
							</div>
						</div>
					</div>
					<hr />
					<div class="row">
						{#each steps as step, i}
							<div class="col-12 mb-4">
								<div class="card h-100">
									{#if step.img}
										<div
											style="width:100%;height:180px;overflow:hidden;display:flex;align-items:center;justify-content:center;"
										>
											<img
												src={step.img}
												alt={step.imgAlt}
												class="card-img-top"
												style="max-width:100%;max-height:100%;object-fit:contain;"
											/>
										</div>
									{/if}
									<div class="card-body d-flex">
										<span class="me-3 mt-1">
											{@render step.icon({ size: 28 })}
										</span>
										<div>
											<h5 class="card-title mb-1">
												{i + 1}. {step.title}
											</h5>
											<div class="card-text">
												{@html step.desc}
											</div>
										</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

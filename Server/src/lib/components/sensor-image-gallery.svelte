<script lang="ts">
	import { clientApi } from '$lib/client/api.js';
	import { IconCalendarStats, IconInfoCircle, IconPhoto } from '$lib/icons.js';
	import type { SensorDTO, SensorImageInformationDTO } from '$lib/types/api.js';
	import SensorImageUploadInput from './sensor-image-upload-input.svelte';

	let {
		sensor
	}: {
		sensor: SensorDTO;
	} = $props();

	function getImageUrl(imageInfo: SensorImageInformationDTO) {
		return clientApi(null!)
			.sensors()
			.withId(sensor.id)
			.getImage(imageInfo.id, sensor.canEdit ? undefined : sensor.readToken).url;
	}
</script>

<div class="card shadow-sm">
	<div class="card-header bg-primary-lt">
		<h3 class="card-title mb-0">
			<IconPhoto size={20} class="me-2" />
			Bildergalerie für {sensor.config.name}
		</h3>
	</div>
	<div class="card-body bg-white">
		<div class="row g-3">
			{#if sensor.images.length > 0}
				{#if sensor.canEdit}
					<SensorImageUploadInput
						sensor={sensor}
						description="Neues Bild hinzufügen"
						saveOnChange={true}
                        hidePreview={true}
                        class="col-md-4 col-lg-3 col-6"
					/>
				{/if}
				{#each sensor.images as image, i}
					<div class="col-md-4 col-lg-3 col-6">
						<a
							href={getImageUrl(image)}
							rel="noopener noreferrer"
							class="text-decoration-none"
							style="display: block; height: 100%;"
						>
							<div class="card h-100">
								<img
									src={getImageUrl(image)}
									class="card-img-top"
									alt={`Image ${i + 1}`}
									style="object-fit: contain; max-height: 200px;"
								/>
								<div class="card-footer text-muted small d-flex align-items-center">
									<IconCalendarStats size={14} class="me-1" />
									{new Date(image.uploadedAt).toLocaleString()}
								</div>
							</div>
						</a>
					</div>
				{/each}
			{:else}
				<div class="col-12">
					<div class="d-flex justify-content-center align-items-center" style="min-height: 150px;">
						<span class="text-muted">
							<IconInfoCircle size={16} /> Keine Bilder verfügbar
						</span>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

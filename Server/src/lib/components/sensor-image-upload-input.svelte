<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { clientApi, DATA_DEPENDENCY } from '$lib/client/api';
	import { IconEdit, IconPhotoPlus } from '$lib/icons';
	import type { SensorDTO } from '$lib/types/api';
	import loadImage from 'blueimp-load-image';
	import SensorImage from './sensor-image.svelte';

	let {
		sensor,
		description = 'Klicke, um ein Bild deiner Pflanze hinzuzufügen',
		saveOnChange = false,
		class: clazz = ''
	}: {
		sensor: SensorDTO | undefined;
		description?: string;
		saveOnChange?: boolean;
		class?: string;
	} = $props();

	let imageBlob: Blob | undefined = $state(undefined);

	async function onchange(blob: Blob) {
		if (saveOnChange && sensor) {
			await clientApi().sensors().withId(sensor.id).uploadImage(blob).response();
			invalidate(DATA_DEPENDENCY.SENSOR);
		}
	}

	async function handleImageInput(e: Event) {
		const target = e.target as HTMLInputElement;
		if (!target.files || !target.files[0]) return;
		const file = target.files[0];

		loadImage(
			file,
			(canvas: HTMLCanvasElement | HTMLImageElement | Event) => {
				if (canvas instanceof HTMLCanvasElement) {
					canvas.toBlob((blob) => {
						if (blob) {
							imageBlob = blob;
							onchange(blob);
						}
					}, file.type);
				} else if (canvas instanceof HTMLImageElement) {
					const imageUrl = canvas.src;
					fetch(imageUrl)
						.then((res) => res.blob())
						.then((blob) => {
							imageBlob = blob;
							onchange(blob);
						});
				}
			},
			{
				canvas: true,
				orientation: true,
				meta: true
			}
		);
	}
</script>

<label style="cursor: pointer; position: relative; display: inline-block;" class={clazz}>
	<div class="position-relative">
		{#if imageBlob || (sensor && sensor.images.length > 0)}
			{#if imageBlob}
				<img
					src={URL.createObjectURL(imageBlob)}
					alt="Selected"
					class="avatar avatar-2xl border-light mb-2 border border-2 shadow"
					style="object-fit: cover;"
				/>
			{:else if sensor && sensor.images.length > 0}
				<SensorImage class="avatar avatar-2xl border-light mb-2 border border-2 shadow" {sensor} />
			{/if}
			<span
				class="position-absolute rounded-circle border-light bottom-0 end-0 border bg-white p-2 shadow-sm"
			>
				<IconEdit />
			</span>
		{:else}
			<div
				class="d-flex flex-column align-items-center justify-content-center p-3"
				style="border: 2px dashed #ccc; border-radius: 1rem;"
			>
				<IconPhotoPlus size={48} />
				<span class="text-muted mt-2 text-center" style="font-size: 0.95rem;">
					{description}
				</span>
			</div>
		{/if}
	</div>
	<input
		type="file"
		accept="image/*"
		class="form-control"
		onchange={handleImageInput}
		capture="environment"
		name="image"
		style="display: none;"
	/>
</label>

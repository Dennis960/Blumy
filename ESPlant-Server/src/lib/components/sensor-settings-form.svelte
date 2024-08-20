<script lang="ts">
	import { applyAction, deserialize } from '$app/forms';
	import Slider, { type SliderOptions } from '$lib/components/slider.svelte';
	import WaterCapacityDistribution from '$lib/components/water-capacity-distribution.svelte';
	import { funnyPlantNames } from '$lib/funny-plant-names';
	import type {
		SensorConfigurationDTO,
		SensorCreatedDTO,
		SensorValueDistributionDTO
	} from '$lib/types/api';
	import type { ActionResult } from '@sveltejs/kit';
	import { onMount } from 'svelte';
	import CopyText from './copy-text.svelte';

	export let config: SensorConfigurationDTO | undefined = undefined;
	export let sensorValueDistribution: SensorValueDistributionDTO | undefined = undefined;
	export let error: string | undefined = undefined;
	export let writeToken: string | undefined = undefined;
	export let shareLink: string | undefined = undefined;
	export let createdSensor: SensorCreatedDTO | undefined = undefined;

	export let formAction = '/sensor';
	export let formMethod: 'POST' | 'PUT' = 'POST';

	let initialConfig: SensorConfigurationDTO =
		config != undefined
			? { ...config }
			: {
					name: funnyPlantNames[Math.floor(Math.random() * funnyPlantNames.length)],
					imageBase64: undefined,
					fieldCapacity: 1024,
					permanentWiltingPoint: 1024 * 0.3,
					upperThreshold: 0.8,
					lowerThreshold: 0.2
				};

	let sliderOptions: SliderOptions;
	let image: HTMLImageElement | undefined = undefined;
	let sliderValues: (number | string)[] = [];

	$: [permanentWiltingPoint, lowerThreshold, upperThreshold, fieldCapacity] = sliderValues.map(
		(v) => (typeof v === 'number' ? Math.floor(v) : Math.floor(parseFloat(v)))
	);

	onMount(async () => {
		sliderOptions = {
			start: [
				initialConfig.permanentWiltingPoint,
				initialConfig.lowerThreshold * initialConfig.fieldCapacity,
				initialConfig.upperThreshold * initialConfig.fieldCapacity,
				initialConfig.fieldCapacity
			],
			connect: true,
			range: { min: [0], max: [1024] },
			pips: {
				mode: 'values' as any,
				density: 3,
				values: [0, 250, 500, 750, 1000]
			}
		};
		if (initialConfig.imageBase64 !== undefined) {
			const url = `data:image/png;base64,${initialConfig.imageBase64}`;
			image = new Image();
			image.src = url;
		}
	});

	function handleImageInput(e: Event) {
		const reader = new FileReader();
		reader.onload = (e: ProgressEvent<FileReader>) => {
			const url = e.target?.result as string;
			image = new Image();
			image.src = url;
		};

		const target = e.target as HTMLInputElement;
		if (target.files == undefined || target.files[0] == undefined) {
			return;
		}
		reader.readAsDataURL(target.files[0]);
	}

	async function handleSubmit(event: {
		currentTarget: EventTarget & HTMLFormElement;
		preventDefault: () => void;
	}) {
		event.preventDefault();
		const data = new FormData(event.currentTarget);

		const response = await fetch(event.currentTarget.action, {
			method: formMethod,
			body: data
		});

		const result: ActionResult = deserialize(await response.text());

		if (result.type === 'success' && result.data) {
			createdSensor = result.data as SensorCreatedDTO;
		}

		applyAction(result);
	}
</script>

<div class="row row-gap-3 align-items-center">
	<div class="col-12">
		<form action={formAction} method="POST" enctype="multipart/form-data" on:submit={handleSubmit}>
			<section class="card">
				<div class="card-header">
					<h1 class="card-title">Sensor-Einstellungen</h1>
				</div>
				<div class="card-body">
					<div class="row mb-3">
						<div class="col-12 col-md-6 col-lg-4">
							<label for="name" class="form-label">Name</label>
							<input
								name="name"
								type="text"
								class="form-control"
								id="name"
								value={initialConfig.name}
							/>
						</div>
					</div>

					<div class="row mb-3">
						<div class="col-12 col-md-6 col-lg-4">
							<label for="image" class="form-label">Foto</label>
							<span
								class="avatar avatar-2xl mb-2"
								style={image && `background-image: url(${image.src})`}
							/>
							<input
								type="file"
								accept="image/*"
								class="form-control"
								id="image"
								name="image"
								on:change={handleImageInput}
								required={image === undefined}
								capture="environment"
							/>
						</div>
					</div>

					<div class="row mb-3">
						<div class="col-12 col-md-6 col-lg-4">
							<label for="slider" class="form-label">Schwellwerte</label>
							{#if sliderOptions != undefined}
								<div class="my-2 slider">
									{#if sensorValueDistribution != undefined}
										<WaterCapacityDistribution
											{sensorValueDistribution}
											sensorConfig={initialConfig}
										/>
									{/if}
									<div>
										<Slider options={sliderOptions} bind:values={sliderValues} />

										<input
											type="hidden"
											name="permanentWiltingPoint"
											value={permanentWiltingPoint}
										/>
										<input
											type="hidden"
											name="lowerThreshold"
											value={lowerThreshold / fieldCapacity}
										/>
										<input
											type="hidden"
											name="upperThreshold"
											value={upperThreshold / fieldCapacity}
										/>
										<input type="hidden" name="fieldCapacity" value={fieldCapacity} />
									</div>
								</div>
							{/if}
							<small class="form-hint">
								Setze minimale und maximale akzeptable Sensorwerte und Schwellwerte für Unter- und
								Überwässerung.
							</small>
						</div>
						{#if error != undefined}
							<div class="mt-3 alert alert-danger" role="alert">
								{error}
							</div>
						{/if}
					</div>

					{#if writeToken}
						<div class="row mb-3">
							<div class="col-12 col-md-6 col-lg-4">
								<CopyText
									label="Zugangsschlüssel"
									hint="Kopiere den Zugangsschlüssel zur Einrichtung des Sensors."
									value={writeToken}
								/>
							</div>
						</div>
					{/if}

					{#if shareLink}
						<div class="row mb-3">
							<div class="col-12 col-md-6 col-lg-4">
								<CopyText
									label="Share-Link"
									hint="Jeder mit diesem Link hat Zugriff auf die Sensorwerte."
									value={shareLink}
								/>
							</div>
						</div>
					{/if}

					<div class="card-footer text-end">
						<div class="d-flex justify-content-end column-gap-2">
							<slot name="form-actions" />
							<button type="submit" class="btn btn-primary">Speichern</button>
						</div>
					</div>
				</div>
			</section>
		</form>
	</div>
</div>

<style>
	.slider {
		padding-bottom: 2.5rem;
	}

	.slider :global(.noUi-connects) {
		background: var(--tblr-danger);
	}

	.slider :global(.noUi-connects > div:nth-child(1)) {
		background: var(--tblr-warning);
	}

	.slider :global(.noUi-connects > div:nth-child(2)) {
		background: var(--tblr-success);
	}

	.slider :global(.noUi-connects > div:nth-child(3)) {
		background: var(--tblr-warning);
	}
</style>

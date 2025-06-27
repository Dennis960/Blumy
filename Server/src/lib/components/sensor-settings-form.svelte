<script lang="ts">
	import { goto } from '$app/navigation';
	import { clientApi } from '$lib/client/api';
	import WaterCapacityDistribution from '$lib/components/graphs/water-capacity-distribution.svelte';
	import Slider, { type SliderOptions } from '$lib/components/slider.svelte';
	import { funnyPlantNames } from '$lib/funny-plant-names';
	import type {
		SensorConfigurationDTO,
		SensorCreatedDTO,
		SensorValueDistributionDTO
	} from '$lib/types/api';
	import { PipsMode } from 'nouislider';
	import { onMount, type Snippet } from 'svelte';
	import Base64Image from './base64-image.svelte';
	import CopyText from './copy-text.svelte';

	let {
		sensorId = undefined,
		config = undefined,
		sensorValueDistribution = undefined,
		error = undefined,
		writeToken = undefined,
		shareLink = undefined,
		createdSensor = $bindable(undefined),
		formActions,
		onSensorCreate
	}: {
		sensorId?: number;
		config?: SensorConfigurationDTO;
		sensorValueDistribution?: SensorValueDistributionDTO;
		error?: string;
		writeToken?: string;
		shareLink?: string;
		createdSensor?: SensorCreatedDTO;
		formActions?: Snippet;
		onSensorCreate?: (sensor: SensorCreatedDTO) => void;
	} = $props();

	const MAX_FIELD_CAPACITY = 2500;

	let initialConfig: SensorConfigurationDTO =
		config != undefined
			? { ...config }
			: {
					name: funnyPlantNames[Math.floor(Math.random() * funnyPlantNames.length)],
					imageBase64: undefined,
					fieldCapacity: MAX_FIELD_CAPACITY * 0.85,
					permanentWiltingPoint: MAX_FIELD_CAPACITY * 0.15,
					upperThreshold: 0.75,
					lowerThreshold: 0.4
				};

	let sliderOptions: SliderOptions | undefined = $state();
	let image: HTMLImageElement | undefined = $state(undefined);
	let sliderValues: (number | string)[] = $state([]);

	let permanentWiltingPoint = $state(initialConfig.permanentWiltingPoint);
	let lowerThreshold = $state(initialConfig.lowerThreshold * MAX_FIELD_CAPACITY);
	let upperThreshold = $state(initialConfig.upperThreshold * MAX_FIELD_CAPACITY);
	let fieldCapacity = $state(initialConfig.fieldCapacity);

	function onSliderChange(values: (number | string)[]) {
		[permanentWiltingPoint, lowerThreshold, upperThreshold, fieldCapacity] = values.map((v) =>
			Math.floor((parseFloat(v.toString()) / 100) * MAX_FIELD_CAPACITY)
		);
	}

	onMount(async () => {
		const sliderLabels = ['Lufttrocken', 'Trocken', 'Feucht', 'Nass', 'Unter Wasser'];
		const format = {
			to: function (value: number) {
				value = Math.floor((value / MAX_FIELD_CAPACITY) * (sliderLabels.length - 1));
				return sliderLabels[value];
			},
			from: function (value: string) {
				if (!Number.isNaN(parseFloat(value))) {
					return parseFloat(value);
				}
				return (sliderLabels.indexOf(value) / (sliderLabels.length - 1)) * MAX_FIELD_CAPACITY;
			}
		};
		sliderOptions = {
			start: [
				initialConfig.permanentWiltingPoint,
				initialConfig.lowerThreshold * MAX_FIELD_CAPACITY,
				initialConfig.upperThreshold * MAX_FIELD_CAPACITY,
				initialConfig.fieldCapacity
			],
			connect: true,
			range: { min: 0, max: MAX_FIELD_CAPACITY },
			step: MAX_FIELD_CAPACITY / ((sliderLabels.length - 1) * 5),
			format: format,
			pips: {
				mode: PipsMode.Values,
				format: format,
				values: sliderLabels.map(format.from),
				density: 5
			},
			tooltips: [
				{ to: () => 'Vertrocknet' },
				{ to: () => 'Braucht Wasser' },
				{ to: () => 'Zu viel Wasser' },
				{ to: () => 'Überflutet' }
			]
		};
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

		if (sensorId !== undefined) {
			const apiCall = clientApi().sensors().withId(sensorId).update(data);
			if ((await apiCall.response()).ok) {
				goto(`/sensor/${sensorId}`, {
					invalidateAll: true
				});
			}
		} else {
			const apiCall = clientApi().sensors().create(data);
			if ((await apiCall.response()).ok) {
				const sensor = await apiCall.parse();
				onSensorCreate?.(sensor);
			}
		}
	}

	async function deleteSensor() {
		if (!sensorId) {
			return;
		}
		if (
			window.confirm(
				'Soll der Sensor wirklich gelöscht werden? Dieser Prozess kann nicht rückgängig gemacht werden.'
			)
		) {
			await clientApi().sensors().withId(sensorId).delete().response();
			goto('/');
		}
	}
</script>

<div class="row row-gap-3 align-items-center">
	<div class="col-12">
		<form onsubmit={handleSubmit}>
			<section class="card">
				<div class="card-header">
					<h1 class="card-title">Sensor-Einstellungen</h1>
				</div>
				<div class="card-body">
					<div class="row mb-3">
						<div class="col-md-6 col-lg-4 col-12">
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
						<div class="col-md-6 col-lg-4 col-12">
							<label for="image" class="form-label">Foto</label>
							{#if image}
								<span class="avatar avatar-2xl mb-2" style={`background-image: url(${image.src})`}
								></span>
							{:else}
								<Base64Image
									class="avatar avatar-2xl mb-2"
									imageBase64={initialConfig.imageBase64}
								/>
							{/if}
							<input
								type="file"
								accept="image/*"
								class="form-control"
								id="image"
								name="image"
								onchange={handleImageInput}
								required={image === undefined && initialConfig.imageBase64 === undefined}
								capture="environment"
							/>
						</div>
					</div>

					<div class="row mb-3">
						<div class="col-md-6 col-lg-4 col-12">
							<label for="slider" class="form-label">Schwellwerte</label>
							{#if sliderOptions != undefined}
								<div class="slider my-2">
									{#if sensorValueDistribution != undefined}
										<WaterCapacityDistribution
											{sensorValueDistribution}
											sensorConfig={initialConfig}
										/>
									{/if}
									<div>
										<Slider
											options={sliderOptions}
											bind:values={sliderValues}
											change={onSliderChange}
										/>

										<input
											type="hidden"
											name="permanentWiltingPoint"
											value={permanentWiltingPoint}
										/>
										<input
											type="hidden"
											name="lowerThreshold"
											value={lowerThreshold / MAX_FIELD_CAPACITY}
										/>
										<input
											type="hidden"
											name="upperThreshold"
											value={upperThreshold / MAX_FIELD_CAPACITY}
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
							<div class="alert alert-danger mt-3" role="alert">
								{error}
							</div>
						{/if}
					</div>

					{#if writeToken}
						<div class="row mb-3">
							<div class="col-md-6 col-lg-4 col-12">
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
							<div class="col-md-6 col-lg-4 col-12">
								<CopyText
									label="Share-Link"
									hint="Jeder mit diesem Link hat Zugriff auf die Sensorwerte."
									value={shareLink}
								/>
							</div>
						</div>
					{/if}

					{#if sensorId}
						<!-- Delete button -->
						<div class="row mb-3">
							<div
								class="col -md-6
								col-lg-4 col-12"
							>
								<button type="button" class="btn btn-danger" onclick={deleteSensor}>
									Sensor löschen
								</button>
							</div>
						</div>
					{/if}

					<div class="card-footer text-end">
						<div class="d-flex justify-content-end column-gap-2">
							{@render formActions?.()}
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
		padding-bottom: 8rem;
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

	.slider :global(.noUi-value-horizontal) {
		-webkit-transform: translate(-50%, 25px);
		transform: translate(-50%, 25px);
		writing-mode: vertical-lr;
	}
	.slider :global(.noUi-tooltip) {
		display: none;
	}
	.slider :global(.noUi-active .noUi-tooltip) {
		display: block;
	}
</style>

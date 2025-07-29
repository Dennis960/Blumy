<script lang="ts">
	import { goto } from '$app/navigation';
	import { route } from '$lib/ROUTES';
	import { clientApi } from '$lib/client/api';
	import { defaultSensorConfig, MAX_FIELD_CAPACITY } from '$lib/client/config';
	import WaterCapacityDistribution from '$lib/components/graphs/water-capacity-distribution.svelte';
	import Slider, { type SliderOptions } from '$lib/components/slider.svelte';
	import { funnyPlantNames } from '$lib/funny-plant-names';
	import type {
		SensorConfigurationDTO,
		SensorCreatedDTO,
		SensorDTO,
		SensorValueDistributionDTO
	} from '$lib/types/api';
	import loadImage from 'blueimp-load-image';
	import { PipsMode } from 'nouislider';
	import { onMount, type Snippet } from 'svelte';
	import CopyText from './copy-text.svelte';
	import SensorImage from './sensor-image.svelte';

	let {
		sensor = undefined,
		sensorValueDistribution = undefined,
		shareLink = undefined,
		error = undefined,
		createdSensor = $bindable(undefined),
		formActions,
		onSensorCreate
	}: {
		sensor?: SensorDTO;
		sensorValueDistribution?: SensorValueDistributionDTO;
		shareLink?: string;
		error?: string;
		createdSensor?: SensorCreatedDTO;
		formActions?: Snippet<[{ submitting: boolean }]>;
		onSensorCreate?: (sensor: SensorCreatedDTO) => void;
	} = $props();

	let initialConfig: SensorConfigurationDTO =
		sensor?.config != undefined
			? { ...sensor.config }
			: {
					...defaultSensorConfig,
					name: funnyPlantNames[Math.floor(Math.random() * funnyPlantNames.length)]
				};

	let sliderOptions: SliderOptions | undefined = $state();
	let image: HTMLImageElement | undefined = $state(undefined);
	let sliderValues: (number | string)[] = $state([]);

	let permanentWiltingPoint = $state(initialConfig.permanentWiltingPoint);
	let lowerThreshold = $state(initialConfig.lowerThreshold * MAX_FIELD_CAPACITY);
	let upperThreshold = $state(initialConfig.upperThreshold * MAX_FIELD_CAPACITY);
	let fieldCapacity = $state(initialConfig.fieldCapacity);

	let submitting = $state(false);

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

	async function handleImageInput(e: Event) {
		const target = e.target as HTMLInputElement;
		if (!target.files || !target.files[0]) {
			return;
		}
		const file = target.files[0];

		loadImage(
			file,
			(canvas: HTMLCanvasElement | HTMLImageElement | Event) => {
				if (canvas instanceof HTMLCanvasElement) {
					canvas.toBlob((blob) => {
						if (blob) {
							const url = URL.createObjectURL(blob);
							image = new Image();
							image.src = url;
						}
					}, file.type);
				} else if (canvas instanceof HTMLImageElement) {
					image = canvas;
				}
			},
			{
				canvas: true,
				orientation: true,
				meta: true
			}
		);
	}

	async function handleSubmit(event: {
		currentTarget: EventTarget & HTMLFormElement;
		preventDefault: () => void;
	}) {
		event.preventDefault();
		if (submitting) return;
		submitting = true;
		try {
			const data = new FormData(event.currentTarget);

			if (sensor?.id !== undefined) {
				const apiCall = clientApi().sensors().withId(sensor.id).update(data);
				if ((await apiCall.response()).ok) {
					goto(route('/dashboard/sensor/[id=sensorId]', { id: sensor.id.toString() }), {
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
		} finally {
			submitting = false;
		}
	}

	async function deleteSensor() {
		if (!sensor?.id) {
			return;
		}
		if (
			window.confirm(
				'Soll der Sensor wirklich gelöscht werden? Dieser Prozess kann nicht rückgängig gemacht werden.'
			)
		) {
			await clientApi().sensors().withId(sensor.id).delete().response();
			goto(route('/'));
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
								<SensorImage class="avatar avatar-2xl mb-2" {sensor} />
							{/if}
							<input
								type="file"
								accept="image/*"
								class="form-control"
								id="image"
								name="image"
								onchange={handleImageInput}
								required={image === undefined}
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

					{#if sensor?.writeToken}
						<div class="row mb-3">
							<div class="col-md-6 col-lg-4 col-12">
								<CopyText
									label="Zugangsschlüssel"
									hint="Kopiere den Zugangsschlüssel zur Einrichtung des Sensors."
									value={sensor.writeToken}
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

					{#if sensor?.id}
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
							{@render formActions?.({ submitting })}
							<button type="submit" class="btn btn-primary" disabled={submitting}>Speichern</button>
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

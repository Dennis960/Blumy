<script lang="ts">
	import { goto } from '$app/navigation';
	import { fetchSensor, fetchSensorValueDistribution, submitSensorConfig } from '$lib/api.js';
	import Slider, { type SliderOptions } from '$lib/components/slider.svelte';
	import WaterCapacityDistribution from '$lib/components/water-capacity-distribution.svelte';
	import type { SensorConfigurationDTO } from '$lib/types/api.js';
	import { createQuery, useQueryClient } from '@tanstack/svelte-query';
	import { onMount } from 'svelte';

	export let data;

	let sliderOptions: SliderOptions;

	let config: SensorConfigurationDTO;

	onMount(async () => {
		const sensor = await fetchSensor(data.id);
		config = sensor.config;
		sliderOptions = {
			start: [
				config.permanentWiltingPoint,
				config.lowerThreshold * config.fieldCapacity,
				config.upperThreshold * config.fieldCapacity,
				config.fieldCapacity
			],
			connect: true,
			range: { min: [0], max: [1024] },
			pips: {
				mode: 'values' as any,
				density: 3,
				values: [0, 250, 500, 750, 1000]
			}
		};
	});

	function handleSliderInput(e: CustomEvent) {
		const [permanentWiltingPoint, lowerThreshold, upperThreshold, fieldCapacity] =
			e.detail.values.map((v: string) => Math.floor(parseFloat(v)));
		config = {
			...config,
			permanentWiltingPoint,
			lowerThreshold: lowerThreshold / fieldCapacity,
			upperThreshold: upperThreshold / fieldCapacity,
			fieldCapacity
		};
	}

	function handleImageInput(e: Event) {
		const reader = new FileReader();
		reader.onload = (e: ProgressEvent<FileReader>) => {
			const imageUrl = e.target?.result as string;
			config = {
				...config,
				imageUrl
			};
		};

		const target = e.target as HTMLInputElement;
		if (target.files == undefined || target.files[0] == undefined) {
			return;
		}
		reader.readAsDataURL(target.files[0]);
	}

	let error: string;

	const queryClient = useQueryClient();
	async function handleSubmit() {
		try {
			config = await submitSensorConfig(data.id, config);
		} catch (e) {
			console.error(e);
			error = `${e}`;
			return;
		}
		queryClient.invalidateQueries(['sensor', data.id]);
		goto(`/sensor/${data.id}`);
	}

	$: valueDistributionQuery = createQuery({
		queryKey: ['sensor-value-distribution', data.id],
		queryFn: () => fetchSensorValueDistribution(data.id),
		refetchInterval: 15 * 60 * 1000
	});
</script>

<div class="page-header">
	<div class="container">
		<div class="row row-gap-3 align-items-center">
			<div class="col-12">
				{#if config != undefined}
					<form on:submit={handleSubmit}>
						<section class="card">
							<div class="card-header">
								<h1 class="card-title">Sensor-Einstellungen</h1>
							</div>
							<div class="card-body">
								<div class="row mb-3">
									<div class="col-12 col-md-6 col-lg-4">
										<label for="name" class="form-label">Name</label>
										<input type="text" class="form-control" id="name" bind:value={config.name} />
									</div>
								</div>

								<div class="row mb-3">
									<div class="col-12 col-md-6 col-lg-4">
										<label for="image" class="form-label">Foto</label>
										<span
											class="avatar avatar-2xl mb-2"
											style="background-image: url({config.imageUrl})"
										/>
										<input
											type="file"
											accept="image/*"
											class="form-control"
											id="image"
											name="image"
											on:change={handleImageInput}
											required={config.imageUrl == undefined}
											capture="environment"
										/>
									</div>
								</div>

								<div class="row mb-3">
									<div class="col-12 col-md-6 col-lg-4">
										<label for="slider" class="form-label">Schwellwerte</label>
										{#if $valueDistributionQuery.data != undefined && sliderOptions != undefined}
											<div class="my-2 slider">
												<WaterCapacityDistribution
													sensorValueDistribution={$valueDistributionQuery.data}
													sensorConfig={config}
												/>
												<div>
													<Slider options={sliderOptions} on:input={handleSliderInput} />
												</div>
											</div>
										{/if}
										<small class="form-hint">
											Setze minimale und maximale akzeptable Sensorwerte und Schwellwerte für Unter-
											und Überwässerung.
										</small>
									</div>
									{#if error != undefined}
										<div class="mt-3 alert alert-danger" role="alert">
											{error}
										</div>
									{/if}
								</div>

								<div class="card-footer text-end">
									<div class="d-flex justify-content-end column-gap-2">
										<a href={`/sensor/${data.id}`} class="btn btn-link">Abbrechen</a>
										<button type="submit" class="btn btn-primary">Speichern</button>
									</div>
								</div>
							</div>
						</section>
					</form>
				{/if}
			</div>
		</div>
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

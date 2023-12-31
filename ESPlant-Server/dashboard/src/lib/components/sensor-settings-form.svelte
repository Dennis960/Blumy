<script lang="ts">
	import Slider, { type SliderOptions } from '$lib/components/slider.svelte';
	import WaterCapacityDistribution from '$lib/components/water-capacity-distribution.svelte';
	import { funnyPlantNames } from '$lib/funny-plant-names';
	import type { SensorConfigurationDTO, SensorValueDistributionDTO } from '$lib/types/api.js';
	import { createEventDispatcher, onMount } from 'svelte';

	const dispatch = createEventDispatcher();
    export let config: SensorConfigurationDTO|undefined = undefined;
    export let sensorValueDistribution: SensorValueDistributionDTO|undefined = undefined;
    export let error: string|undefined = undefined;

    let editingConfig: SensorConfigurationDTO = config != undefined ? { ...config } : {
        name: funnyPlantNames[Math.floor(Math.random() * funnyPlantNames.length)],
        imageUrl: undefined,
        fieldCapacity: 1024,
        permanentWiltingPoint: 1024 * 0.3,
        upperThreshold: 0.8,
        lowerThreshold: 0.2,
    };

	let sliderOptions: SliderOptions;

	onMount(async () => {
		sliderOptions = {
			start: [
				editingConfig.permanentWiltingPoint,
				editingConfig.lowerThreshold * editingConfig.fieldCapacity,
				editingConfig.upperThreshold * editingConfig.fieldCapacity,
				editingConfig.fieldCapacity
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
		editingConfig = {
			...editingConfig,
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
			editingConfig = {
				...editingConfig,
				imageUrl
			};
		};

		const target = e.target as HTMLInputElement;
		if (target.files == undefined || target.files[0] == undefined) {
			return;
		}
		reader.readAsDataURL(target.files[0]);
	}

	function handleSubmit() {
        dispatch('submit', { value: editingConfig });
	}
</script>

<div class="row row-gap-3 align-items-center">
    <div class="col-12">
        <form on:submit={handleSubmit}>
            <section class="card">
                <div class="card-header">
                    <h1 class="card-title">Sensor-Einstellungen</h1>
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-12 col-md-6 col-lg-4">
                            <label for="name" class="form-label">Name</label>
                            <input type="text" class="form-control" id="name" bind:value={editingConfig.name} />
                        </div>
                    </div>

                    <div class="row mb-3">
                        <div class="col-12 col-md-6 col-lg-4">
                            <label for="image" class="form-label">Foto</label>
                            <span
                                class="avatar avatar-2xl mb-2"
                                style="background-image: url({editingConfig.imageUrl})"
                            />
                            <input
                                type="file"
                                accept="image/*"
                                class="form-control"
                                id="image"
                                name="image"
                                on:change={handleImageInput}
                                required={editingConfig.imageUrl == undefined}
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
                                            sensorValueDistribution={sensorValueDistribution}
                                            sensorConfig={editingConfig}
                                        />
                                    {/if}
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
                            <slot name="form-actions"></slot>
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

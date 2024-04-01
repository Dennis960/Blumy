<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { fetchSensor, fetchSensorValueDistribution, updateSensorConfig } from '$lib/api.js';
	import SensorSettingsForm from '$lib/components/sensor-settings-form.svelte';
	import type { SensorConfigurationDTO } from '$lib/types/api.js';
	import { createQuery, useQueryClient } from '@tanstack/svelte-query';
	import { onMount } from 'svelte';

	export let data;

	let config: SensorConfigurationDTO;
	let token: string;

	onMount(async () => {
		const sensor = await fetchSensor(data.id);
		config = sensor.config;
		token = sensor.token;
	});

	let error: string;

	const queryClient = useQueryClient();
	async function handleSubmit(e: CustomEvent) {
		try {
			config = await updateSensorConfig(data.id, e.detail.value);
		} catch (e) {
			console.error(e);
			error = `${e}`;
			return;
		}
		queryClient.invalidateQueries({ queryKey: ['sensor', data.id] });
		goto(`${base}/sensor/${data.id}`);
	}

	$: valueDistributionQuery = createQuery({
		queryKey: ['sensor-value-distribution', data.id],
		queryFn: () => fetchSensorValueDistribution(data.id),
		refetchInterval: 15 * 60 * 1000
	});
</script>

<div class="page-header">
	<div class="container">
		{#if config != undefined}
			<SensorSettingsForm
				config={config}
				error={error}
				token={token}
				sensorValueDistribution={$valueDistributionQuery.data}
				on:submit={handleSubmit}
			>
				<a slot="form-actions" href={`${base}/sensor/${data.id}`} class="btn btn-link">Abbrechen</a>
			</SensorSettingsForm>
		{/if}
	</div>
</div>
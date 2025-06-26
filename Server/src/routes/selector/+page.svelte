<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { setupSensorOnLocalEsp } from '$lib/api.js';
	import { authenticationModalStore } from '$lib/components/modals/AuthenticateModal.svelte';
	import SensorSelectionCard from '$lib/components/sensor-selection-card.svelte';
	import { IconPlus } from '$lib/icons.js';
	import type { SensorDTO } from '$lib/types/api.js';
	import { onMount } from 'svelte';

	let { data } = $props();
	let error: string | undefined = $state();
	let sensorClicked = $state(false);

	async function sensorClick(sensor: SensorDTO) {
		sensorClicked = true;
		const redirectUrl = $page.url.searchParams.get('redirect');
		if (!redirectUrl) {
			error =
				'Ein Fehler ist aufgetreten. Bitte verbinde dich mit dem Sensor und versuche es erneut.';
			return;
		}
		setupSensorOnLocalEsp(sensor.writeToken, redirectUrl);
	}

	async function createNewSensor() {
		await goto('/selector/sensor/new?' + $page.url.searchParams.toString());
	}

	onMount(() => {
		console.log(data);

		if (!data.authenticated) {
			authenticationModalStore.set({
				authenticationType: 'login'
			});
		}
	});
</script>

{#if data.authenticated}
	<div class="page-body">
		<div class="container-xl">
			{#if !error}
				{#if !sensorClicked}
					<h2>Wähle einen Sensor aus</h2>
					<div class="datagrid">
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<section
							onclick={createNewSensor}
							class="card bg-secondary cursor-pointer text-center text-white"
						>
							<div
								class="card-body d-flex flex-column align-items-center justify-content-center gap-4"
							>
								<IconPlus size={60}></IconPlus>
								<div class="card-title">
									<strong> Neuen Sensor einrichten</strong>
								</div>
							</div>
						</section>
						{#each data.sensors as sensor (sensor.id)}
							<SensorSelectionCard
								on:click={() => {
									sensorClick(sensor);
								}}
								{sensor}
							/>
						{/each}
					</div>
				{:else}
					<h2>Der Sensor wird nun eingerichtet, bitte warten...</h2>
				{/if}
			{:else}
				<h2>Ein Fehler ist aufgetreten</h2>
				<p>{error}</p>
			{/if}
		</div>
	</div>
{:else}
	<button
		onclick={() => authenticationModalStore.set({ authenticationType: 'login' })}
		class="btn btn-primary"
		data-bs-toggle="modal"
		data-bs-target="#authentication-modal"
	>
		Login
	</button>
{/if}

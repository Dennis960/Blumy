<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { clientApi } from '$lib/client/api.js';
	import LoginButtonGoogle from '$lib/components/LoginButtonGoogle.svelte';
	import { authenticationModalStore } from '$lib/components/modals/AuthenticateModal.svelte';
	import SensorSelectionCard from '$lib/components/sensor-selection-card.svelte';
	import { IconPlus } from '$lib/icons.js';
	import { currentSp, route } from '$lib/ROUTES.js';
	import type { SensorDTO } from '$lib/types/api.js';

	let { data } = $props();
	let error: string | undefined = $state();
	let sensorClicked = $state(false);

	async function sensorClick(sensor: SensorDTO) {
		sensorClicked = true;
		const redirectUrl = page.url.searchParams.get('redirect');
		if (!redirectUrl) {
			error =
				'Ein Fehler ist aufgetreten. Bitte verbinde dich mit dem Sensor und versuche es erneut.';
			return;
		}
		clientApi().setupSensorOnLocalEsp(sensor.writeToken, redirectUrl);
	}

	async function createNewSensor() {
		await goto(route('/selector/sensor/new') + `?${page.url.searchParams.toString()}`);
	}
</script>

<div class="page-body">
	<div class="container-xl">
		{#if data.authenticated}
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
								onclick={() => {
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
		{:else}
			<div class="d-flex flex-column align-items-center mt-5">
				<p class="mb-4">Bitte melde dich an, um fortzufahren.</p>
				<div class="d-flex mb-3 gap-3">
					<button
						onclick={() => authenticationModalStore.set({ authenticationType: 'login' })}
						class="btn btn-primary px-4 py-2"
						data-bs-toggle="modal"
						data-bs-target="#authentication-modal"
					>
						<span class="fw-bold">Login</span>
					</button>
					<button
						onclick={() => authenticationModalStore.set({ authenticationType: 'register' })}
						class="btn btn-secondary px-4 py-2"
						data-bs-toggle="modal"
						data-bs-target="#authentication-modal"
					>
						<span class="fw-bold">Registrieren</span>
					</button>
				</div>
				<LoginButtonGoogle />
			</div>
		{/if}
	</div>
</div>

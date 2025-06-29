<script lang="ts">
	import { clientApi } from '$lib/client/api';

	let email = '';
	let message = '';

	async function joinWaitingList() {
		// Placeholder for actual logic (e.g., API call)
		if (email.trim() === '' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			message = 'Bitte gib eine gültige E-Mail-Adresse ein.';
			return;
		}
		const apiCall = clientApi().waitingList().join(email);
		const ok = (await apiCall.response()).ok;
		if (!ok) {
			message = 'Deine E-Mail-Adresse ist bereits eingetragen.';
			return;
		}
		message = 'Danke! Du wurdest zur Warteliste hinzugefügt.';
		email = '';
	}
</script>

<div class="container py-5">
	<div class="row justify-content-center">
		<div class="col-md-6">
			<div class="card shadow">
				<img src="/blumy/Blumy.jpg" class="card-img-top" alt="Blumy Pflanzensensor" />
				<div class="card-body">
					<h2 class="card-title">Blumy Pflanzensensor</h2>
					<p class="card-text">
						Überwache die Gesundheit deiner Pflanzen mit Blumy. Misst Feuchtigkeit, Temperatur und
						Licht. Sendet Daten und Benachrichtigungen über WLAN. Unterstützt Home
						Assistant-Integration.
					</p>
					<h4 class="text-success">Preis noch nicht verfügbar</h4>
					<hr />
					<div class="mt-3">
						<label for="email" class="form-label">
							Benachrichtigung bekommen, sobald das Produkt verfügbar ist:
						</label>
						<div class="input-group">
							<input
								id="email"
								type="email"
								class="form-control"
								bind:value={email}
								placeholder="E-Mail-Adresse"
							/>
							<button class="btn btn-success" on:click={joinWaitingList}>
								Der Warteliste beitreten
							</button>
						</div>
						{#if message}
							<div class="alert alert-info mt-2">{message}</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

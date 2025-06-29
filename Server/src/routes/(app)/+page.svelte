<script lang="ts">
	import { route } from '$lib/ROUTES';

	const tutorials = [
		{
			title: 'Erste Schritte',
			href: route('/tutorials/getting-started'),
			desc: 'Packe deinen Blumy-Sensor aus und nimm ihn in wenigen Minuten in Betrieb.'
		},
		{
			title: 'Home Assistant Integration',
			href: route('/tutorials/home-assistant'),
			desc: 'Integriere Blumy in Home Assistant für Smart-Home-Automatisierung.'
		}
	];

	const components = [
		{ name: 'Kapazitiver Bodenfeuchtigkeitssensor', detail: 'Akkurate Messung der Bodenfeuchte' },
		{
			name: 'Temperatur- & Luftfeuchtigkeitssensor',
			detail: 'AHT20 Temperatur und Luftfeuchtigkeitssensor'
		},
		{ name: 'Lichtsensor', detail: 'ALS-PT19 analoger Lichtsensor' },
		{
			name: 'Mikrocontroller',
			detail: 'ESP32-C6 Mini, WLAN-fähiger Mikrokontroller, das neuste Modell von Espressif'
		},
		{ name: 'Gehäuse', detail: 'Kunststoffgehäuse' },
		{
			name: 'Stromversorgung',
			detail:
				'Batteriebetrieben mit 2 AAA Batterien für eine Laufzeit von bis zu 2 Jahren (abhängig von der Messhäufigkeit und WLAN-Stärke)'
		}
	];
</script>

<div class="page-body bg-light min-vh-100 d-flex align-items-center">
	<div class="container-xl">
		<div class="row justify-content-center">
			<div class="col-xl-12 col-xl-9">
				<div class="card border-0 text-start shadow-sm">
					<div class="card-body py-5">
						<div class="row row-cols-1 row-cols-md-2 align-items-center g-4 mb-4">
							<div class="col d-flex justify-content-start">
								<img
									src="/blumy/Blumy.jpg"
									alt="Pflanzensensor"
									class="rounded-4 w-100 shadow-lg"
									style="max-width: 320px; object-fit: contain;"
								/>
							</div>
							<div class="col text-md-start d-flex flex-column justify-content-center">
								<h1 class="fw-bold mb-3">Das ist Blumy</h1>
								<p class="text-muted fs-4 mb-4">
									Der ultimative smarte Pflanzensensor für alle Pflanzenliebhaber. Blumy überwacht
									Bodenfeuchte, Temperatur und Licht – damit deine Pflanzen gedeihen.<br />
									Blumy schickt dir Benachrichtigungen, wenn deine Pflanzen Wasser brauchen.
								</p>
								<ul class="list-unstyled mb-0 text-start" style="max-width: 350px;">
									<li>🌱 Überwachung der Bodenfeuchte</li>
									<li>🌡️ Messung von Temperatur und Luftfeuchtigkeit</li>
									<li>💡 Lichtintensitätsmessung</li>
									<li>📱 Benachrichtigungen auf dein Handy</li>
									<li><strong>🏡 Smart-Home-Integration mit Home Assistant</strong></li>
								</ul>
							</div>
						</div>
						<div class="row row-cols-1 row-cols-md-2 align-items-center g-4 mb-4">
							<div class="col d-flex justify-content-start">
								<img
									src="/blumy/Dashboard.png"
									alt="Sensor App"
									class="rounded-3 w-100 shadow-sm"
									style="max-width: 240px; object-fit: contain;"
								/>
							</div>
							<div
								class="col text-md-start d-flex flex-column justify-content-center"
								style="max-width: 350px;"
							>
								<h4 class="fw-semibold mb-2">Alles im Blick mit dem Blumy Dashboard</h4>
								<p class="text-muted mb-2">
									Im übersichtlichen Dashboard siehst du alle Messwerte deiner Pflanzen auf einen
									Blick. So weißt du immer, wie es deinen Pflanzen geht und kannst rechtzeitig
									reagieren.
								</p>
								<a href={route('/dashboard')} class="btn btn-primary mt-2">Dashboard öffnen</a>
							</div>
						</div>
					</div>
				</div>

				<div class="mt-5">
					<h3 class="h2 mb-4 text-center">So nutzt du Blumy</h3>
					<div class="row g-3">
						{#each tutorials as tutorial}
							<div class="col-md-6 col-lg-4 col-12">
								<a href={tutorial.href} class="card text-decoration-none h-100 shadow-sm">
									<div class="card-body">
										<h5 class="card-title text-primary text-decoration-underline">
											{tutorial.title}
										</h5>
										<p class="card-text text-muted">{tutorial.desc}</p>
									</div>
								</a>
							</div>
						{/each}
					</div>
				</div>

				<div class="mt-5 text-center">
					<h3 class="h2 mb-3">Blumy kaufen</h3>
					<p class="text-muted mb-3">
						Hole dir jetzt deinen eigenen Blumy-Sensor und bringe deine Pflanzenpflege auf das
						nächste Level!
					</p>
					<a href={route('/shop')} class="btn btn-success btn-lg px-4"> Zum Shop </a>
				</div>

				<div class="card mt-5 border-0 shadow-sm">
					<div class="card-body">
						<h3 class="card-title mb-3 text-center">Produktdetails & Komponenten</h3>
						<ul class="list-group list-group-flush">
							{#each components as comp}
								<li
									class="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-1"
								>
									<span class="fw-semibold">{comp.name}</span>
									<span class="text-muted small text-md-end">{comp.detail}</span>
								</li>
							{/each}
						</ul>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<script>
	import { env as publicEnv } from "$env/dynamic/public";

</script>
<div class="container py-5">
	<div class="row justify-content-center">
		<div class="col-md-8">
			<div class="card shadow-sm">
				<div class="card-header">
					<h1 class="card-title mb-0">Impressum</h1>
				</div>
				<div class="card-body">
					<h2 class="h4">Angaben gemäß § 5 TMG</h2>
					<p>
						{publicEnv.PUBLIC_IMPRESSUM_NAME}<br />
						{publicEnv.PUBLIC_IMPRESSUM_ADDRESS}<br />
						{publicEnv.PUBLIC_IMPRESSUM_CITY}<br />
						{publicEnv.PUBLIC_IMPRESSUM_COUNTRY}
					</p>

					<h2 class="h4 mt-4">Kontakt</h2>
					<p>
						E-Mail: <a href="mailto:support@paramecad.com">support@paramecad.com</a>
					</p>

					<h2 class="h4 mt-4">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
					<p>
						{publicEnv.PUBLIC_IMPRESSUM_NAME}<br />
						{publicEnv.PUBLIC_IMPRESSUM_ADDRESS}<br />
						{publicEnv.PUBLIC_IMPRESSUM_CITY}<br />
						{publicEnv.PUBLIC_IMPRESSUM_COUNTRY}
					</p>

					<h2 class="h4 mt-4">Haftungsausschluss</h2>
					<p>
						Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte
						externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber
						verantwortlich.
					</p>

					<h2 class="h4 mt-4">Urheberrecht</h2>
					<p>
						Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
						dem deutschen Urheberrecht. Beiträge Dritter sind als solche gekennzeichnet.
					</p>
				</div>
			</div>
		</div>
	</div>
</div>

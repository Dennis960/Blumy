<script lang="ts">
	import SensorImageGallery from '$lib/components/sensor-image-gallery.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.sensor.config.name} - Sensor Bildergalerie</title>
</svelte:head>

<main class="container py-4">
	<div class="row justify-content-center">
		<div class="col-md-8">
			<SensorImageGallery sensor={data.sensor} />
		</div>
	</div>
</main>

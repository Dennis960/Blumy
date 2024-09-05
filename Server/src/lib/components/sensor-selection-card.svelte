<script lang="ts">
	import type { SensorDTO } from '$lib/types/api';
	import Base64Image from './base64-image.svelte';

	export let sensor: SensorDTO;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<section on:click class="card cursor-pointer">
	<div>
		<Base64Image
			class="ratio ratio-1x1 d-block bg-cover rounded-start-1"
			imageBase64={sensor.config.imageBase64}
		/>
	</div>
	<div class="card-body flex-column">
		<h1 class="card-title text-nowrap text-center text-truncate">
			<strong>{sensor.config.name}</strong>
		</h1>
	</div>
</section>

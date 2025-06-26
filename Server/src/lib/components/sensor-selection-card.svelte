<script lang="ts">
	import { createBubbler } from 'svelte/legacy';

	const bubble = createBubbler();
	import type { SensorDTO } from '$lib/types/api';
	import Base64Image from './base64-image.svelte';

	interface Props {
		sensor: SensorDTO;
	}

	let { sensor }: Props = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<section onclick={bubble('click')} class="card cursor-pointer">
	<div>
		<Base64Image
			class="ratio ratio-1x1 d-block rounded-start-1 bg-cover"
			imageBase64={sensor.config.imageBase64}
		/>
	</div>
	<div class="card-body flex-column">
		<h1 class="card-title text-truncate text-center text-nowrap">
			<strong>{sensor.config.name}</strong>
		</h1>
	</div>
</section>

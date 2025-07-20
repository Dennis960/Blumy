<script lang="ts">
	import type { SensorDTO } from '$lib/types/api';
	import { onMount } from 'svelte';
	import Base64Image from './base64-image.svelte';

	interface Props {
		sensor: SensorDTO;
		onclick?: () => void;
	}

	let { sensor, onclick }: Props = $props();

	let imageBase64: string = $state('');

	onMount(() => {
		(async () => {
			// Loading image async in onMount to make the page load faster
			imageBase64 = sensor.config.imageBase64 || '';
		})();
	});
</script>

<button {onclick} class="card m-0 p-0">
	<div>
		<Base64Image class="ratio ratio-1x1 d-block rounded-start-1 bg-cover" {imageBase64} />
	</div>
	<div class="card-body flex-column">
		<h1 class="card-title text-truncate text-nowrap text-center">
			<strong>{sensor.config.name}</strong>
		</h1>
	</div>
</button>

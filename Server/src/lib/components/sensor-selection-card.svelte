<script lang="ts">
	import type { SensorDTO } from '$lib/types/api';
	import SensorImage from './sensor-image.svelte';

	interface Props {
		sensor: SensorDTO;
		onclick?: () => void;
	}

	let { sensor, onclick }: Props = $props();
</script>

<button {onclick} class="card m-0 p-0">
	<div>
		<SensorImage class="ratio ratio-1x1 d-block rounded-start-1 bg-cover" {sensor} />
	</div>
	<div class="card-body flex-column">
		<h1 class="card-title text-truncate text-nowrap text-center">
			<strong>{sensor.config.name}</strong>
		</h1>
	</div>
</button>

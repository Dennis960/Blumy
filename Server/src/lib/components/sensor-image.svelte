<script lang="ts">
	import { clientApi } from '$lib/client/api';
	import type { SensorDTO } from '$lib/types/api';

	interface Props {
		sensor: SensorDTO;
		clickable?: boolean;
		style?: string | undefined;
		class?: string | undefined;
	}

	let { sensor, style = undefined, class: clazz, clickable = false }: Props = $props();

	const url = $derived(
		clientApi(null!)
			.sensors()
			.withId(sensor.id)
			.getImage(sensor.images[0].id, sensor.canEdit ? undefined : sensor.readToken).url
	);
</script>

{#if clickable}
	<a
		href={url}
		class={clazz}
		style="background-image: url({url}); {style ?? ''}"
		aria-label="Sensor image"
	></a>
{:else}
	<span class={clazz} style="background-image: url({url}); {style ?? ''}"></span>
{/if}

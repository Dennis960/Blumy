<script lang="ts">
	import { clientApi } from '$lib/client/api';
	import { route } from '$lib/ROUTES';
	import type { SensorDTO } from '$lib/types/api';

	interface Props {
		sensor: SensorDTO;
		clickable?: boolean;
		style?: string | undefined;
		class?: string | undefined;
	}

	let { sensor, style = undefined, class: clazz, clickable = false }: Props = $props();

	const url =
		route('/dashboard/sensor/[id=sensorId]/image-gallery', { id: sensor.id.toString() }) +
		`?token=${sensor.readToken}`;
	const imageUrl = $derived(
		sensor.images.length > 0
			? clientApi(null!)
					.sensors()
					.withId(sensor.id)
					.getImage(sensor.images[0].id, sensor.canEdit ? undefined : sensor.readToken).url
			: null
	);
</script>

{#if clickable}
	<a
		href={url}
		class={clazz}
		style="background-image: url({imageUrl}); {style ?? ''}"
		aria-label="Sensor image"
	></a>
{:else}
	<span class={clazz} style="background-image: url({imageUrl}); {style ?? ''}"></span>
{/if}

<script lang="ts">
	import { clientApi } from '$lib/client/api';
	import type { SensorDTO } from '$lib/types/api';

	interface Props {
		sensor?: SensorDTO | undefined;
		style?: string | undefined;
		class?: string | undefined;
	}

	let { sensor = undefined, style = undefined, class: clazz }: Props = $props();

	const emptyImage =
		'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAOElEQVR42mNkAAIAAAoAAv/lxKUAAAAASUVORK5CYII=';

	const url = $derived(
		sensor?.id
			? `${clientApi(null!).sensors().withId(sensor.id).getImage().url}?token=${sensor.readToken}`
			: emptyImage
	);
</script>

<span class={clazz} style="background-image: url({url}); {style ?? ''}"></span>

<script lang="ts">
	import { browser } from '$app/environment';

	interface Props {
		imageBase64?: string | undefined;
		style?: string | undefined;
		class?: string | undefined;
	}

	let { imageBase64 = undefined, style = undefined, class: clazz }: Props = $props();
	const emptyImage =
		'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAOElEQVR42mNkAAIAAAoAAv/lxKUAAAAASUVORK5CYII=';
	let imageUrl = $derived(`data:image/png;base64,${imageBase64 ?? emptyImage}`);
	let image: HTMLImageElement | undefined = $derived.by(() => {
		if (!browser) return undefined;
		const img = new Image();
		img.src = imageUrl;
		return img;
	});
</script>

<span class={clazz} style="background-image: url({imageUrl}); {style ?? ''}"></span>

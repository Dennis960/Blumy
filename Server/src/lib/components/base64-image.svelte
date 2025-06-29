<script lang="ts">
	import { run } from 'svelte/legacy';

	import { browser } from '$app/environment';

	interface Props {
		imageBase64?: string | undefined;
		style?: string | undefined;
		class?: string | undefined;
	}

	let { imageBase64 = undefined, style = undefined, class: clazz }: Props = $props();
	const emptyImage =
		'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAOElEQVR42mNkAAIAAAoAAv/lxKUAAAAASUVORK5CYII=';
	let image: HTMLImageElement | undefined = $state();
	let imageUrl = $derived(`data:image/png;base64,${imageBase64 ?? emptyImage}`);

	run(() => {
		if (browser && !image) {
			image = new Image();
		}
	});

	run(() => {
		if (browser && image) {
			image.src = imageUrl;
		}
	});
</script>

<span class={clazz} style="background-image: url({imageUrl}); {style ?? ''}"></span>

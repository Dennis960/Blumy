<script lang="ts">
	import { browser } from '$app/environment';

	export let imageBase64: string | undefined = undefined;
	export let style: string | undefined = undefined;
	const emptyImage =
		'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAOElEQVR42mNkAAIAAAoAAv/lxKUAAAAASUVORK5CYII=';
	let image: HTMLImageElement | undefined;
	$: imageUrl = `data:image/png;base64,${imageBase64 ?? emptyImage}`;

	$: if (browser && !image) {
		image = new Image();
	}

	$: if (browser && image) {
		image.src = imageUrl;
	}
</script>

<span {...$$restProps} style="background-image: url({imageUrl}); {style ?? ''}" />

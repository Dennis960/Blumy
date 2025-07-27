<script lang="ts">
	interface Props {
		imageBase64?: string | undefined;
		imageUrl?: string | undefined;
		style?: string | undefined;
		class?: string | undefined;
	}

	let {
		imageBase64 = undefined,
		imageUrl = undefined,
		style = undefined,
		class: clazz
	}: Props = $props();
	const emptyImage =
		'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAOElEQVR42mNkAAIAAAoAAv/lxKUAAAAASUVORK5CYII=';
	let base64Url = $derived(`data:image/png;base64,${imageBase64 ?? emptyImage}`);
	let url = $derived(imageBase64 ? base64Url : (imageUrl ?? base64Url));
</script>

<span class={clazz} style="background-image: url({url}); {style ?? ''}"></span>

<script lang="ts">
	let color: string = 'blue';
</script>

<div
	class={`flex items-start gap-3 rounded-lg border-l-4 bg-white p-4 shadow-md transition-all
    duration-300 dark:bg-gray-900
    border-${color}-500 text-${color}-700 dark:text-${color}-300
    `}
	role="alert"
>
	<div class="flex-shrink-0">
		<slot name="icon" />
	</div>
	<div class="flex-1 text-sm font-medium">
		<slot />
	</div>
</div>

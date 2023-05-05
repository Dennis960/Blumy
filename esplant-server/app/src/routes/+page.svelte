<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import Graph from "$lib/components/data-view/graph.svelte";
  import DurationPicker from "$lib/components/picker/duration-picker.svelte";
  import { DEFAULT_DURATION } from "$lib/constants";

  const durationParam = $page.url.searchParams.get("duration");
  let duration = durationParam
    ? Number.parseInt(durationParam)
    : DEFAULT_DURATION;
  $: if (duration !== DEFAULT_DURATION) {
    $page.url.searchParams.set("duration", duration.toString());
    goto($page.url);
  }

  const maxDataPointsParam = $page.url.searchParams.get("maxDataPoints");
  let maxDataPoints = maxDataPointsParam
    ? Number.parseInt(maxDataPointsParam)
    : document.body.clientWidth / 3;
</script>

<div class="page-container">
  <Graph {duration} {maxDataPoints} />
  <DurationPicker bind:duration />
</div>

<style>
  .page-container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 95vh;
    padding: 0 0 1rem 0;
  }
</style>

<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import Graph from "$lib/components/data-view/graph.svelte";
  import DurationPicker from "$lib/components/picker/duration-picker.svelte";
  import IdPicker from "$lib/components/picker/id-picker.svelte";
  import PropertyPicker from "$lib/components/picker/property-picker.svelte";
  import { DEFAULT_DURATION } from "$lib/constants";

  const durationParam = $page.url.searchParams.get("duration");
  let duration = durationParam
    ? Number.parseInt(durationParam)
    : DEFAULT_DURATION;
  $: if (duration) {
    $page.url.searchParams.set("duration", duration.toString());
    goto($page.url);
  }

  const idParam = $page.url.searchParams.get("id");
  let id = idParam ? Number.parseInt(idParam) : 1;
  $: if (id) {
    $page.url.searchParams.set("id", id.toString());
    goto($page.url);
  }

  const propertyParam = $page.url.searchParams.get("property");
  let property = propertyParam ? propertyParam : "Water";
  $: if (property) {
    $page.url.searchParams.set("property", property);
    goto($page.url);
  }

  const maxDataPointsParam = $page.url.searchParams.get("maxDataPoints");
  let maxDataPoints = maxDataPointsParam
    ? Number.parseInt(maxDataPointsParam)
    : document.body.clientWidth / 3;
</script>

<div class="page-container">
  <Graph {duration} {maxDataPoints} sensorAddress={id} {property} />
  <DurationPicker bind:duration />
  <IdPicker bind:id />
  <PropertyPicker bind:property />
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

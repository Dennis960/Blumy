<script lang="ts">
  import Picker from "$lib/components/picker/picker.svelte";

  export let property = "Water";
  let values = ["Water", "Power", "Duration", "Rssi", "Measurement Duration"];
  let valueDescriptions = values;
</script>

<Picker {values} bind:value={property} {valueDescriptions} icon={"Key.png"} />

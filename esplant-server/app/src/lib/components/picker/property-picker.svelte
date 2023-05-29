<script lang="ts">
  import { type DataKey, dataSchema } from "../../../../../api/types/data";
  import Picker from "$lib/components/picker/picker.svelte";

  export let property: DataKey = "water";
  let values = dataSchema.filter((schema) => schema.label).map((schema) => schema.name);
  let valueDescriptions = dataSchema.filter((schema) => schema.label).map((schema) => schema.label);
</script>

<Picker {values} bind:value={property} {valueDescriptions} icon={"Key.png"} />

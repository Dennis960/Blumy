<script lang="ts">
  import { DEFAULT_MAX_DATA_POINTS } from "$lib/constants";
  import { DataClient } from "$lib/data-client";
  import { defaultGraphOptions, deepSpread } from "$lib/graph";
  import type { RequestData } from "$types/api";
  import { onMount } from "svelte";
  import type { ApexOptions } from 'apexcharts';
  import ApexChart from "./apex-chart.svelte";
  import { type DataKey, dataSchema } from "../../../../../api/types/data";

  let chart: any;
  onMount(async () => {
    // @ts-ignore
    chart = (await import("svelte-apexcharts")).chart;
  });

  export let duration: number;
  export let maxDataPoints = DEFAULT_MAX_DATA_POINTS;
  export let sensorAddress: number;
  export let property: DataKey;

  let runtimeDataClient = new DataClient();
  let dataStore = runtimeDataClient.dataStore;

  let series: ApexAxisChartSeries = [];
  let options: ApexOptions = {};

  let dialog: HTMLDialogElement;
  type Data = {id: number, date: string, value: number};
  let selectedData: Data;
  let errorMessage: string = "";

  let autoReload = false;

  function updateSeries() {
    const schemaProperty = dataSchema.filter(
      (schema) => schema.name == property
    )[0];
    if (!schemaProperty) {
      return;
    }
    
    series = [
      {
        name: schemaProperty.label,
        data: $dataStore.map((data) => {
          return {
            x: new Date(data.date || 0),
            y: data[property],
            id: data.id
          };
        }),
        color: schemaProperty.color,
      },
      {
        name: "zero",
        data: $dataStore.map((data) => {
          return {
            x: new Date(data.date || 0),
            y: 0,
          };
        }),
        color: "transparent",
      },
    ];
    const graphOptions = deepSpread(defaultGraphOptions, {
      chart: {
        events: {
          click(event, chartContext, config) {
            const data = config.config.series[config.seriesIndex].data[config.dataPointIndex];
            onDataIdClick({
              id: data.id,
              date: new Date(data.x).toLocaleString(),
              value: data.y,
            });
          }
        },
      }})
    options = {
      ...graphOptions,
      series: series,
    };
  }

  function onDataIdClick(data: Data) {
    dialog.open = true;
    selectedData = data;
  }

  async function deleteSelectedData() {
    const res = await runtimeDataClient.deleteData(selectedData.id);
    if (!res.ok) {
      errorMessage = "Data could not be deleted: " + res.statusText;
    } else {
      runtimeDataClient.updateData();
      dialog.open = false;
    }
  }

  function updateData() {
    let runtimeDataRequest: RequestData = {
      sensorAddress: sensorAddress,
      maxDataPoints: maxDataPoints,
      startDate: Date.now() - duration,
      endDate: Date.now(),
    };
    runtimeDataClient.setOptions(runtimeDataRequest);
  }

  let reloadInterval: number;
  $: if (autoReload) {
    if (reloadInterval) {
      clearInterval(reloadInterval);
    }
    reloadInterval = setInterval(() => {
      updateData();
    }, 1000);
  } else {
    if (reloadInterval) {
      clearInterval(reloadInterval);
    }
  }

  $: if (duration) {
    updateData();
  }

  $: if (sensorAddress) {
    updateData();
  }

  $: if ($dataStore) {
    updateSeries();
  }

  $: if (property) {
    updateSeries();
  }
</script>

<ApexChart {options} />
<dialog bind:this={dialog}>
  {#if selectedData}
    <p>Folgender Datenpunkt wurde ausgewählt</p>
    <form action="#">
      <label for="data-id">ID</label>
      <input type="number" id="data-id" name="data-id" bind:value={selectedData.id} readonly />
      <label for="data-date">Datum</label>
      <input type="text" id="data-date" name="data-date" bind:value={selectedData.date} readonly />
      <label for="data-value">Wert</label>
      <input type="number" id="data-value" name="data-value" bind:value={selectedData.value} readonly />
      {#if errorMessage}
        <p class="error">{errorMessage}</p>
      {/if}
      <div class="buttons">
        <button type="button" on:click={() => dialog.open = false}>Schließen</button>
        <button type="button" on:click={deleteSelectedData}>Löschen</button>
      </div>
    </form>
  {/if}
</dialog>
<form class="reload">
  <label for="auto-reload">Auto-Reload</label>
  <input id="auto-reload" name="auto-reload" type="checkbox" bind:checked={autoReload} />
</form>

<style>
  input {
    color: black;
    width: 100%;
    height: 1rem;
  }
  p.error {
    color: red;
  }
  div.buttons {
    display: flex;
    flex-direction: row;
  }
  .reload {
    display: flex;
  }
  .reload label {
    width: 100px;
  }
  .reload input {
    width: 1rem;
  }
</style>
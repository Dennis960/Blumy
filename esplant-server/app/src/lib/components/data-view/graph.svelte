<script lang="ts">
  import { DEFAULT_MAX_DATA_POINTS } from "$lib/constants";
  import { DataClient } from "$lib/data-client";
  import { defaultGraphOptions } from "$lib/graph";
  import type { RequestData } from "$types/api";
  import { onMount } from "svelte";
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
  let options = {};

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
    options = {
      ...defaultGraphOptions,
      series: series,
    };
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

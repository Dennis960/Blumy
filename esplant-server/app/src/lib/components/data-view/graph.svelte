<script lang="ts">
  import type { ChartData } from "$lib/graph";
  import { DEFAULT_MAX_DATA_POINTS } from "$lib/constants";
  import { deepSpread, defaultGraphOptions } from "$lib/graph";
  import { DataClient } from "$lib/data-client";
  import { onMount } from "svelte";
  import ApexChart from "./apex-chart.svelte";
  import type { RequestData } from "$types/api";

  let chart: any;
  onMount(async () => {
    // @ts-ignore
    chart = (await import("svelte-apexcharts")).chart;
  });

  export let duration: number;
  export let maxDataPoints = DEFAULT_MAX_DATA_POINTS;

  let runtimeDataClient = new DataClient();
  let dataStore = runtimeDataClient.dataStore;

  let series: ApexAxisChartSeries = [];
  let options = {};

  function updateSeries() {
    series = [
      {
        name: "Water",
        data: $dataStore.map((data) => {
          return {
            x: new Date(data.date),
            y: data.water,
          };
        }),
      },
    ];
    options = {
      ...defaultGraphOptions,
      series: series,
    };
  }

  function updateData() {
    let runtimeDataRequest: RequestData = {
      sensorAddress: 4,
      maxDataPoints: maxDataPoints,
      startDate: Date.now() - duration,
      endDate: Date.now(),
    };
    runtimeDataClient.setOptions(runtimeDataRequest);
  }

  $: if (duration) {
    updateData();
  }

  $: if ($dataStore) {
    updateSeries();
  }
</script>

<ApexChart {options} />

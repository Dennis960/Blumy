<script lang="ts">
  import { DEFAULT_MAX_DATA_POINTS } from "$lib/constants";
  import { DataClient } from "$lib/data-client";
  import { defaultGraphOptions } from "$lib/graph";
  import type { RequestData } from "$types/api";
  import { onMount } from "svelte";
  import ApexChart from "./apex-chart.svelte";

  let chart: any;
  onMount(async () => {
    // @ts-ignore
    chart = (await import("svelte-apexcharts")).chart;
  });

  export let duration: number;
  export let maxDataPoints = DEFAULT_MAX_DATA_POINTS;
  export let sensorAddress: number;
  export let property: string;

  let runtimeDataClient = new DataClient();
  let dataStore = runtimeDataClient.dataStore;

  let series: ApexAxisChartSeries = [];
  let options = {};

  function updateSeries() {
    if (property == "Water") {
      series = [
        {
          name: "Water",
          data: $dataStore.map((data) => {
            return {
              x: new Date(data.date),
              y: data.water,
            };
          }),
          color: "#00FFFF",
        },
      ];
      options = {
        ...defaultGraphOptions,
        series: series,
      };
      return;
    } else if (property == "Power") {
      series = [
        {
          name: "Power",
          data: $dataStore.map((data) => {
            return {
              x: new Date(data.date),
              y: data.voltage * 100,
            };
          }),
          color: "#FF0000",
        },
      ];
      options = {
        ...defaultGraphOptions,
        series: series,
      };
      return;
    } else if (property == "Duration") {
      series = [
        {
          name: "Duration",
          data: $dataStore.map((data) => {
            return {
              x: new Date(data.date),
              y: data.duration,
            };
          }),
          color: "#00FF00",
        },
      ];
      options = {
        ...defaultGraphOptions,
        series: series,
      };
      return;
    } else if (property == "Rssi") {
      series = [
        {
          name: "Rssi",
          data: $dataStore.map((data) => {
            return {
              x: new Date(data.date),
              y: Math.abs(data.rssi),
            };
          }),
          color: "#00FF00",
        },
      ];
      options = {
        ...defaultGraphOptions,
        series: series,
      };
      return;
    } else if (property == "Measurement Duration") {
      series = [
        {
          name: "Measurement Duration",
          data: $dataStore.map((data) => {
            return {
              x: new Date(data.date),
              y: Math.abs(data.measurement_duration),
            };
          }),
          color: "#FFFF00",
        },
      ];
      options = {
        ...defaultGraphOptions,
        series: series,
      };
      return;
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

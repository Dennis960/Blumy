import type { ApiResponse, RequestData } from "$types/api";
import type { Data, DatabaseObject, Sensor } from "$api/types/types/data";
import { type Writable, writable, get } from "svelte/store";

export class DataClient {
  dataStore: Writable<Data[]>;
  options?: RequestData;
  optionsJson?: string;

  constructor() {
    this.dataStore = writable([]);
  }

  setOptions(options: RequestData, force = false) {
    if (!force && JSON.stringify(options) === this.optionsJson)
      return;
    fetchRuntimeData(options).then((data) => {
      this.dataStore.set(data)
    });
    this.options = options;
    this.optionsJson = JSON.stringify(options);
  }
}

async function fetchRuntimeData(options: RequestData): Promise<Data[]> {
  const { sensorAddress, endDate, maxDataPoints, startDate } = options;
  let url = `/api/sensors/${sensorAddress}/data?`;
  if (startDate) url += `&startDate=${startDate}`;
  if (endDate) url += `&endDate=${endDate}`;
  if (maxDataPoints) url += `&maxDataPoints=${maxDataPoints}`;

  let result = await fetch(url);

  if (!result.ok) {
    console.error(result);
    return [];
  }
  return (await result.json() as ApiResponse<Data[]>).data;
}
import type { DatabaseObject } from "$api/types/types/data";

export type ApiResponse<T extends DatabaseObject | DatabaseObject[]> = {
  message: string;
  data: T;
};

export type RequestData = {
  sensorAddress: number;
  startDate?: number;
  endDate?: number;
  maxDataPoints?: number;
};

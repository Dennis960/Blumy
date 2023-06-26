export type Sensor = {
  sensorAddress: number;
  name: string;
};

export type Data = {
  id?: number;
  sensorAddress: number;
  plantName: string;
  date?: number | string;
  water: number;
  voltage?: number;
  duration?: number;
  rssi?: number;
  measurementDuration?: number;
};

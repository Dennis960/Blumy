export type Sensor = {
  sensorAddress: number;
  name: string;
};

export type Data = {
  id: number;
  sensorAddress: number;
  date: number | string;
  water: number;
  voltage: number;
  duration: number;
  rssi: number;
  measurementDuration: number;
};

export type DatabaseObject = Sensor | Data;
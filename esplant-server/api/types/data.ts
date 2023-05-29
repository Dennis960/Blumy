export type Sensor = {
  sensor_address: number;
  name: string;
};
export type Data = {
  id: number;
  sensor_address: number;
  date: number;
  water: number;
  voltage: number;
  duration: number;
  rssi: number;
  measurement_duration: number;
};

export type FormattedData = {
  id: number;
  sensor_address: number;
  date: string;
  water: number;
  voltage: number;
  duration: number;
  rssi: number;
  measurement_duration: number;
}

export type DatabaseObject = Sensor | Data;
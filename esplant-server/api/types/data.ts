export type Sensor = {
  sensorAddress: number;
  name: string;
  fieldCapacity: number; // sensor unit
  permanentWiltingPoint: number;
  lowerThreshold: number; // relative to fieldCapacity
  upperThreshold: number;
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

export type Subscription = {
  id?: number;
  sensorAddress: number;
  lastNotification?: Date;
  endpoint: string;
  keys_p256dh: string;
  keys_auth: string;
};

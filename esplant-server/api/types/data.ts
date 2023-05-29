export type Sensor = {
  sensorAddress: number;
  name: string;
};

export type Data = {
  id?: number;
  sensorAddress: number;
  date?: number | string;
  water: number;
  voltage?: number;
  duration?: number;
  rssi?: number;
  measurementDuration?: number;
};

export type DataKey = keyof Data;

type Property = {
  name: DataKey;
  type: string[];
  color?: string;
  label?: string;
  required: boolean;
}

export const dataSchema: Property[] = [
  {
    name: "id",
    type: ["number"],
    required: false,
  },
  {
    name: "sensorAddress",
    type: ["number"],
    required: true,
  },
  {
    name: "date",
    type: ["number", "string"],
    required: false,
  },
  {
    name: "water",
    type: ["number"],
    color: "#00ffff",
    label: "Water",
    required: true,
  },
  {
    name: "voltage",
    type: ["number"],
    color: "#ff0000",
    label: "Voltage",
    required: false,
  },
  {
    name: "duration",
    type: ["number"],
    color: "#ffff00",
    label: "Duration",
    required: false,
  },
  {
    name: "rssi",
    type: ["number"],
    color: "#00ff00",
    label: "RSSI",
    required: false,
  },
  {
    name: "measurementDuration",
    type: ["number"],
    color: "#ffff00",
    label: "Measurement Duration",
    required: false,
  },
];

export type DatabaseObject = Sensor | Data;

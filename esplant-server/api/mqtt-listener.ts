import mqtt from 'mqtt';
import { addDataBySensorId, createSensorWithId, getSensorById } from './database.js';
import { Data } from './types/data.js';

const client = mqtt.connect(process.env.MQTT_URL || 'mqtt://localhost:1883');
client.on('connect', () => {
  console.log('connected to mqtt broker');
  client.subscribe('esplant/#', (err) => {
    if (err) {
      console.error('error subscribing to mqtt topic', err);
    }
  });
});

// same format as the POST API
client.on('message', async (topic, message) => {
  const body = message.toString();
  const data: Data = JSON.parse(body);
  // check if sensor exists
  let sensorExists = true;
  const sensor = await getSensorById(data.sensorAddress);
  if (!sensor) {
    sensorExists = false;
    // create sensor
    await createSensorWithId(data.sensorAddress);
  }
  await addDataBySensorId(data);
});
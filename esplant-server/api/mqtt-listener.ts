import mqtt from 'mqtt';
import { addDataBySensorId } from './database.js';

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
  const { sensorAddress, water, voltage, duration, rssi, measurementDuration } = JSON.parse(body);
  await addDataBySensorId(sensorAddress, water, voltage, duration, rssi, measurementDuration);
});
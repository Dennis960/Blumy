import mqtt from 'mqtt';
import SensorController from './controllers/SensorController.js';
import { LegacyESPSensorReadingDTO } from './entities/SensorReadingEntity.js';

const client = mqtt.connect(process.env.MQTT_URL || 'mqtt://localhost:1883');
client.on('connect', () => {
  console.log('connected to mqtt broker');
  client.subscribe('esplant/#', (err) => {
    if (err) {
      console.error('error subscribing to mqtt topic', err);
    }
  });
});

const sensorController = new SensorController();

// same format as the POST API
client.on('message', async (topic, message) => {
  const body = message.toString();
  try {
    const data: LegacyESPSensorReadingDTO = JSON.parse(body);
    await sensorController.addLegacySensorData(data);
  } catch (error) {
    console.error('error parsing mqtt message', error);
    console.log('message', body);
    return;
  }
});
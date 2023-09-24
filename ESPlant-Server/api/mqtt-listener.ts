import mqtt from 'mqtt';
import SensorController from './controllers/SensorController.js';
import SensorReadingEntity from './entities/SensorReadingEntity.js';

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
    const data: SensorReadingEntity = JSON.parse(body);
    await sensorController.addSensorData(data);
  } catch (error) {
    console.error('error parsing mqtt message', error);
    console.log('message', body);
    return;
  }
});
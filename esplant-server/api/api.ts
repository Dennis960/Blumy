import cors from 'cors';
import { json, Router } from 'express';
import { addDataBySensorId, createSensorWithId, getSensorById, getSensors, getDataBySensorId, deleteDataBySensorId, deleteSensorById, deleteDataById, updateSensorById } from './database.js';
import { Data, FormattedData } from './types/data.js';
import dateFormat from 'dateformat';
import mqtt from 'mqtt';

const router = Router();
router.use(json());
router.use(cors());

function formatDateData(data: Data[]): FormattedData[] {
  return data.map((data) => {
    if (!data.date) {
      return {
        ...data,
        date: 'unknown',
      }
    }
    const date = new Date(data.date);
    const formattedDate = dateFormat(date, 'dd.mm.yyyy HH:MM:ss');
    return {
      ...data,
      date: formattedDate,
    };
  });
}

// if req contains parameter format, dates will be formatted as DD.MM.YYYY HH:mm:ss and json will be pretty printed
router.use((req, res, next) => {
  const { format } = req.query;
  if (format) {
    const originalSend = res.send;
    res.send = function (data) {
      if (data.data) {
        if (Array.isArray(data.data)) {
          data.data = formatDateData(data.data);
        } else if (data.data.date) {
          data.data = formatDateData([data.data])[0];
        }
      }
      data = JSON.stringify(data, null, 2);
      res.setHeader('Content-Type', 'application/json');
      res.send = originalSend;
      return res.send(data);
    };
  }
  next();
});

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

// POST /api/data
// {
//   "sensorAddress": 1,
//   "water": 428,
//   "voltage": 3.234,
//   "duration": 2450,
//   "rssi": -45
//   "measurementDuration": 5000,
// }
// -> 400 message: sensorAddress and water are required, data: {}
// -> 500 message: could not create sensor, data: {}
// -> 200 message: data added, data: data
router.post('/data', async (req, res) => {
  const { sensorAddress, water, voltage, duration, rssi, measurementDuration } = req.body;
  if (sensorAddress == undefined || water == undefined) {
    return res.status(400).send({
      message: 'sensorAddress and water are required',
      data: {},
    });
  }
  // check if sensor exists
  let sensorExists = true;
  const sensor = await getSensorById(sensorAddress);
  if (!sensor) {
    sensorExists = false;
    // create sensor
    const createdSensor = await createSensorWithId(sensorAddress);
    if (!createdSensor) {
      return res.status(500).send({
        message: 'could not create sensor',
        data: {},
      });
    }
  }
  // add data
  const data = await addDataBySensorId(sensorAddress, water, voltage, duration, rssi, measurementDuration);
  return res.status(200).send({
    message: sensorExists ? 'data added' : 'sensor created and data added',
    data
  });
});

// GET /api/sensors/:sensorAddress
// -> 404 message: sensor not found, data: {}
// -> 200 message: sensor found, data: sensor
router.get('/sensors/:sensorAddress', async (req, res) => {
  const { sensorAddress } = req.params;
  const sensor = await getSensorById(Number(sensorAddress));
  if (!sensor) {
    return res.status(404).send({
      message: 'sensor not found',
      data: {},
    });
  }
  return res.status(200).send({
    message: 'sensor found',
    data: sensor,
  });
});

// GET /api/sensors
// -> 200 message: sensors found, data: sensors
router.get('/sensors', async (req, res) => {
  const sensors = await getSensors();
  return res.status(200).send({
    message: 'sensors found',
    data: sensors,
  });
});

// GET /api/sensors/:sensorAddress/data?startDate=1682704726&endDate=1682704726&maxDataPoints=100
// -> 404 message: sensor not found, data: {}
// -> 404 message: data not found, data: {}
// -> 400 message: invalid startDate, data: {}
// -> 400 message: invalid endDate, data: {}
// -> 400 message: invalid maxDataPoints, data: {}
// -> 200 message: data found, data: data
router.get('/sensors/:sensorAddress/data', async (req, res) => {
  const { sensorAddress } = req.params;
  const { startDate, endDate, maxDataPoints } = req.query;
  const sensor = await getSensorById(Number(sensorAddress));
  if (!sensor) {
    return res.status(404).send({
      message: 'sensor not found',
      data: {},
    });
  }
  // check if startDate, endDate and maxDataPoints are valid or don't exist
  if (typeof startDate == 'string' && isNaN(Number(startDate))) {
    return res.status(400).send({
      message: 'invalid startDate',
      data: {},
    });
  }
  if (typeof endDate == 'string' && isNaN(Number(endDate))) {
    return res.status(400).send({
      message: 'invalid endDate',
      data: {},
    });
  }
  if (typeof maxDataPoints == 'string' && isNaN(Number(maxDataPoints))) {
    return res.status(400).send({
      message: 'invalid maxDataPoints',
      data: {},
    });
  }
  const parsedStartDate = typeof startDate == 'string' ? Math.floor(Number(startDate)) : undefined;
  const parsedEndDate = typeof endDate == 'string' ? Math.floor(Number(endDate)) : undefined;
  const parsedMaxDataPoints = typeof maxDataPoints == 'string' ? Math.floor(Number(maxDataPoints)) : undefined;
  const data = await getDataBySensorId(Number(sensorAddress), parsedStartDate, parsedEndDate, parsedMaxDataPoints);
  if (!data) {
    return res.status(404).send({
      message: 'data not found',
      data: {},
    });
  }
  return res.status(200).send({
    message: 'data found',
    data,
  });
});

// PUT /api/sensors/:sensorAddress
// {
//   "name": "new name"
// }
// -> 404 message: sensor not found, data: {}
// -> 400 message: name is required, data: {}
// -> 200 message: sensor updated, data: sensor
router.put('/sensors/:sensorAddress', async (req, res) => {
  const { sensorAddress } = req.params;
  const { name } = req.body;
  if (!name) {
    return res.status(400).send({
      message: 'name is required',
      data: {},
    });
  }
  const sensor = await getSensorById(Number(sensorAddress));
  if (!sensor) {
    return res.status(404).send({
      message: 'sensor not found',
      data: {},
    });
  }

  await updateSensorById(Number(sensorAddress), name);
  return res.status(200).send({
    message: 'sensor updated',
    data: await getSensorById(Number(sensorAddress)),
  });
});

// DELETE /api/sensors/:sensorAddress/data
// -> 404 message: data not found, data: {}
// -> 200 message: data deleted, data: {}
router.delete('/sensors/:sensorAddress/data', async (req, res) => {
  const { sensorAddress } = req.params;
  const data = await getDataBySensorId(Number(sensorAddress));
  if (!data) {
    return res.status(404).send({
      message: 'data not found',
      data: {},
    });
  }
  deleteDataBySensorId(Number(sensorAddress));
  return res.status(200).send({
    message: 'data deleted',
    data: {},
  });
});

// DELETE /api/sensors/:sensorAddress
// -> 404 message: sensor not found, data: {}
// -> 200 message: sensor deleted, data: {}
router.delete('/sensors/:sensorAddress', async (req, res) => {
  const { sensorAddress } = req.params;
  const sensor = await getSensorById(Number(sensorAddress));
  if (!sensor) {
    return res.status(404).send({
      message: 'sensor not found',
      data: {},
    });
  }
  deleteDataBySensorId(Number(sensorAddress));
  deleteSensorById(Number(sensorAddress));
  return res.status(200).send({
    message: 'sensor deleted',
    data: {},
  });
});

// DELETE /api/data/:dataId
// -> 404 message: data not found, data: {}
// -> 200 message: data deleted, data: {}
router.delete('/data/:dataId', async (req, res) => {
  const { dataId } = req.params;
  const data = await getDataBySensorId(Number(dataId));
  if (!data) {
    return res.status(404).send({
      message: 'data not found',
      data: {},
    });
  }
  deleteDataById(Number(dataId));
  return res.status(200).send({
    message: 'data deleted',
    data: {},
  });
});

// 404
// -> 404 message: This page does not exists, data: {}
router.use((req, res) => {
  res.status(404).send({ message: 'This page does not exists', data: {} });
});

export default router;

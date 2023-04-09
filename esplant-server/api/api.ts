import cors from 'cors';
import { json, Router } from 'express';
import { addDataBySensorId, createSensorWithId, getSensorById, getSensors, getDataBySensorId, deleteDataBySensorId, deleteSensorById, deleteDataById, updateSensorById } from './database.js';

const router = Router();
router.use(json());
router.use(cors());

// POST /api/data
// {
//   "sensorAddress": 1,
//   "water": 428
// }
// -> 400 message: sensorAddress and water are required, data: {}
// -> 500 message: could not create sensor, data: {}
// -> 200 message: data added, data: data
router.post('/data', async (req, res) => {
  const { sensorAddress, water } = req.body;
  if (!sensorAddress || !water) {
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
  const data = await addDataBySensorId(sensorAddress, water);
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

// GET /api/sensors/:sensorAddress/data
// -> 404 message: sensor not found, data: {}
// -> 404 message: data not found, data: {}
// -> 200 message: data found, data: data
router.get('/sensors/:sensorAddress/data', async (req, res) => {
  const { sensorAddress } = req.params;
  const sensor = await getSensorById(Number(sensorAddress));
  if (!sensor) {
    return res.status(404).send({
      message: 'sensor not found',
      data: {},
    });
  }
  const data = await getDataBySensorId(Number(sensorAddress));
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

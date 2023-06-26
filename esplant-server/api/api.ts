import cors from "cors";
import { json, Router } from "express";
import {
  addDataBySensorId,
  createSensorWithId,
  getSensorById,
  getSensors,
  getDataBySensorId,
} from "./database.js";
import { Data } from "./types/data.js";
import dateFormat from "dateformat";

const router = Router();
router.use(json());
router.use(cors());

function formatDateData(data: Data[]): Data[] {
  return data.map((data) => {
    if (!data.date) {
      return {
        ...data,
        date: "unknown",
      };
    }
    const date = new Date(data.date);
    const formattedDate = dateFormat(date, "dd.mm.yyyy HH:MM:ss");
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
      res.setHeader("Content-Type", "application/json");
      res.send = originalSend;
      return res.send(data);
    };
  }
  next();
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
router.post("/data", async (req, res) => {
  const dataObj: Data = req.body;

  if (dataObj.sensorAddress == undefined || dataObj.water == undefined) {
    return res.status(400).send({
      message: "sensorAddress and water are required",
      data: {},
    });
  }
  // check if sensor exists
  let sensorExists = true;
  const sensor = await getSensorById(dataObj.sensorAddress);
  if (!sensor) {
    sensorExists = false;
    // create sensor
    const createdSensor = await createSensorWithId(dataObj.sensorAddress);
    if (!createdSensor) {
      return res.status(500).send({
        message: "could not create sensor",
        data: {},
      });
    }
  }
  // add data
  const data = await addDataBySensorId(dataObj);
  return res.status(200).send({
    message: sensorExists ? "data added" : "sensor created and data added",
    data,
  });
});

// GET /api/sensors
// -> 200 message: sensors found, data: sensors
router.get("/sensors", async (req, res) => {
  const sensors = await getSensors();
  return res.status(200).send({
    message: "sensors found",
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
router.get("/sensors/:sensorAddress/data", async (req, res) => {
  const { sensorAddress } = req.params;
  const { startDate, endDate, maxDataPoints } = req.query;
  const sensor = await getSensorById(Number(sensorAddress));
  if (!sensor) {
    return res.status(404).send({
      message: "sensor not found",
      data: {},
    });
  }
  // check if startDate, endDate and maxDataPoints are valid
  if (isNaN(Number(startDate))) {
    return res.status(400).send({
      message: "invalid startDate",
      data: {},
    });
  }
  if (isNaN(Number(endDate))) {
    return res.status(400).send({
      message: "invalid endDate",
      data: {},
    });
  }
  if (isNaN(Number(maxDataPoints))) {
    return res.status(400).send({
      message: "invalid maxDataPoints",
      data: {},
    });
  }
  const parsedStartDate = Math.floor(Number(startDate));
  const parsedEndDate = Math.floor(Number(endDate));
  const parsedMaxDataPoints = Math.floor(Number(maxDataPoints));
  const data = await getDataBySensorId(
    Number(sensorAddress),
    parsedStartDate,
    parsedEndDate,
    parsedMaxDataPoints
  );
  if (!data) {
    return res.status(404).send({
      message: "data not found",
      data: {},
    });
  }
  return res.status(200).send({
    message: "data found",
    data,
  });
});

// 404
// -> 404 message: This page does not exists, data: {}
router.use((req, res) => {
  res.status(404).send({ message: "This page does not exists", data: {} });
});

export default router;

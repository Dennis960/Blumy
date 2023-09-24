import { Router } from "express";
import SensorController from "../controllers/SensorController.js";
import SensorReadingEntity from "../entities/SensorReadingEntity.js";

const router = Router();
const dataController = new SensorController();

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
// -> 200 message: data added, data: data
router.post("/data", async (req, res) => {
  const dataObj: SensorReadingEntity = req.body;

  if (dataObj.sensorAddress == undefined || dataObj.water == undefined) {
    return res.status(400).send({
      message: "sensorAddress and water are required",
      data: {},
    });
  }

  const data = await dataController.addSensorData(dataObj);
  return res.send({
    message: "data added",
    data,
  });
});

export default router;

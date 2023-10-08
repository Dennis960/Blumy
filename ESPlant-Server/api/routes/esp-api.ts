import { Router } from "express";
import { z } from "zod";
import SensorController from "../controllers/SensorController.js";
import {
  ESPSensorReadingDTO,
  espSensorReadingSchema,
} from "../entities/SensorReadingEntity.js";
import validate from "../middlewares/validate.js";
import { isSensor } from "../middlewares/authenticated.js";

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
router.post(
  "/data",
  isSensor,
  validate(
    z.object({
      body: espSensorReadingSchema,
    })
  ),
  async (req, res) => {
    const dataObj: ESPSensorReadingDTO = req.body;
    if (dataObj.sensorAddress != req.user?.sensorId) {
      return res.status(403).send({
        message: "unauthorized",
      });
    }

    const data = await dataController.addSensorData(dataObj);
    return res.send(data);
  }
);

export default router;

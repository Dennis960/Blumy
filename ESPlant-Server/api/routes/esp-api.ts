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

router.post(
  "/v2/data",
  isSensor,
  validate(
    z.object({
      body: espSensorReadingSchema,
    })
  ),
  async (req, res) => {
    const dataObj: ESPSensorReadingDTO = req.body;
    const data = await dataController.addSensorData(req.user!.sensorId!, dataObj);
    return res.send(data);
  }
);

export default router;

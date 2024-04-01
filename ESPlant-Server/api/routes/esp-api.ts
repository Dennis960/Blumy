import { Router } from "express";
import { z } from "zod";
import SensorController from "../controllers/SensorController.js";
import {
  ESPSensorReadingDTO,
  espSensorReadingSchema,
} from "../entities/SensorReadingEntity.js";
import validate from "../middlewares/validate.js";
import { isSensorWrite } from "../middlewares/authenticated.js";
import passport from "passport";

const router = Router();
const dataController = new SensorController();

router.post(
  "/v2/data",
  passport.authenticate("bearer", { session: false }),
  isSensorWrite,
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

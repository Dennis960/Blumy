import cors from "cors";
import { json, Router } from "express";
import sensorRoutes from "./routes/sensors.js";
import espApiRoutes from "./routes/esp-api.js";
import webPushRoutes from "./routes/web-push.js";
import superjson from "./middlewares/superjson.js";

const router = Router();
router.use(json());
router.use(cors());
router.use(superjson);
router.use(sensorRoutes);
router.use(espApiRoutes);
router.use(webPushRoutes);

export default router;

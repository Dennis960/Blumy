import cors from "cors";
import { json, Router } from "express";
import sensorRoutes from "./routes/sensors.js";
import espApiRoutes from "./routes/esp-api.js";
import webPushRoutes from "./routes/web-push.js";
import superjson from "./middlewares/superjson.js";
import passport from "./middlewares/passport.js";
import authRoutes from "./routes/auth.js";
import { isAuthenticated } from "./middlewares/authenticated.js";

const router = Router();
router.use(json());
router.use(cors());
router.use(superjson);
router.use(passport);

// must be public
router.use(authRoutes);

// TODO public for now, add auth later
router.use(espApiRoutes);

// restricted
router.use(isAuthenticated);
router.use(sensorRoutes);
router.use(webPushRoutes);

export default router;

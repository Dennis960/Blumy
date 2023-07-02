import { Router } from "express";
import SensorController from "../controllers/SensorController.js";

const router = Router();
const sensorController = new SensorController();

// GET /api/sensors
// -> 200 message: sensors found, data: sensors
router.get("/sensors", async (req, res) => {
  const sensors = await sensorController.getSensorOverview();
  return res.json(sensors);
});

router.get("/sensors/:id", async (req, res) => {
  const sensor = await sensorController.getSensor(parseInt(req.params.id));
  if (sensor == undefined) {
    return res.status(404).send({
      message: "sensor not found",
    });
  }
  return res.json(sensor);
});

// GET /api/sensors/:sensorAddress/data?startDate=1682704726&endDate=1682704726&maxDataPoints=100
// -> 404 message: sensor not found, data: {}
// -> 404 message: data not found, data: {}
// -> 400 message: invalid startDate, data: {}
// -> 400 message: invalid endDate, data: {}
// -> 400 message: invalid maxDataPoints, data: {}
// -> 200 message: data found, data: data
router.get("/sensors/:id/history", async (req, res) => {
  const { id } = req.params;
  const { startDate, endDate, maxDataPoints } = req.query;
  // check if startDate, endDate and maxDataPoints are valid
  if (isNaN(Number(startDate))) {
    return res.status(400).send({
      message: "invalid startDate",
    });
  }
  if (isNaN(Number(endDate))) {
    return res.status(400).send({
      message: "invalid endDate",
    });
  }
  if (isNaN(Number(maxDataPoints))) {
    return res.status(400).send({
      message: "invalid maxDataPoints",
    });
  }
  const parsedStartDate = new Date(Number(startDate));
  const parsedEndDate = new Date(Number(endDate));
  const parsedMaxDataPoints = Math.floor(Number(maxDataPoints));
  const history = await sensorController.getSensorHistory(
    Number(id),
    parsedStartDate,
    parsedEndDate,
    parsedMaxDataPoints
  );
  if (history == undefined) {
    return res.status(404).send({
      message: "sensor not found",
    });
  }
  return res.json(history);
});

router.get("/sensors/:id/value-distribution", async (req, res) => {
  const distribution = await sensorController.getSensorValueDistribution(parseInt(req.params.id));
  return res.json(distribution);
});

router.post("/sensors/:id/config", async (req, res) => {
  const config = req.body // TODO validate
  const sensor = await sensorController.updateSensorConfig(parseInt(req.params.id), config);
  // TODO 404 if does not exist
  return res.json(sensor);
});


export default router;
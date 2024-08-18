import SensorController from "$lib/server/controllers/SensorController";
import type { ESPSensorReadingDTO } from "$lib/server/entities/SensorReadingEntity";
import { json, type RequestHandler } from "@sveltejs/kit";

const dataController = new SensorController();

export const POST = (async (event) => {
    // event.locals.middleware.auth.isAuthenticated(); // TODO ?
    event.locals.middleware.auth.isSensorWrite();
    const sensorReading = await event.request.json() as ESPSensorReadingDTO;
    const data = await dataController.addSensorData(event.locals.user!.sensorId!, sensorReading);
    return json(data);
}) satisfies RequestHandler;
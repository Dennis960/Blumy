import SensorController from "$lib/server/controllers/SensorController";
import type { ESPSensorReadingDTO } from "$lib/server/entities/SensorReadingEntity";
import SensorRepository from "$lib/server/repositories/SensorRepository";
import { json, type RequestHandler } from "@sveltejs/kit";

const dataController = new SensorController();

export const POST = (async (event) => {
    const authorizationHeader = event.request.headers.get("Authorization");
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
        return json({ error: "Unauthorized" }, { status: 401 });
    }
    const writeToken = authorizationHeader.slice("Bearer ".length);
    const sensorId = await SensorRepository.getIdByWriteToken(writeToken);
    if (!sensorId) {
        return json({ error: "Unauthorized" }, { status: 401 });
    }

    const sensorReading = await event.request.json() as ESPSensorReadingDTO;
    const data = await dataController.addSensorData(sensorId, sensorReading);
    return json(data);
}) satisfies RequestHandler;
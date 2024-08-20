import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import SensorController from "$lib/server/controllers/SensorController";
import type { SensorConfigurationDTO } from "$lib/types/api";

export const PUT = (async (event) => {
    event.locals.middleware.security.isOwner(parseInt(event.params.id))
    const data = await event.request.formData();
    const sensorId = parseInt(event.params.id);

    const imageFile = data.get("image") as File;
    let imageBase64: string | undefined = undefined;
    const arrayBuffer = await imageFile.arrayBuffer();
    if (arrayBuffer.byteLength > 0)
        imageBase64 = Buffer.from(arrayBuffer).toString("base64");


    const config: SensorConfigurationDTO = {
        name: data.get("name") as string,
        imageBase64,
        permanentWiltingPoint: Number(data.get("permanentWiltingPoint")),
        lowerThreshold: Number(data.get("lowerThreshold")),
        upperThreshold: Number(data.get("upperThreshold")),
        fieldCapacity: Number(data.get("fieldCapacity")),
    }
    
    const newConfig = await new SensorController().updateSensorConfig(sensorId, config);
    return json(newConfig);
}) satisfies RequestHandler;
import SensorController from "$lib/server/controllers/SensorController";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST = ((event) => {
    event.locals.middleware.security.isOwner(parseInt(event.params.id))
    const writeToken = new SensorController().getSensorWriteToken(parseInt(event.params.id));
    return json(writeToken);
}) satisfies RequestHandler;
import SensorController from "$lib/server/controllers/SensorController";
import type { Actions } from "./$types";

export const actions = {
    default: async (event) => {
        event.locals.user = event.locals.middleware.auth.isAuthenticated();
        const config = await event.request.formData();
        const sensor = await new SensorController().create(event.locals.user.id, config);
        return res.json(sensor);
    }
} satisfies Actions;


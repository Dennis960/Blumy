import { json, type RequestHandler } from "@sveltejs/kit";

export const GET = ((event) => {
    if (!event.locals.user) {
        return json({ error: "Not logged in" }, { status: 401 });
    }
    return json(event.locals.user);
}) satisfies RequestHandler;
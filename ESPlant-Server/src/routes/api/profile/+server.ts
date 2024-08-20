import { json, type RequestHandler } from "@sveltejs/kit";

export const GET = ((event) => {
    event.locals.middleware.security.isAuthenticated();
    return json(event.locals.user);
}) satisfies RequestHandler;
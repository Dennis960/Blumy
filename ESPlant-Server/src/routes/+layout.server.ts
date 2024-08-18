import type { LayoutServerLoad } from "./$types";

export const load = ((event) => {
    event.locals.middleware.auth.isAuthenticated();
}) satisfies LayoutServerLoad;
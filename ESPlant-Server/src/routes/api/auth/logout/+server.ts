import { lucia } from "$lib/server/auth";
import { redirect, type RequestEvent } from "@sveltejs/kit";

export async function POST(event: RequestEvent): Promise<Response> {
    if (!event.locals.session) {
        return new Response(null, {
            status: 401
        });
    }
    await lucia.invalidateSession(event.locals.session.id);
    const sessionCookie = lucia.createBlankSessionCookie();
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
        path: ".",
        ...sessionCookie.attributes
    });
    return redirect(302, "/login");
}
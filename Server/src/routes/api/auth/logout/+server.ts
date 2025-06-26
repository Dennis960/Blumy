import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from './$types';

export const POST = async (event: RequestEvent) => {
	event.locals.security.allowAll();
	if (!event.locals.session) {
		return new Response(null, {
			status: 401
		});
	}

	await event.locals.lucia.invalidateSession(event.locals.session.id);

	const sessionCookie = event.locals.lucia.createBlankSessionCookie();
	event.cookies.set(sessionCookie.name, sessionCookie.value, {
		path: '.',
		...sessionCookie.attributes
	});
	return redirect(303, '/');
};

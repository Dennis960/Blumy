import WaitingListRepository from '$lib/server/repositories/WaitingListRepository';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST = (async (event) => {
	event.locals.security.allowAll();

	const body = (await event.request.json()) as { email: string };
	const result = await WaitingListRepository.addEmail(body.email);
	if (!result) {
		return json({ error: 'Email already exists in the waiting list' }, { status: 400 });
	}
	return json({ message: 'Email added to the waiting list successfully' }, { status: 200 });
}) satisfies RequestHandler;

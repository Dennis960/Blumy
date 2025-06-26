import dbHelper from '$lib/server/db/dbHelper';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoadEvent } from './$types';

export const load = async (event: PageServerLoadEvent) => {
	event.locals.security.allowAll();
	event.depends('event:locals');
	const userId = event.locals.user?.id;
	if (!userId) {
		return redirect(302, '/');
	}
	const user = await dbHelper.getUser(userId);
	if (!user) {
		return redirect(302, '/');
	}
	const isDefaultLogin = await dbHelper.isDefaultLogin(userId);
	return {
		user: {
			createdAt: user.createdAt,
			email: user.email,
			credits: user.credits,
			isDefaultLogin
		}
	};
};

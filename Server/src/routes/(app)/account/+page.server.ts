import UserRepository from '$lib/server/repositories/UserRepository';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoadEvent } from './$types';

export const load = async (event: PageServerLoadEvent) => {
	event.locals.security.allowAll();
	event.depends('event:locals');
	const userId = event.locals.user?.id;
	if (!userId) {
		return redirect(302, '/');
	}
	const user = await UserRepository.getUser(userId);
	if (!user) {
		return redirect(302, '/');
	}
	const isDefaultLogin = await UserRepository.isDefaultLogin(userId);
	return {
		user: {
			createdAt: user.createdAt,
			email: user.email,
			isDefaultLogin
		}
	};
};

import type { Actions } from './$types';

import { google } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import { generateState } from 'arctic';
import crypto from 'crypto';

import { dev } from '$app/environment';

import type { PageServerLoad } from './$types';

export const load = (({ cookies, url, locals }) => {
	locals.security.allowAll();
	const redirectUrl = url.searchParams.get('redirectUrl') ?? '/';
	cookies.set('redirectUrl', redirectUrl, {
		path: '/',
		secure: !dev,
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax'
	});
}) satisfies PageServerLoad;

function generateCodeVerifier() {
	return crypto
		.randomBytes(32)
		.toString('base64')
		.replace(/[^a-zA-Z0-9]/g, '')
		.slice(0, 128);
}

export const actions = {
	loginGoogle: async (event) => {
		event.locals.security.allowAll();
		const state = generateState();
		const codeVerifier = generateCodeVerifier();
		event.cookies.set('google_oauth_code_verifier', codeVerifier, {
			secure: !dev,
			path: '/',
			httpOnly: true,
			maxAge: 60 * 10,
			sameSite: 'lax'
		});
		const url = await google.createAuthorizationURL(state, codeVerifier);

		event.cookies.set('google_oauth_state', state, {
			path: '/',
			secure: !dev,
			httpOnly: true,
			maxAge: 60 * 10,
			sameSite: 'lax'
		});

		redirect(302, url.toString());
	}
} satisfies Actions;

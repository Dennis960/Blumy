import { generateState } from 'arctic';

import { dev } from '$app/environment';
import { getGoogle } from '$lib/server/auth';
import { text, type RequestEvent } from '@sveltejs/kit';
import crypto from 'crypto';

function generateCodeVerifier() {
	return crypto
		.randomBytes(32)
		.toString('base64')
		.replace(/[^a-zA-Z0-9]/g, '')
		.slice(0, 128);
}
export async function POST(event: RequestEvent): Promise<Response> {
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
	const url = getGoogle(event.url.origin).createAuthorizationURL(state, codeVerifier, ['email']);
	url.searchParams.set('prompt', 'select_account');

	event.cookies.set('google_oauth_state', state, {
		path: '/',
		secure: !dev,
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax'
	});

	const redirectUrl = event.url.searchParams.get('redirectUrl');

	if (redirectUrl) {
		event.cookies.set('redirectUrl', redirectUrl, {
			path: '/',
			secure: !dev,
			httpOnly: true,
			maxAge: 60 * 10,
			sameSite: 'lax'
		});
	}
	return text(url.toString());
}

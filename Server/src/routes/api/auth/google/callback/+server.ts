import { getGoogle, lucia } from '$lib/server/auth';
import { accounts, users } from '$lib/server/db/schema';
import { db } from '$lib/server/db/worker';
import jwt from 'jsonwebtoken';
import { generateId } from 'lucia';

import { dev } from '$app/environment';
import dbHelper from '$lib/server/db/dbHelper';
import { type RequestEvent } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

export async function GET(event: RequestEvent): Promise<Response> {
	event.locals.security.allowAll();
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	const storedState = event.cookies.get('google_oauth_state') ?? null;
	const codeVerifier = event.cookies.get('google_oauth_code_verifier') ?? null;
	const redirectUrl = decodeURIComponent(
		event.cookies.get('redirectUrl') ?? encodeURIComponent('/')
	);
	event.cookies.delete('redirectUrl', { path: '/' });

	if (!code || !state || !storedState || state !== storedState || !codeVerifier) {
		console.log('Invalid state or code');
		return new Response(null, {
			status: 302,
			headers: {
				Location: redirectUrl
			}
		});
	}

	try {
		const tokens = await getGoogle(event.url.origin).validateAuthorizationCode(code, codeVerifier);

		const googleUser: GoogleIdToken = jwt.decode(tokens.idToken()) as GoogleIdToken;
		const userGoogleId = googleUser.sub;

		const existingOauthAccount = (
			await db
				.select()
				.from(accounts)
				.where(and(eq(accounts.provider, 'google'), eq(accounts.providerUserId, userGoogleId)))
		).pop();

		let userId: string;
		if (existingOauthAccount) {
			userId = existingOauthAccount.userId;
		} else {
			userId = generateId(15);

			const user = await dbHelper.getUserByEmail(googleUser.email);
			if (user) {
				userId = user.id;
			} else {
				await db.insert(users).values({
					id: userId,
					email: googleUser.email
				});
			}
			await db.insert(accounts).values({
				userId,
				provider: 'google',
				providerUserId: userGoogleId
			});
		}
		const session = await lucia.createSession(userId, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		if (existingOauthAccount) {
			event.cookies.set('app_user_logged_in_google', 'true', {
				path: '/',
				secure: !dev,
				httpOnly: true,
				maxAge: 60 * 10,
				sameSite: 'lax'
			});
		} else {
			event.cookies.set('app_user_registered_google', 'true', {
				path: '/',
				secure: !dev,
				httpOnly: true,
				maxAge: 60 * 10,
				sameSite: 'lax'
			});
		}

		return new Response(null, {
			status: 302,
			headers: {
				Location: redirectUrl
			}
		});
	} catch (e) {
		console.error(e);
		return new Response(null, {
			status: 302,
			headers: {
				Location: redirectUrl
			}
		});
	}
}

/**
 * iss	The issuer, or signer, of the token. For Google-signed ID tokens, this value is https://accounts.google.com.
azp	Optional. Who the token was issued to.
aud	The audience of the token. The value of this claim must match the application or service that uses the token to authenticate the request. For more information, see ID token aud claim.
sub	The subject: the ID that represents the principal making the request.
iat	Unix epoch time when the token was issued.
exp	Unix epoch time when the token expires.
 */
interface GoogleIdToken {
	iss: string;
	azp?: string;
	aud: string;
	sub: string;
	iat: number;
	exp: number;
	email: string;
	email_verified: boolean;
}

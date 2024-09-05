import { google, lucia } from '$lib/server/auth';
import { oauthAccounts, users } from '$lib/server/db/schema';
import { db } from '$lib/server/db/worker';
import { OAuth2RequestError } from 'arctic';
import jwt from 'jsonwebtoken';
import { generateIdFromEntropySize } from 'lucia';

import type { RequestEvent } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

export async function GET(event: RequestEvent): Promise<Response> {
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	const storedState = event.cookies.get('google_oauth_state') ?? null;
	const codeVerifier = event.cookies.get('google_oauth_code_verifier') ?? null;
	const redirectUrl = event.cookies.get('redirectUrl') ?? '/';

	if (!code || !state || !storedState || state !== storedState || !codeVerifier) {
		return new Response(null, {
			status: 400
		});
	}

	try {
		const tokens = await google.validateAuthorizationCode(code, codeVerifier);

		const googleUser: GoogleIdToken = jwt.decode(tokens.idToken) as GoogleIdToken;
		const userGoogleId = googleUser.sub;

		const existingOauthAccount = (
			await db
				.select()
				.from(oauthAccounts)
				.where(
					and(eq(oauthAccounts.provider, 'google'), eq(oauthAccounts.providerUserId, userGoogleId))
				)
		).pop();

		if (existingOauthAccount) {
			const session = await lucia.createSession(existingOauthAccount.userId, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		} else {
			const userId = generateIdFromEntropySize(10); // 16 characters long

			await db.insert(users).values({
				id: userId
			});
			await db.insert(oauthAccounts).values({
				userId,
				provider: 'google',
				providerUserId: userGoogleId
			});

			const session = await lucia.createSession(userId, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		}
		return new Response(null, {
			status: 302,
			headers: {
				Location: redirectUrl
			}
		});
	} catch (e) {
		// the specific error message depends on the provider
		if (e instanceof OAuth2RequestError) {
			// invalid code
			return new Response(null, {
				status: 400
			});
		}
		return new Response(null, {
			status: 500
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
}

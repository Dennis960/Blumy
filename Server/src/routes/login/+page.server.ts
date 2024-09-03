import type { Actions } from "./$types";

import { google } from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";
import { generateState } from "arctic";
import crypto from "crypto";

import { dev } from "$app/environment";


function generateCodeVerifier() {
	return crypto.randomBytes(32).toString("base64")
		.replace(/[^a-zA-Z0-9]/g, "")
		.slice(0, 128);
}

export const actions = {
	loginGoogle: async (event) => {
		const state = generateState();
		const codeVerifier = generateCodeVerifier();
		event.cookies.set("google_oauth_code_verifier", codeVerifier, {
			secure: !dev,
			path: "/",
			httpOnly: true,
			maxAge: 60 * 10,
			sameSite: "lax"
		});
		const url = await google.createAuthorizationURL(state, codeVerifier);

		event.cookies.set("google_oauth_state", state, {
			path: "/",
			secure: !dev,
			httpOnly: true,
			maxAge: 60 * 10,
			sameSite: "lax"
		});

		redirect(302, url.toString());
	}
} satisfies Actions;


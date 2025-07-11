import { lucia } from '$lib/server/auth';

declare global {
	namespace App {
		interface Locals {
			user: import('lucia').User | null;
			session: import('lucia').Session | null;
			security: ReturnType<typeof import('$lib/server/security/authenticated').authenticated>;
			lucia: typeof lucia;
		}
	}
}

export {};

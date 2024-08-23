declare global {
	namespace App {
		interface Locals {
			user: import("lucia").User | null;
			session: import("lucia").Session | null;
			middleware: {
				security: ReturnType<typeof import("$lib/server/middlewares/authenticated").authenticated>;
			}
		}
	}
}

export { };
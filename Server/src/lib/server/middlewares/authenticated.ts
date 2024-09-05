import SensorRepository from '$lib/server/repositories/SensorRepository';
import { error, redirect } from '@sveltejs/kit';
import type { Session, User } from 'lucia';

export const authenticated = (user: User | null, session: Session | null) => ({
	isAuthenticated: function () {
		if (!user) {
			throw error(401, 'not authenticated');
		}

		if (session && session.fresh) {
			throw error(403, 'user not logged in');
		}
		return user;
	},
	isAuthenticatedElseRedirect: function (redirectUrl = '/') {
		if (!user || (session && session.fresh)) {
			throw redirect(302, `/login?redirectUrl=${encodeURIComponent(redirectUrl)}`);
		}
		return user;
	},

	// @enforce-await
	isSensorWrite: async function (sensorId: number, writeToken: string) {
		user = this.isAuthenticated();
		if (sensorId !== (await SensorRepository.getIdByWriteToken(writeToken))) {
			throw error(403, 'missing write token');
		}
	},

	// @enforce-await
	isOwner: async function (sensorId: number) {
		user = this.isAuthenticated();

		if (!user) {
			throw error(403, 'not authenticated');
		}

		const ownerId = await SensorRepository.getOwner(sensorId);
		if (ownerId === undefined) {
			throw error(404, 'sensor not found');
		}

		if (user.id !== ownerId) {
			throw error(403, 'not an owner of this sensor');
		}
	},

	// @enforce-await
	isOwnerOrThisSensorRead: async function (sensorId: number | string, readToken?: string | null) {
		user = this.isAuthenticated();
		sensorId = parseInt(sensorId.toString());

		if (readToken) {
			if (sensorId !== (await SensorRepository.getIdByReadToken(readToken))) {
				throw error(403, 'wrong sensor for read token');
			}
		} else {
			const ownerId = await SensorRepository.getOwner(sensorId);
			if (ownerId === undefined) {
				throw error(404, 'sensor not found');
			}

			if (user.id !== ownerId) {
				throw error(403, 'not an owner of this sensor');
			}
		}
	}
});

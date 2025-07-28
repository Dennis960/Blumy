import SensorRepository from '$lib/server/repositories/SensorRepository';
import { error, redirect } from '@sveltejs/kit';
import type { Session, User } from 'lucia';

export const authenticated = (user: User | null, session: Session | null) => ({
	allowAuthenticated: function () {
		if (!user) {
			throw error(401, 'not authenticated');
		}

		if (session && session.fresh) {
			throw error(403, 'user not logged in');
		}
		return user;
	},
	allowAuthenticatedElseRedirect: function (redirectUrl = '/') {
		if (!user || (session && session.fresh)) {
			throw redirect(302, `/?redirectUrl=${encodeURIComponent(redirectUrl)}`);
		}
		return user;
	},

	// @enforce-await
	allowHasWritePermission: async function (sensorId: number, writeToken: string) {
		user = this.allowAuthenticated();
		if (sensorId !== (await SensorRepository.getIdByWriteToken(writeToken))) {
			throw error(403, 'missing write token');
		}
	},

	// @enforce-await
	allowOwnerOfElseRedirect: async function (sensorId: number) {
		const user = this.allowAuthenticatedElseRedirect();

		const ownerId = await SensorRepository.getOwner(sensorId);
		if (ownerId === undefined) {
			throw error(404, 'sensor not found');
		}

		if (user.id !== ownerId) {
			throw error(403, 'not an owner of this sensor');
		}
		
		return user;
	},

	// @enforce-await
	allowOwnerOrSensorRead: async function (sensorId: number | string, readToken?: string | null) {
		sensorId = parseInt(sensorId.toString());

		if (readToken) {
			if (sensorId !== (await SensorRepository.getIdByReadToken(readToken))) {
				throw error(403, 'wrong sensor for read token');
			}
		} else {
			user = this.allowAuthenticated();
			const ownerId = await SensorRepository.getOwner(sensorId);
			if (ownerId === undefined) {
				throw error(404, 'sensor not found');
			}

			if (user.id !== ownerId) {
				throw error(403, 'not an owner of this sensor');
			}
		}
	},

	allowAll: function () {},
	allowNone: function () {
		throw error(405, 'not allowed');
	}
});

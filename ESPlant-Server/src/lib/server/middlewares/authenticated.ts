import SensorRepository from '$lib/server/repositories/SensorRepository';
import { error } from '@sveltejs/kit';
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

  isSensorWrite: function () {
    user = this.isAuthenticated();
    SensorRepository.getIdByReadToken

    if (user!.kind !== 'sensor-write') {
      throw error(403, 'missing write token');
    }
  },

  isOwner: async function (sensorId: number) {
    user = this.isAuthenticated();

    if (user.kind !== 'user') {
      throw error(403, 'user not logged in');
    }

    const ownerId = await SensorRepository.getOwner(sensorId);
    if (ownerId === undefined) {
      throw error(404, 'sensor not found');
    }

    if (user.id !== ownerId) {
      throw error(403, 'not an owner of this sensor');
    }
  },

  isOwnerOrThisSensorRead: async function (sensorId: number) {
    user = this.isAuthenticated();

    if (user.kind === 'sensor-read') {
      if (user.sensorId !== sensorId) {
        throw error(403, 'wrong sensor for read token');
      }
      return;
    }

    if (user.kind === 'user') {
      const ownerId = await SensorRepository.getOwner(sensorId);
      if (ownerId === undefined) {
        throw error(404, 'sensor not found');
      }

      if (user.id !== ownerId) {
        throw error(403, 'not an owner of this sensor');
      }
      return;
    }

    throw error(403, 'not authenticated');
  }
});

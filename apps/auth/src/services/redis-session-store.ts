import { createClient, type RedisClientType } from 'redis';

import type { Logger } from '../shared/logger';

const SESSION_KEY_PREFIX = 'auth:session:';

type SessionRecord = Readonly<{
  email: string;
  refreshToken: string;
}>;

type CreateRedisSessionStoreOptions = Readonly<{
  logger: Logger;
  redisUrl: string;
}>;

export type RedisSessionStore = Readonly<{
  connect: () => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  getSession: (sessionId: string) => Promise<SessionRecord | null>;
  setSession: (sessionId: string, session: SessionRecord, ttlSeconds: number) => Promise<void>;
}>;

const createSessionKey = (sessionId: string): string => `${SESSION_KEY_PREFIX}${sessionId}`;

export const createRedisSessionStore = ({
  logger,
  redisUrl,
}: CreateRedisSessionStoreOptions): RedisSessionStore => {
  const client: RedisClientType = createClient({
    url: redisUrl,
  });

  client.on('error', (error: Error) => {
    logger.error('Redis client error', {
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack,
      },
    });
  });

  return {
    connect: async () => {
      await client.connect();
    },
    deleteSession: async (sessionId) => {
      await client.del(createSessionKey(sessionId));
    },
    disconnect: async () => {
      if (client.isOpen) {
        await client.quit();
      }
    },
    getSession: async (sessionId) => {
      const value = await client.get(createSessionKey(sessionId));

      if (value === null) {
        return null;
      }

      const parsedValue: unknown = JSON.parse(value);

      if (typeof parsedValue !== 'object' || parsedValue === null) {
        return null;
      }

      const { email, refreshToken } = parsedValue as Record<string, unknown>;

      if (typeof email !== 'string' || typeof refreshToken !== 'string') {
        return null;
      }

      return {
        email,
        refreshToken,
      };
    },
    setSession: async (sessionId, session, ttlSeconds) => {
      await client.set(createSessionKey(sessionId), JSON.stringify(session), {
        EX: ttlSeconds,
      });
    },
  };
};

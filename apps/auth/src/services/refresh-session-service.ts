import { createClient } from 'redis';

import type { AppConfig } from '../config/app-config';
import { createRouteError, RouteError } from '../shared/route-error';
import {
  createRefreshSessionId,
  createRefreshToken,
  parseTokenLifetimeSeconds,
  validateRefreshToken,
} from './token-service';

type StoredRefreshSession = Readonly<{
  email: string;
  refreshToken: string;
  sessionId: string;
}>;

export type RefreshSessionService = Readonly<{
  createSession(email: string): Promise<StoredRefreshSession>;
  deleteSession(refreshToken: string): Promise<void>;
  disconnect(): Promise<void>;
  rotateSession(refreshToken: string): Promise<StoredRefreshSession>;
}>;

type CreateRefreshSessionServiceOptions = Readonly<{
  config: AppConfig;
}>;

type RedisSessionClient = ReturnType<typeof createClient>;

const buildSessionKey = (config: AppConfig, sessionId: string): string =>
  `${config.redisKeyPrefix}:${sessionId}`;

const parseStoredSession = (value: string): StoredRefreshSession => {
  const parsedValue: unknown = JSON.parse(value);

  if (typeof parsedValue !== 'object' || parsedValue === null) {
    throw createRouteError(500, 'INVALID_REFRESH_SESSION', 'Refresh session payload is invalid.');
  }

  const { email, refreshToken, sessionId } = parsedValue as Record<string, unknown>;

  if (
    typeof email !== 'string' ||
    typeof refreshToken !== 'string' ||
    typeof sessionId !== 'string'
  ) {
    throw createRouteError(500, 'INVALID_REFRESH_SESSION', 'Refresh session payload is invalid.');
  }

  return {
    email,
    refreshToken,
    sessionId,
  };
};

const validateIncomingRefreshToken = (refreshToken: string, config: AppConfig) => {
  try {
    return validateRefreshToken(refreshToken, config.refreshTokenSecret);
  } catch (error: unknown) {
    if (error instanceof RouteError) {
      throw createRouteError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid or expired.');
    }

    throw error;
  }
};

const loadStoredSession = async (
  redis: RedisSessionClient,
  config: AppConfig,
  refreshToken: string,
): Promise<StoredRefreshSession> => {
  const payload = validateIncomingRefreshToken(refreshToken, config);
  const storedSession = await redis.get(buildSessionKey(config, payload.jti!));

  if (!storedSession) {
    throw createRouteError(401, 'REFRESH_SESSION_NOT_FOUND', 'Refresh session is not active.');
  }

  const parsedSession = parseStoredSession(storedSession);

  if (parsedSession.refreshToken !== refreshToken || parsedSession.email !== payload.email) {
    throw createRouteError(401, 'REFRESH_SESSION_MISMATCH', 'Refresh session is not active.');
  }

  return parsedSession;
};

export const createRefreshSessionService = async ({
  config,
}: CreateRefreshSessionServiceOptions): Promise<RefreshSessionService> => {
  const redis = createClient({
    url: config.redisUrl,
  });

  redis.on('error', () => undefined);
  await redis.connect();

  const refreshTokenTtlSeconds = parseTokenLifetimeSeconds(config.refreshTokenExpiresIn);

  const createSession = async (email: string): Promise<StoredRefreshSession> => {
    const sessionId = createRefreshSessionId();
    const refreshToken = createRefreshToken(
      email,
      config.refreshTokenSecret,
      config.refreshTokenExpiresIn,
      sessionId,
    );
    const session = {
      email,
      refreshToken,
      sessionId,
    };

    await redis.set(buildSessionKey(config, sessionId), JSON.stringify(session), {
      EX: refreshTokenTtlSeconds,
    });

    return session;
  };

  const rotateSession = async (refreshToken: string): Promise<StoredRefreshSession> => {
    const currentSession = await loadStoredSession(redis, config, refreshToken);
    const nextSessionId = createRefreshSessionId();
    const nextRefreshToken = createRefreshToken(
      currentSession.email,
      config.refreshTokenSecret,
      config.refreshTokenExpiresIn,
      nextSessionId,
    );
    const nextSession = {
      email: currentSession.email,
      refreshToken: nextRefreshToken,
      sessionId: nextSessionId,
    };
    const transaction = redis.multi();

    transaction.del(buildSessionKey(config, currentSession.sessionId));
    transaction.set(buildSessionKey(config, nextSessionId), JSON.stringify(nextSession), {
      EX: refreshTokenTtlSeconds,
    });
    await transaction.exec();

    return nextSession;
  };

  const deleteSession = async (refreshToken: string): Promise<void> => {
    const payload = validateIncomingRefreshToken(refreshToken, config);

    await redis.del(buildSessionKey(config, payload.jti!));
  };

  const disconnect = async (): Promise<void> => {
    if (redis.isOpen) {
      await redis.quit();
    }
  };

  return {
    createSession,
    deleteSession,
    disconnect,
    rotateSession,
  };
};

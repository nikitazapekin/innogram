import { randomUUID } from 'node:crypto';

import type { AppConfig } from '../config/app-config';
import { createRouteError } from '../shared/route-error';
import {
  createAccessToken,
  createRefreshToken,
  parseTokenLifetimeSeconds,
  validateRefreshToken,
} from './token-service';
import type { RedisSessionStore } from './redis-session-store';

type AuthResponse = Readonly<{
  accessToken: string;
  email: string;
  refreshToken: string;
}>;

export type PublicAuthResponse = Readonly<{
  accessToken: string;
  email: string;
}>;

type CreateAuthSessionServiceOptions = Readonly<{
  config: AppConfig;
  sessionStore: RedisSessionStore;
}>;

export type AuthSessionService = Readonly<{
  createSession: (email: string) => Promise<AuthResponse>;
  logout: (refreshToken: string) => Promise<void>;
  refreshSession: (refreshToken: string) => Promise<AuthResponse>;
}>;

export const toPublicAuthResponse = (authResponse: AuthResponse): PublicAuthResponse => ({
  accessToken: authResponse.accessToken,
  email: authResponse.email,
});

const buildAuthResponse = (email: string, sessionId: string, config: AppConfig): AuthResponse => {
  const accessToken = createAccessToken(
    email,
    sessionId,
    config.accessTokenSecret,
    config.accessTokenExpiresIn,
  );
  const refreshToken = createRefreshToken(
    email,
    sessionId,
    config.refreshTokenSecret,
    config.refreshTokenExpiresIn,
  );

  return {
    accessToken,
    email,
    refreshToken,
  };
};

export const createAuthSessionService = ({
  config,
  sessionStore,
}: CreateAuthSessionServiceOptions): AuthSessionService => {
  const refreshTokenTtlSeconds = parseTokenLifetimeSeconds(config.refreshTokenExpiresIn);

  return {
    createSession: async (email) => {
      const sessionId = randomUUID();
      const authResponse = buildAuthResponse(email, sessionId, config);

      await sessionStore.setSession(
        sessionId,
        {
          email,
          refreshToken: authResponse.refreshToken,
        },
        refreshTokenTtlSeconds,
      );

      return authResponse;
    },
    logout: async (refreshToken) => {
      const payload = validateRefreshToken(refreshToken, config.refreshTokenSecret);
      const session = await sessionStore.getSession(payload.sessionId);

      if (session === null || session.refreshToken !== refreshToken) {
        throw createRouteError(401, 'INVALID_SESSION', 'Session is invalid or already expired.');
      }

      await sessionStore.deleteSession(payload.sessionId);
    },
    refreshSession: async (refreshToken) => {
      const payload = validateRefreshToken(refreshToken, config.refreshTokenSecret);
      const session = await sessionStore.getSession(payload.sessionId);

      if (session === null || session.refreshToken !== refreshToken) {
        throw createRouteError(401, 'INVALID_SESSION', 'Session is invalid or already expired.');
      }

      const authResponse = buildAuthResponse(payload.email, payload.sessionId, config);

      await sessionStore.setSession(
        payload.sessionId,
        {
          email: payload.email,
          refreshToken: authResponse.refreshToken,
        },
        refreshTokenTtlSeconds,
      );

      return authResponse;
    },
  };
};

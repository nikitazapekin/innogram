import { Router } from 'express';
import axios from 'axios';

import type { AppConfig } from '../config/app-config';
import { parseLoginRequestBody, parseRegisterRequestBody } from '../services/auth-request-parser';
import { buildAuthResponse } from '../services/auth-response-service';
import {
  createGoogleAuthorizationUrl,
  createGoogleCodeVerifier,
  createGoogleOAuthState,
  exchangeGoogleAuthorizationCode,
  fetchGoogleUserProfile,
  parseGoogleOAuthState,
} from '../services/google-oauth-service';
import { hashPassword } from '../services/password-service';

import { createRouteError, RouteError } from '../shared/route-error';

type CreateAuthRouterOptions = Readonly<{
  config: AppConfig;
}>;

type AuthUser = Readonly<{
  id: number;
  email: string;
  createdAt: string;
  updatedAt: string;
}>;

const CORE_AUTH_URL = process.env.AUTH_CORE_HTTP_URL?.trim() || 'http://localhost:3001';
const CORE_USERS_URL = process.env.AUTH_CORE_USERS_HTTP_URL?.trim() || CORE_AUTH_URL;

const normalizeDisplayName = (displayName: string): string => {
  if (displayName.length === 0) {
    return 'user';
  }

  return displayName;
};

const createProfile = async (displayName: string): Promise<void> => {
  await axios.post(`${CORE_USERS_URL}/users`, {
    displayName: normalizeDisplayName(displayName),
  });
};

const createUserAndProfile = async (payload: {
  displayName: string;
  email: string;
  googleId?: string;
  passwordHash?: string | null;
  provider: 'local' | 'google';
}): Promise<AuthUser> => {
  const { data: user } = await axios.post<AuthUser>(`${CORE_AUTH_URL}/auth/user`, {
    email: payload.email,
    googleId: payload.googleId ?? null,
    passwordHash: payload.passwordHash ?? null,
    provider: payload.provider,
  });

  await createProfile(payload.displayName);

  return user;
};

const getRequiredQueryParam = (value: unknown, field: string): string => {
  if (typeof value !== 'string' || value.length === 0) {
    throw createRouteError(400, 'INVALID_REQUEST', `Query parameter "${field}" is required.`);
  }

  return value;
};

const createOAuthRedirectUrl = (
  redirectUri: string,
  params: Readonly<Record<string, string>>,
): string => {
  const url = new URL(redirectUri);

  url.hash = new URLSearchParams(params).toString();

  return url.toString();
};

const createDefaultDisplayName = (email: string): string => email.split('@')[0] || email;

export const createAuthRouter = ({ config }: CreateAuthRouterOptions): Router => {
  const router = Router();

  router.post('/auth/register', async (request, response, next) => {
    try {
      const { displayName, email, password } = parseRegisterRequestBody(request.body);
      const passwordHash = await hashPassword(password, config);

      await createUserAndProfile({
        displayName,
        email,
        passwordHash,
        provider: 'local',
      });

      response.status(201).json(buildAuthResponse(email, config));
    } catch (error: unknown) {
      if (error instanceof RouteError) {
        response.status(error.status).json({
          error: error.code,
          message: error.message,
        });

        return;
      }

      if (axios.isAxiosError(error) && error.response?.status === 409) {
        response.status(409).json({
          error: 'USER_ALREADY_EXISTS',
          message: 'User already exists',
        });

        return;
      }

      next(error);
    }
  });

  router.get('/auth/google', async (request, response, next) => {
    try {
      const redirectUri = getRequiredQueryParam(request.query.redirectUri, 'redirectUri');
      const codeVerifier = createGoogleCodeVerifier();
      const state = createGoogleOAuthState(config, {
        codeVerifier,
        redirectUri,
      });

      response.redirect(
        302,
        createGoogleAuthorizationUrl(config, state, codeVerifier, config.googleRedirectUri),
      );
    } catch (error: unknown) {
      if (error instanceof RouteError) {
        response.status(error.status).json({
          error: error.code,
          message: error.message,
        });

        return;
      }

      next(error);
    }
  });

  router.get('/auth/google/callback', async (request, response, next) => {
    try {
      const code = getRequiredQueryParam(request.query.code, 'code');
      const stateToken = getRequiredQueryParam(request.query.state, 'state');
      const { codeVerifier, redirectUri } = parseGoogleOAuthState(stateToken, config);
      const accessToken = await exchangeGoogleAuthorizationCode(
        code,
        codeVerifier,
        config,
        config.googleRedirectUri,
      );
      const googleUser = await fetchGoogleUserProfile(accessToken);
      const { data: existingUser } = await axios.get<AuthUser | null>(
        `${CORE_AUTH_URL}/auth/user`,
        {
          params: {
            email: googleUser.email,
          },
        },
      );

      if (!existingUser) {
        const displayName = googleUser.name ?? createDefaultDisplayName(googleUser.email);

        await createUserAndProfile({
          displayName,
          email: googleUser.email,
          googleId: googleUser.googleId,
          provider: 'google',
        });
      }

      response.redirect(
        302,
        createOAuthRedirectUrl(redirectUri, {
          accessToken: buildAuthResponse(googleUser.email, config).accessToken,
          email: googleUser.email,
        }),
      );
    } catch (error: unknown) {
      if (error instanceof RouteError) {
        let stateToken: string | undefined;

        if (typeof request.query.state === 'string') {
          stateToken = request.query.state.trim();
        }

        if (stateToken) {
          try {
            const { redirectUri } = parseGoogleOAuthState(stateToken, config);

            response.redirect(
              302,
              createOAuthRedirectUrl(redirectUri, {
                error: error.code,
                message: error.message,
              }),
            );

            return;
          } catch {
            response.status(error.status).json({
              error: error.code,
              message: error.message,
            });

            return;
          }
        }

        response.status(error.status).json({
          error: error.code,
          message: error.message,
        });

        return;
      }

      next(error);
    }
  });

  router.post('/auth/login', async (request, response, next) => {
    try {
      const { email, password } = parseLoginRequestBody(request.body);
      const { data: user } = await axios.post<AuthUser | null>(
        `${CORE_AUTH_URL}/auth/user/verify`,
        {
          email,
          password,
        },
      );

      if (!user) {
        throw createRouteError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
      }

      response.json(buildAuthResponse(user.email, config));
    } catch (error: unknown) {
      if (error instanceof RouteError) {
        response.status(error.status).json({
          error: error.code,
          message: error.message,
        });

        return;
      }

      next(error);
    }
  });

  return router;
};

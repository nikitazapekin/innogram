import { Router } from 'express';
import axios from 'axios';

import type { AppConfig } from '../config/app-config';
import {
  createUserAndProfile,
  findUserByEmail,
  verifyUserCredentials,
} from '../services/auth-core-client';
import { parseLoginRequestBody, parseRegisterRequestBody } from '../services/auth-request-parser';
import { buildAuthResponse } from '../services/auth-response-service';
import { createDefaultDisplayName } from '../services/display-name-service';
import {
  createGoogleAuthorizationUrl,
  createGoogleCodeVerifier,
  createGoogleOAuthState,
  exchangeGoogleAuthorizationCode,
  fetchGoogleUserProfile,
  parseGoogleOAuthState,
} from '../services/google-oauth-service';
import { createOAuthRedirectUrl } from '../services/oauth-redirect-service';
import { hashPassword } from '../services/password-service';
import {
  getOptionalTrimmedQueryParam,
  getRequiredQueryParam,
} from '../services/request-query-service';

import { createRouteError, RouteError } from '../shared/route-error';

type CreateAuthRouterOptions = Readonly<{
  config: AppConfig;
}>;

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
      const existingUser = await findUserByEmail(googleUser.email);

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
        const stateToken = getOptionalTrimmedQueryParam(request.query.state);

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
      const user = await verifyUserCredentials(email, password);

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

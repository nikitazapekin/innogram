import { type Response, Router } from 'express';

import type { AppConfig } from '../config/app-config';
import {
  parseLoginRequestBody,
  parseRefreshTokenCookie,
  parseRegisterRequestBody,
} from '../services/auth-request-parser';
import { type AuthSessionService, toPublicAuthResponse } from '../services/auth-session-service';
import {
  createGoogleAuthorizationUrl,
  createGoogleCodeVerifier,
  createGoogleOAuthState,
  exchangeGoogleAuthorizationCode,
  fetchGoogleUserEmail,
  parseGoogleOAuthState,
} from '../services/google-oauth-service';
import { hashPassword } from '../services/password-service';
import { parseTokenLifetimeSeconds } from '../services/token-service';
import { RouteError } from '../shared/route-error';

type CreateAuthRouterOptions = Readonly<{
  authSessionService: AuthSessionService;
  config: AppConfig;
}>;

export const createAuthRouter = ({
  authSessionService,
  config,
}: CreateAuthRouterOptions): Router => {
  const router = Router();
  const refreshTokenCookieMaxAgeMs = parseTokenLifetimeSeconds(config.refreshTokenExpiresIn) * 1000;

  const setRefreshTokenCookie = (response: Response, refreshToken: string): void => {
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: refreshTokenCookieMaxAgeMs,
      path: '/auth',
      sameSite: 'lax',
    });
  };

  const clearRefreshTokenCookie = (response: Response): void => {
    response.clearCookie('refreshToken', {
      httpOnly: true,
      path: '/auth',
      sameSite: 'lax',
    });
  };

  const startGoogleOAuthFlow = (response: Response) => {
    const codeVerifier = createGoogleCodeVerifier();
    const redirectUri = config.googleRedirectUri;
    const state = createGoogleOAuthState(config, {
      codeVerifier,
      redirectUri,
    });
    const authorizationUrl = createGoogleAuthorizationUrl(config, state, codeVerifier, redirectUri);

    response.set('cache-control', 'no-store');
    response.redirect(302, authorizationUrl);
  };

  router.post('/auth/register', async (request, response, next) => {
    try {
      const { email, password } = parseRegisterRequestBody(request.body);

      await hashPassword(password, config);

      const authResponse = await authSessionService.createSession(email);
      setRefreshTokenCookie(response, authResponse.refreshToken);

      response.status(201).json(toPublicAuthResponse(authResponse));
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

  router.post('/auth/login', async (request, response, next) => {
    try {
      const { email } = parseLoginRequestBody(request.body);
      const authResponse = await authSessionService.createSession(email);
      setRefreshTokenCookie(response, authResponse.refreshToken);

      response.status(200).json(toPublicAuthResponse(authResponse));
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

  router.post('/auth/refresh', async (request, response, next) => {
    try {
      const { refreshToken } = parseRefreshTokenCookie(request.headers.cookie);
      const authResponse = await authSessionService.refreshSession(refreshToken);
      setRefreshTokenCookie(response, authResponse.refreshToken);

      response.status(200).json(toPublicAuthResponse(authResponse));
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

  router.post('/auth/logout', async (request, response, next) => {
    try {
      const { refreshToken } = parseRefreshTokenCookie(request.headers.cookie);

      await authSessionService.logout(refreshToken);
      clearRefreshTokenCookie(response);

      response.status(204).send();
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

  router.get('/auth/google', (_request, response) => {
    startGoogleOAuthFlow(response);
  });

  router.get('/auth/google/callback', async (request, response, next) => {
    try {
      const googleError = request.query.error;

      if (typeof googleError === 'string' && googleError.length > 0) {
        response.status(400).json({
          error: 'GOOGLE_OAUTH_DENIED',
          message: `Google OAuth failed: ${googleError}.`,
        });

        return;
      }

      const code = request.query.code;
      const returnedState = request.query.state;

      if (typeof code !== 'string' || code.length === 0) {
        throw new RouteError(
          400,
          'GOOGLE_OAUTH_CODE_MISSING',
          'Google OAuth callback did not contain an authorization code.',
        );
      }

      if (typeof returnedState !== 'string' || returnedState.length === 0) {
        throw new RouteError(
          400,
          'GOOGLE_OAUTH_STATE_MISSING',
          'Google OAuth callback did not contain a state parameter.',
        );
      }

      const { codeVerifier, redirectUri } = parseGoogleOAuthState(returnedState, config);

      const accessToken = await exchangeGoogleAuthorizationCode(
        code,
        codeVerifier,
        config,
        redirectUri,
      );
      const email = await fetchGoogleUserEmail(accessToken);
      const authResponse = await authSessionService.createSession(email);
      setRefreshTokenCookie(response, authResponse.refreshToken);

      response.set('cache-control', 'no-store');
      response.status(200).json(toPublicAuthResponse(authResponse));
    } catch (error: unknown) {
      if (error instanceof RouteError) {
        if (
          error.code === 'GOOGLE_OAUTH_TOKEN_EXCHANGE_FAILED' &&
          error.message.includes('invalid_grant')
        ) {
          startGoogleOAuthFlow(response);

          return;
        }

        response.set('cache-control', 'no-store');
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

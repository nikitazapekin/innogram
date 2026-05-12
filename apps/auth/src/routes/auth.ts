import { Router } from 'express';

import type { AppConfig } from '../config/app-config';
import { parseLoginRequestBody, parseRegisterRequestBody } from '../services/auth-request-parser';
import { buildAuthResponse } from '../services/auth-response-service';
import {
  createGoogleAuthorizationUrl,
  createGoogleCodeVerifier,
  createGoogleOAuthState,
  exchangeGoogleAuthorizationCode,
  fetchGoogleUserEmail,
  parseGoogleOAuthState,
} from '../services/google-oauth-service';
import { RouteError } from '../shared/route-error';

type CreateAuthRouterOptions = Readonly<{
  config: AppConfig;
}>;

export const createAuthRouter = ({ config }: CreateAuthRouterOptions): Router => {
  const router = Router();

  router.post('/auth/register', async (request, response, next) => {
    try {
      const { email } = parseRegisterRequestBody(request.body);
      const authResponse = buildAuthResponse(email, config);

      response.status(201).json(authResponse);
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
      const authResponse = buildAuthResponse(email, config);

      response.json(authResponse);
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

  router.get('/auth/google', (request, response) => {
    const codeVerifier = createGoogleCodeVerifier();
    const redirectUri = config.googleRedirectUri;
    const state = createGoogleOAuthState(config, {
      codeVerifier,
      redirectUri,
    });
    const authorizationUrl = createGoogleAuthorizationUrl(config, state, codeVerifier, redirectUri);

    response.redirect(302, authorizationUrl);
  });

  router.get('/auth/google/callback', async (request, response, next) => {
    try {
      const googleError = request.query.error;

      if (typeof googleError === 'string' && googleError.trim().length > 0) {
        response.status(400).json({
          error: 'GOOGLE_OAUTH_DENIED',
          message: `Google OAuth failed: ${googleError.trim()}.`,
        });

        return;
      }

      const code = request.query.code;
      const returnedState = request.query.state;

      if (typeof code !== 'string' || code.trim().length === 0) {
        throw new RouteError(
          400,
          'GOOGLE_OAUTH_CODE_MISSING',
          'Google OAuth callback did not contain an authorization code.',
        );
      }

      if (typeof returnedState !== 'string' || returnedState.trim().length === 0) {
        throw new RouteError(
          400,
          'GOOGLE_OAUTH_STATE_MISSING',
          'Google OAuth callback did not contain a state parameter.',
        );
      }

      const { codeVerifier, redirectUri } = parseGoogleOAuthState(returnedState, config);

      const accessToken = await exchangeGoogleAuthorizationCode(
        code.trim(),
        codeVerifier,
        config,
        redirectUri,
      );
      const email = await fetchGoogleUserEmail(accessToken);
      const authResponse = buildAuthResponse(email, config);

      response.status(200).json(authResponse);
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

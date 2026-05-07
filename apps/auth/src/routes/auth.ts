import { Router } from 'express';

import type { AppConfig } from '../config/app-config';
import type { AuthCoreProducer } from '../kafka/auth-core-producer';
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
import { hashPassword, verifyPassword } from '../services/password-service';
import { RouteError } from '../shared/route-error';

type CreateAuthRouterOptions = Readonly<{
  authCoreProducer: AuthCoreProducer;
  config: AppConfig;
}>;

export const createAuthRouter = ({ authCoreProducer, config }: CreateAuthRouterOptions): Router => {
  const router = Router();

  router.post('/auth/register', async (request, response, next) => {
    try {
      const { email, password } = parseRegisterRequestBody(request.body);
      const existingUser = await authCoreProducer.findUserByEmail({ email });

      if (existingUser) {
        throw new RouteError(409, 'USER_ALREADY_EXISTS', 'User with this email already exists.');
      }

      const passwordHash = await hashPassword(password, config);
      const createdUser = await authCoreProducer.createUser({
        email,
        passwordHash,
      });

      response.status(201).json({
        accountId: createdUser.accountId,
        email: createdUser.email,
        userId: createdUser.id,
      });
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
      const { email, password } = parseLoginRequestBody(request.body);
      const user = await authCoreProducer.findUserByEmail({ email });

      if (!user) {
        throw new RouteError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
      }

      const isPasswordValid = await verifyPassword(password, user.passwordHash);

      if (!isPasswordValid) {
        throw new RouteError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
      }

      response.json({
        accountId: user.accountId,
        email: user.email,
        userId: user.id,
      });
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

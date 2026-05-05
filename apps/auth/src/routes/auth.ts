import { type Response, Router } from 'express';

import type { AppConfig } from '../config/app-config';
import { parseLoginRequestBody, parseRegisterRequestBody } from '../services/auth-request-parser';
import { buildAuthResponse } from '../services/auth-response-service';
import {
  createGoogleAuthorizationUrl,
  createGoogleCodeVerifier,
  createGoogleOAuthState,
  exchangeGoogleAuthorizationCode,
  fetchGoogleUserEmail,
} from '../services/google-oauth-service';
import { hashPassword } from '../services/password-service';
import { RouteError } from '../shared/route-error';

type CreateAuthRouterOptions = Readonly<{
  config: AppConfig;
}>;

const GOOGLE_STATE_COOKIE_NAME = 'auth_google_oauth_state';
const GOOGLE_CODE_VERIFIER_COOKIE_NAME = 'auth_google_code_verifier';
const GOOGLE_OAUTH_COOKIE_MAX_AGE_MS = 10 * 60 * 1000;

const parseCookieHeader = (cookieHeader: string | undefined): Record<string, string> => {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split(';').reduce<Record<string, string>>((cookies, part) => {
    const separatorIndex = part.indexOf('=');

    if (separatorIndex <= 0) {
      return cookies;
    }

    const name = part.slice(0, separatorIndex).trim();
    const value = part.slice(separatorIndex + 1).trim();

    if (name.length === 0) {
      return cookies;
    }

    cookies[name] = decodeURIComponent(value);

    return cookies;
  }, {});
};

const readGoogleOAuthCookies = (
  cookieHeader: string | undefined,
): Readonly<{ codeVerifier: string; state: string }> => {
  const cookies = parseCookieHeader(cookieHeader);
  const state = cookies[GOOGLE_STATE_COOKIE_NAME];
  const codeVerifier = cookies[GOOGLE_CODE_VERIFIER_COOKIE_NAME];

  if (!state || !codeVerifier) {
    throw new RouteError(
      400,
      'GOOGLE_OAUTH_SESSION_MISSING',
      'Google OAuth session cookies are missing or expired.',
    );
  }

  return {
    codeVerifier,
    state,
  };
};

const clearGoogleOAuthCookies = (response: Response): void => {
  response.clearCookie(GOOGLE_STATE_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
  });
  response.clearCookie(GOOGLE_CODE_VERIFIER_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
  });
};

export const createAuthRouter = ({ config }: CreateAuthRouterOptions): Router => {
  const router = Router();

  router.post('/auth/register', async (request, response, next) => {
    try {
      const { email, password } = parseRegisterRequestBody(request.body);

      await hashPassword(password, config);

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

  router.get('/auth/google', (request, response) => {
    const state = createGoogleOAuthState();
    const codeVerifier = createGoogleCodeVerifier();
    const authorizationUrl = createGoogleAuthorizationUrl(config, state, codeVerifier);
    const secureCookies = request.secure || request.headers['x-forwarded-proto'] === 'https';

    response.cookie(GOOGLE_STATE_COOKIE_NAME, state, {
      httpOnly: true,
      maxAge: GOOGLE_OAUTH_COOKIE_MAX_AGE_MS,
      sameSite: 'lax',
      secure: secureCookies,
    });
    response.cookie(GOOGLE_CODE_VERIFIER_COOKIE_NAME, codeVerifier, {
      httpOnly: true,
      maxAge: GOOGLE_OAUTH_COOKIE_MAX_AGE_MS,
      sameSite: 'lax',
      secure: secureCookies,
    });

    response.redirect(302, authorizationUrl);
  });

  router.get('/auth/google/callback', async (request, response, next) => {
    try {
      const googleError = request.query.error;

      if (typeof googleError === 'string' && googleError.trim().length > 0) {
        clearGoogleOAuthCookies(response);
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

      const { codeVerifier, state } = readGoogleOAuthCookies(request.headers.cookie);

      if (returnedState !== state) {
        throw new RouteError(
          400,
          'GOOGLE_OAUTH_STATE_MISMATCH',
          'Google OAuth state validation failed.',
        );
      }

      const accessToken = await exchangeGoogleAuthorizationCode(code.trim(), codeVerifier, config);
      const email = await fetchGoogleUserEmail(accessToken);
      const authResponse = buildAuthResponse(email, config);

      clearGoogleOAuthCookies(response);
      response.status(200).json(authResponse);
    } catch (error: unknown) {
      clearGoogleOAuthCookies(response);

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

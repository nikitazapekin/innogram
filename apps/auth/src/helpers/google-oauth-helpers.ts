import type { Response } from 'express';

import type { AppConfig } from '../config/app-config';
import { parseGoogleOAuthState } from '../services/google-oauth-service';
import { parseCookieHeader } from '../shared/parse-cookie-header';
import { RouteError } from '../shared/route-error';

type GoogleCallbackRequest = Readonly<{
  headers: Record<string, string | string[] | undefined>;
  protocol: string;
}>;

type GoogleOAuthCookies = Readonly<{
  codeVerifier: string;
  redirectUri: string | undefined;
  state: string;
}>;

type GoogleOAuthSession = Readonly<{
  codeVerifier: string;
  redirectUri: string;
  state: string;
}>;

const GOOGLE_STATE_COOKIE_NAME = 'auth_google_oauth_state';
const GOOGLE_CODE_VERIFIER_COOKIE_NAME = 'auth_google_code_verifier';
const GOOGLE_REDIRECT_URI_COOKIE_NAME = 'auth_google_oauth_redirect_uri';

export const GOOGLE_OAUTH_COOKIE_MAX_AGE_MS = 10 * 60 * 1000;

const readGoogleOAuthCookies = (cookieHeader: string | undefined): GoogleOAuthCookies => {
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
    redirectUri: cookies[GOOGLE_REDIRECT_URI_COOKIE_NAME],
    state,
  };
};

export const getGoogleCallbackUrl = (request: GoogleCallbackRequest): string => {
  const forwardedProtoHeader = request.headers['x-forwarded-proto'];
  const forwardedHostHeader = request.headers['x-forwarded-host'];
  const hostHeader = request.headers.host;
  let protocol = request.protocol;

  if (typeof forwardedProtoHeader === 'string' && forwardedProtoHeader.trim().length > 0) {
    protocol = forwardedProtoHeader.split(',')[0]?.trim() ?? request.protocol;
  }

  let host = '';

  if (typeof forwardedHostHeader === 'string' && forwardedHostHeader.trim().length > 0) {
    host = forwardedHostHeader.split(',')[0]?.trim() ?? '';
  } else if (typeof hostHeader === 'string') {
    host = hostHeader.trim();
  }

  if (!host) {
    throw new RouteError(
      400,
      'GOOGLE_OAUTH_HOST_MISSING',
      'Google OAuth request did not contain a valid host header.',
    );
  }

  return `${protocol}://${host}/auth/google/callback`;
};

export const setGoogleOAuthCookies = (
  response: Response,
  session: Readonly<{ codeVerifier: string; redirectUri: string; state: string }>,
  secure: boolean,
): void => {
  response.cookie(GOOGLE_STATE_COOKIE_NAME, session.state, {
    httpOnly: true,
    maxAge: GOOGLE_OAUTH_COOKIE_MAX_AGE_MS,
    sameSite: 'lax',
    secure,
  });
  response.cookie(GOOGLE_CODE_VERIFIER_COOKIE_NAME, session.codeVerifier, {
    httpOnly: true,
    maxAge: GOOGLE_OAUTH_COOKIE_MAX_AGE_MS,
    sameSite: 'lax',
    secure,
  });
  response.cookie(GOOGLE_REDIRECT_URI_COOKIE_NAME, session.redirectUri, {
    httpOnly: true,
    maxAge: GOOGLE_OAUTH_COOKIE_MAX_AGE_MS,
    sameSite: 'lax',
    secure,
  });
};

export const clearGoogleOAuthCookies = (response: Response): void => {
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
  response.clearCookie(GOOGLE_REDIRECT_URI_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
  });
};

export const readGoogleOAuthSession = (
  cookieHeader: string | undefined,
  returnedState: string,
  config: AppConfig,
): GoogleOAuthSession => {
  try {
    const session = readGoogleOAuthCookies(cookieHeader);

    if (session.state !== returnedState) {
      throw new RouteError(
        400,
        'GOOGLE_OAUTH_STATE_MISMATCH',
        'Google OAuth state validation failed.',
      );
    }

    const parsedState = parseGoogleOAuthState(returnedState, config);
    const redirectUri = session.redirectUri ?? parsedState.redirectUri;

    return {
      codeVerifier: session.codeVerifier,
      redirectUri,
      state: session.state,
    };
  } catch (error: unknown) {
    const isGoogleOAuthSessionError =
      error instanceof RouteError &&
      (error.code === 'GOOGLE_OAUTH_SESSION_MISSING' ||
        error.code === 'GOOGLE_OAUTH_STATE_MISMATCH');

    if (isGoogleOAuthSessionError) {
      const parsedState = parseGoogleOAuthState(returnedState, config);

      return {
        codeVerifier: parsedState.codeVerifier,
        redirectUri: parsedState.redirectUri,
        state: returnedState,
      };
    }

    throw error;
  }
};

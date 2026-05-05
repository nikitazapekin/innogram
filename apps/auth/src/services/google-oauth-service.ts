import { createHash, randomBytes } from 'node:crypto';

import type { AppConfig } from '../config/app-config';
import { createRouteError } from '../shared/route-error';

const GOOGLE_AUTHORIZATION_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USER_INFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo';
const GOOGLE_SCOPE = 'openid email profile';

type GoogleTokenResponse = Readonly<{
  access_token?: string;
  error?: string;
  error_description?: string;
}>;

type GoogleUserInfoResponse = Readonly<{
  email?: string;
  email_verified?: boolean;
  sub?: string;
}>;

const ensureNonEmptyString = (value: unknown, code: string, message: string): string => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw createRouteError(502, code, message);
  }

  return value.trim();
};

const parseJsonRecord = async (response: Response): Promise<Record<string, unknown>> => {
  let parsedValue: unknown;

  try {
    parsedValue = await response.json();
  } catch {
    throw createRouteError(
      502,
      'GOOGLE_OAUTH_INVALID_RESPONSE',
      'Google OAuth response is invalid.',
    );
  }

  if (typeof parsedValue !== 'object' || parsedValue === null) {
    throw createRouteError(
      502,
      'GOOGLE_OAUTH_INVALID_RESPONSE',
      'Google OAuth response is invalid.',
    );
  }

  return Object(parsedValue);
};

const createSha256Base64Url = (value: string): string =>
  createHash('sha256').update(value).digest('base64url');

export const createGoogleOAuthState = (): string => randomBytes(24).toString('base64url');

export const createGoogleCodeVerifier = (): string => randomBytes(48).toString('base64url');

export const createGoogleAuthorizationUrl = (
  config: AppConfig,
  state: string,
  codeVerifier: string,
): string => {
  const query = new URLSearchParams({
    client_id: config.googleClientId,
    code_challenge: createSha256Base64Url(codeVerifier),
    code_challenge_method: 'S256',
    redirect_uri: config.googleRedirectUri,
    response_type: 'code',
    scope: GOOGLE_SCOPE,
    state,
  });

  return `${GOOGLE_AUTHORIZATION_URL}?${query.toString()}`;
};

export const exchangeGoogleAuthorizationCode = async (
  code: string,
  codeVerifier: string,
  config: AppConfig,
): Promise<string> => {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    body: new URLSearchParams({
      client_id: config.googleClientId,
      client_secret: config.googleClientSecret,
      code,
      code_verifier: codeVerifier,
      grant_type: 'authorization_code',
      redirect_uri: config.googleRedirectUri,
    }),
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  });
  const responseBody = (await parseJsonRecord(response)) as GoogleTokenResponse;

  if (!response.ok) {
    const error = ensureNonEmptyString(
      responseBody.error ?? 'google_oauth_error',
      'GOOGLE_OAUTH_TOKEN_EXCHANGE_FAILED',
      'Google OAuth token exchange failed.',
    );
    const description =
      typeof responseBody.error_description === 'string' && responseBody.error_description.trim()
        ? responseBody.error_description.trim()
        : 'Google OAuth token exchange failed.';

    throw createRouteError(502, 'GOOGLE_OAUTH_TOKEN_EXCHANGE_FAILED', `${error}: ${description}`);
  }

  return ensureNonEmptyString(
    responseBody.access_token,
    'GOOGLE_OAUTH_TOKEN_MISSING',
    'Google OAuth token response did not contain an access token.',
  );
};

export const fetchGoogleUserEmail = async (accessToken: string): Promise<string> => {
  const response = await fetch(GOOGLE_USER_INFO_URL, {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
    method: 'GET',
  });
  const responseBody = (await parseJsonRecord(response)) as GoogleUserInfoResponse;

  if (!response.ok) {
    throw createRouteError(
      502,
      'GOOGLE_OAUTH_USERINFO_FAILED',
      'Google OAuth user info request failed.',
    );
  }

  if (responseBody.email_verified !== true) {
    throw createRouteError(
      403,
      'GOOGLE_EMAIL_NOT_VERIFIED',
      'Google account email must be verified.',
    );
  }

  return ensureNonEmptyString(
    responseBody.email,
    'GOOGLE_EMAIL_MISSING',
    'Google OAuth user info did not contain an email address.',
  ).toLowerCase();
};

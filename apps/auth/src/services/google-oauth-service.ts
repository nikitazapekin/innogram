import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

import type { AppConfig } from '../config/app-config';
import { createRouteError } from '../shared/route-error';

const GOOGLE_AUTHORIZATION_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USER_INFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo';
const GOOGLE_SCOPE = 'openid email profile';

export type GoogleUserProfile = Readonly<{
  email: string;
  googleId: string;
  name: string | null;
}>;

type GoogleOAuthStatePayload = Readonly<{
  codeVerifier: string;
  redirectUri: string;
}>;

const GOOGLE_STATE_TOKEN_VERSION = 'v1';

const ensureNonEmptyString = (value: unknown, code: string, message: string): string => {
  if (typeof value !== 'string' || value.length === 0) {
    throw createRouteError(502, code, message);
  }

  return value;
};

const createSha256Base64Url = (value: string): string =>
  createHash('sha256').update(value).digest('base64url');

const createGoogleStateEncryptionKey = (config: AppConfig): Buffer =>
  createHash('sha256').update(config.accessTokenSecret).digest();

export const createGoogleOAuthState = (
  config: AppConfig,
  payload: Readonly<{ codeVerifier: string; redirectUri: string }>,
): string => {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', createGoogleStateEncryptionKey(config), iv);
  const statePayload: GoogleOAuthStatePayload = {
    codeVerifier: payload.codeVerifier,
    redirectUri: payload.redirectUri,
  };
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(statePayload), 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  const responseString = [
    GOOGLE_STATE_TOKEN_VERSION,
    iv.toString('base64url'),
    encrypted.toString('base64url'),
    tag.toString('base64url'),
  ].join('.');

  return responseString;
};

export const parseGoogleOAuthState = (
  stateToken: string,
  config: AppConfig,
): GoogleOAuthStatePayload => {
  const [version, ivBase64Url, encryptedPayloadBase64Url, authTagBase64Url] = stateToken.split('.');
  const invalidStateTokenParts =
    version !== GOOGLE_STATE_TOKEN_VERSION ||
    !ivBase64Url ||
    !encryptedPayloadBase64Url ||
    !authTagBase64Url;

  if (invalidStateTokenParts) {
    throw createRouteError(
      400,
      'GOOGLE_OAUTH_STATE_INVALID',
      'Google OAuth state token is invalid.',
    );
  }

  try {
    const decipher = createDecipheriv(
      'aes-256-gcm',
      createGoogleStateEncryptionKey(config),
      Buffer.from(ivBase64Url, 'base64url'),
    );

    decipher.setAuthTag(Buffer.from(authTagBase64Url, 'base64url'));

    const decryptedPayload = Buffer.concat([
      decipher.update(Buffer.from(encryptedPayloadBase64Url, 'base64url')),
      decipher.final(),
    ]).toString('utf8');
    const parsedValue: unknown = JSON.parse(decryptedPayload);

    if (typeof parsedValue !== 'object' || parsedValue === null) {
      throw new Error('invalid state payload');
    }

    let codeVerifier: unknown;
    let redirectUri: unknown;

    if ('codeVerifier' in parsedValue) {
      codeVerifier = parsedValue.codeVerifier;
    }

    if ('redirectUri' in parsedValue) {
      redirectUri = parsedValue.redirectUri;
    }

    if (typeof codeVerifier !== 'string' || codeVerifier.trim().length === 0) {
      throw new Error('invalid state payload');
    }

    if (typeof redirectUri !== 'string' || redirectUri.trim().length === 0) {
      throw new Error('invalid state payload');
    }

    return {
      codeVerifier,
      redirectUri,
    };
  } catch (_error: unknown) {
    throw createRouteError(
      400,
      'GOOGLE_OAUTH_STATE_INVALID',
      'Google OAuth state token is invalid.',
    );
  }
};

export const createGoogleCodeVerifier = (): string => randomBytes(48).toString('base64url');

export const createGoogleAuthorizationUrl = (
  config: AppConfig,
  state: string,
  codeVerifier: string,
  redirectUri: string = config.googleRedirectUri,
): string => {
  const query = new URLSearchParams({
    client_id: config.googleClientId,
    code_challenge: createSha256Base64Url(codeVerifier),
    code_challenge_method: 'S256',
    redirect_uri: redirectUri,
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
  redirectUri: string = config.googleRedirectUri,
): Promise<string> => {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    body: new URLSearchParams({
      client_id: config.googleClientId,
      client_secret: config.googleClientSecret,
      code,
      code_verifier: codeVerifier,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  });
  let responseBody: unknown;

  try {
    responseBody = await response.json();
  } catch {
    throw createRouteError(
      502,
      'GOOGLE_OAUTH_INVALID_RESPONSE',
      'Google OAuth response is invalid.',
    );
  }

  if (typeof responseBody !== 'object' || responseBody === null) {
    throw createRouteError(
      502,
      'GOOGLE_OAUTH_INVALID_RESPONSE',
      'Google OAuth response is invalid.',
    );
  }

  const responseBodyRecord = Object(responseBody);

  if (!response.ok) {
    const error = ensureNonEmptyString(
      responseBodyRecord.error ?? 'google_oauth_error',
      'GOOGLE_OAUTH_TOKEN_EXCHANGE_FAILED',
      'Google OAuth token exchange failed.',
    );
    let description = 'Google OAuth token exchange failed.';

    if (
      typeof responseBodyRecord.error_description === 'string' &&
      responseBodyRecord.error_description
    ) {
      description = responseBodyRecord.error_description;
    }

    throw createRouteError(502, 'GOOGLE_OAUTH_TOKEN_EXCHANGE_FAILED', `${error}: ${description}`);
  }

  return ensureNonEmptyString(
    responseBodyRecord.access_token,
    'GOOGLE_OAUTH_TOKEN_MISSING',
    'Google OAuth token response did not contain an access token.',
  );
};

export const fetchGoogleUserProfile = async (accessToken: string): Promise<GoogleUserProfile> => {
  const response = await fetch(GOOGLE_USER_INFO_URL, {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
    method: 'GET',
  });
  let responseBody: unknown;

  try {
    responseBody = await response.json();
  } catch {
    throw createRouteError(
      502,
      'GOOGLE_OAUTH_INVALID_RESPONSE',
      'Google OAuth response is invalid.',
    );
  }

  if (typeof responseBody !== 'object' || responseBody === null) {
    throw createRouteError(
      502,
      'GOOGLE_OAUTH_INVALID_RESPONSE',
      'Google OAuth response is invalid.',
    );
  }

  const responseBodyRecord = Object(responseBody);

  if (!response.ok) {
    throw createRouteError(
      502,
      'GOOGLE_OAUTH_USERINFO_FAILED',
      'Google OAuth user info request failed.',
    );
  }

  if (responseBodyRecord.email_verified !== true) {
    throw createRouteError(
      403,
      'GOOGLE_EMAIL_NOT_VERIFIED',
      'Google account email must be verified.',
    );
  }

  const email = ensureNonEmptyString(
    responseBodyRecord.email,
    'GOOGLE_EMAIL_MISSING',
    'Google OAuth user info did not contain an email address.',
  ).toLowerCase();
  const googleId = ensureNonEmptyString(
    responseBodyRecord.sub,
    'GOOGLE_SUB_MISSING',
    'Google OAuth user info did not contain a Google user id.',
  );
  let name: string | null = null;

  if (typeof responseBodyRecord.name === 'string' && responseBodyRecord.name.length > 0) {
    name = responseBodyRecord.name;
  }

  return {
    email,
    googleId,
    name,
  };
};

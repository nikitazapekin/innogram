import axios from 'axios';

import type { AppConfig } from '../config/app-config';
import { parseLoginRequestBody, parseRegisterRequestBody } from '../services/auth-request-parser';
import { buildAuthResponse } from '../services/auth-response-service';
import { hashPassword, verifyPassword } from '../services/password-service';
import {
  createGoogleAuthorizationUrl,
  createGoogleCodeVerifier,
  createGoogleOAuthState,
  exchangeGoogleAuthorizationCode,
  fetchGoogleUserEmail,
  parseGoogleOAuthState,
} from '../services/google-oauth-service';
import { createRouteError, RouteError } from '../shared/route-error';

type AppRequest = Readonly<{
  body: unknown;
  method: string;
  path: string;
  query: Record<string, string>;
}>;

type AppResponse = Readonly<{
  json: (statusCode: number, body: unknown) => void;
  redirect: (statusCode: number, location: string) => void;
}>;

type AuthUser = Readonly<{
  id: number;
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}>;

const CORE_AUTH_URL = process.env.AUTH_CORE_HTTP_URL?.trim() || 'http://localhost:3001';

const handleRegister = async (
  request: AppRequest,
  response: AppResponse,
  config: AppConfig,
): Promise<void> => {
  const { email, password } = parseRegisterRequestBody(request.body);
  const { data: user } = await axios.get<AuthUser | null>(`${CORE_AUTH_URL}/auth/user`, {
    params: { email },
  });

  if (user) {
    throw createRouteError(409, 'USER_ALREADY_EXISTS', 'User with typed login already exist');
  }

  const passwordHash = await hashPassword(password, config);

  await axios.post<AuthUser>(`${CORE_AUTH_URL}/auth/user`, {
    email,
    passwordHash,
  });

  response.json(201, buildAuthResponse(email, config));
};

const handleLogin = async (
  request: AppRequest,
  response: AppResponse,
  config: AppConfig,
): Promise<void> => {
  const { email, password } = parseLoginRequestBody(request.body);
  const { data: user } = await axios.get<AuthUser | null>(`${CORE_AUTH_URL}/auth/user`, {
    params: { email },
  });

  if (user) {
    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      throw createRouteError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
    }

    response.json(200, buildAuthResponse(user.email, config));

    return;
  }

  throw createRouteError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
};

const handleGoogleAuth = (response: AppResponse, config: AppConfig): void => {
  const codeVerifier = createGoogleCodeVerifier();
  const redirectUri = config.googleRedirectUri;
  const state = createGoogleOAuthState(config, {
    codeVerifier,
    redirectUri,
  });
  const authorizationUrl = createGoogleAuthorizationUrl(config, state, codeVerifier, redirectUri);

  response.redirect(302, authorizationUrl);
};

const handleGoogleCallback = async (
  request: AppRequest,
  response: AppResponse,
  config: AppConfig,
): Promise<void> => {
  const googleError = request.query.error;

  if (typeof googleError === 'string' && googleError.trim().length > 0) {
    response.json(400, {
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

  response.json(200, buildAuthResponse(email, config));
};

export const handleAuthRoute = async (
  request: AppRequest,
  response: AppResponse,
  config: AppConfig,
): Promise<boolean> => {
  try {
    if (request.method === 'POST' && request.path === '/auth/register') {
      await handleRegister(request, response, config);

      return true;
    }

    if (request.method === 'POST' && request.path === '/auth/login') {
      await handleLogin(request, response, config);

      return true;
    }

    if (request.method === 'GET' && request.path === '/auth/google') {
      handleGoogleAuth(response, config);

      return true;
    }

    if (request.method === 'GET' && request.path === '/auth/google/callback') {
      await handleGoogleCallback(request, response, config);

      return true;
    }

    return false;
  } catch (error: unknown) {
    if (error instanceof RouteError) {
      response.json(error.status, {
        error: error.code,
        message: error.message,
      });

      return true;
    }

    throw error;
  }
};

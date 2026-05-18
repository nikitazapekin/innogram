import type { Request, Response } from 'express';

import { createRouteError } from '../shared/route-error';

const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

export const setRefreshTokenCookie = (response: Response, refreshToken: string): void => {
  response.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
  });
};

export const clearRefreshTokenCookie = (response: Response): void => {
  response.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
  });
};

export const getRefreshTokenFromCookies = (cookieHeader: string | undefined): string | null => {
  if (!cookieHeader) {
    return null;
  }

  const cookieValue = cookieHeader
    .split(';')
    .find((part) => part.startsWith(`${REFRESH_TOKEN_COOKIE_NAME}=`));

  if (!cookieValue) {
    return null;
  }

  const [, rawToken] = cookieValue.split('=');

  if (!rawToken) {
    return null;
  }

  return decodeURIComponent(rawToken);
};

export const resolveRefreshToken = (request: Request): string => {
  const refreshTokenFromCookie = getRefreshTokenFromCookies(request.headers.cookie);

  if (refreshTokenFromCookie) {
    return refreshTokenFromCookie;
  }

  if (typeof request.body !== 'object' || request.body === null) {
    throw createRouteError(400, 'INVALID_REQUEST', 'Request body must be an object.');
  }

  const refreshToken = request.body.refreshToken;

  if (typeof refreshToken !== 'string' || refreshToken.length === 0) {
    throw createRouteError(
      400,
      'INVALID_REFRESH_TOKEN',
      'Field "refreshToken" must be a non-empty string.',
    );
  }

  return refreshToken;
};

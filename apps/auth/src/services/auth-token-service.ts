import type { AppConfig } from '../config/app-config';
import { createRouteError } from '../shared/route-error';
import { getAccessTokenPublicKeyPem, validateAccessToken } from './token-service';

export type AuthenticatedAccessTokenPayload = Readonly<{
  email: string;
  exp: number;
  iat: number;
  sub: string;
  tokenType: 'access';
}>;

type RouteErrorLike = Readonly<{
  code: string;
  message: string;
  status: number;
}>;

const isRouteErrorLike = (error: unknown): error is RouteErrorLike =>
  typeof error === 'object' &&
  error !== null &&
  'status' in error &&
  'code' in error &&
  'message' in error;

const extractBearerToken = (authorizationHeader: string | undefined): string => {
  if (!authorizationHeader) {
    throw createRouteError(
      401,
      'AUTHORIZATION_HEADER_REQUIRED',
      'Authorization header is required.',
    );
  }

  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw createRouteError(
      401,
      'INVALID_AUTHORIZATION_HEADER',
      'Authorization header must use Bearer token.',
    );
  }

  return token;
};

export const validateAuthorizationHeader = (
  authorizationHeader: string | undefined,
  config: AppConfig,
): AuthenticatedAccessTokenPayload => {
  const token = extractBearerToken(authorizationHeader);

  try {
    const payload = validateAccessToken(
      token,
      getAccessTokenPublicKeyPem(config.accessTokenPrivateKey),
    );

    return {
      ...payload,
      tokenType: 'access',
    };
  } catch (error: unknown) {
    if (isRouteErrorLike(error)) {
      throw createRouteError(401, error.code, error.message);
    }

    throw error;
  }
};

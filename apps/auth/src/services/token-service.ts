import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

import { createRouteError } from '../shared/route-error';

type TokenType = 'access' | 'refresh';

type UnsignedAuthTokenPayload = Readonly<{
  email: string;
  jti: string;
  sessionId: string;
  sub: string;
  tokenType: TokenType;
}>;

export type AuthTokenPayload = Readonly<{
  email: string;
  exp: number;
  iat: number;
  jti: string;
  sessionId: string;
  sub: string;
  tokenType: TokenType;
}>;

const JWT_ALGORITHM = 'HS256';

const ensureNonEmptyString = (value: unknown): string => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw createRouteError(500, 'INVALID_TOKEN_PAYLOAD', 'JWT payload has invalid shape.');
  }

  return value;
};

const encodeBase64Url = (value: string): string => Buffer.from(value, 'utf8').toString('base64url');

const decodeBase64Url = (value: string): string => Buffer.from(value, 'base64url').toString('utf8');

const parseJsonRecord = (value: string): Record<string, unknown> => {
  const parsedValue: unknown = JSON.parse(value);

  if (typeof parsedValue !== 'object' || parsedValue === null) {
    throw createRouteError(500, 'INVALID_TOKEN', 'JWT content must be a JSON object.');
  }

  return Object(parsedValue);
};

export const parseTokenLifetimeSeconds = (expiresIn: string): number => {
  if (/^\d+$/.test(expiresIn)) {
    return Number(expiresIn);
  }

  const match = /^(?<value>\d+)(?<unit>[smhd])$/.exec(expiresIn);

  if (!match?.groups) {
    throw createRouteError(500, 'INVALID_TOKEN_TTL', 'JWT expiration format is invalid.');
  }

  const value = Number(match.groups.value);

  if (match.groups.unit === 's') {
    return value;
  }

  if (match.groups.unit === 'm') {
    return value * 60;
  }

  if (match.groups.unit === 'h') {
    return value * 60 * 60;
  }

  return value * 60 * 60 * 24;
};

const signHmacSha256 = (value: string, secret: string): Buffer =>
  createHmac('sha256', secret).update(value).digest();

const createTokenPayload = (
  email: string,
  sessionId: string,
  tokenType: TokenType,
): UnsignedAuthTokenPayload => ({
  email,
  jti: randomUUID(),
  sessionId,
  sub: email,
  tokenType,
});

const signToken = (
  payload: UnsignedAuthTokenPayload,
  secret: string,
  expiresIn: string,
): string => {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + parseTokenLifetimeSeconds(expiresIn);
  const header = {
    alg: JWT_ALGORITHM,
    typ: 'JWT',
  };
  const tokenPayload: AuthTokenPayload = {
    ...payload,
    exp: expiresAt,
    iat: issuedAt,
  };
  const encodedHeader = encodeBase64Url(JSON.stringify(header));
  const encodedPayload = encodeBase64Url(JSON.stringify(tokenPayload));
  const signature = signHmacSha256(`${encodedHeader}.${encodedPayload}`, secret).toString(
    'base64url',
  );

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

const validateToken = (
  token: string,
  secret: string,
  expectedTokenType: TokenType,
): AuthTokenPayload => {
  const tokenParts = token.split('.');

  if (tokenParts.length !== 3) {
    throw createRouteError(500, 'INVALID_TOKEN', 'JWT must contain header, payload and signature.');
  }

  const [encodedHeader, encodedPayload, encodedSignature] = tokenParts;
  const expectedSignature = signHmacSha256(`${encodedHeader}.${encodedPayload}`, secret);
  const actualSignature = Buffer.from(encodedSignature, 'base64url');

  if (
    actualSignature.length !== expectedSignature.length ||
    !timingSafeEqual(actualSignature, expectedSignature)
  ) {
    throw createRouteError(500, 'INVALID_TOKEN_SIGNATURE', 'JWT signature validation failed.');
  }

  const decodedHeader = parseJsonRecord(decodeBase64Url(encodedHeader));
  const decodedPayload = parseJsonRecord(decodeBase64Url(encodedPayload));

  if (decodedHeader.alg !== JWT_ALGORITHM || decodedHeader.typ !== 'JWT') {
    throw createRouteError(500, 'INVALID_TOKEN_HEADER', 'JWT header has invalid shape.');
  }

  const { email, exp, iat, jti, sessionId, sub, tokenType } = decodedPayload;

  if (typeof exp !== 'number' || typeof iat !== 'number' || tokenType !== expectedTokenType) {
    throw createRouteError(500, 'INVALID_TOKEN_PAYLOAD', 'JWT payload has invalid shape.');
  }

  const validatedEmail = ensureNonEmptyString(email);
  const validatedJti = ensureNonEmptyString(jti);
  const validatedSessionId = ensureNonEmptyString(sessionId);
  const validatedSub = ensureNonEmptyString(sub);

  if (exp <= Math.floor(Date.now() / 1000)) {
    throw createRouteError(500, 'TOKEN_EXPIRED', 'JWT has already expired.');
  }

  return {
    email: validatedEmail,
    exp,
    iat,
    jti: validatedJti,
    sessionId: validatedSessionId,
    sub: validatedSub,
    tokenType: expectedTokenType,
  };
};

export const createAccessToken = (
  email: string,
  sessionId: string,
  secret: string,
  expiresIn: string,
): string => signToken(createTokenPayload(email, sessionId, 'access'), secret, expiresIn);

export const createRefreshToken = (
  email: string,
  sessionId: string,
  secret: string,
  expiresIn: string,
): string => signToken(createTokenPayload(email, sessionId, 'refresh'), secret, expiresIn);

export const validateAccessToken = (token: string, secret: string): AuthTokenPayload =>
  validateToken(token, secret, 'access');

export const validateRefreshToken = (token: string, secret: string): AuthTokenPayload =>
  validateToken(token, secret, 'refresh');

import { createPublicKey, verify } from 'node:crypto';
import { UnauthorizedException } from '@nestjs/common';

import type { AuthenticatedAccessTokenPayload } from './types';

type JwtHeader = Readonly<{
  alg?: unknown;
  kid?: unknown;
  typ?: unknown;
}>;

const JWT_ALGORITHM = 'RS256';

const ensureNonEmptyString = (value: unknown): string => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new UnauthorizedException('JWT payload has invalid shape.');
  }

  return value;
};

const decodeBase64Url = (value: string): string => Buffer.from(value, 'base64url').toString('utf8');

const parseJsonRecord = (value: string): Record<string, unknown> => {
  const parsedValue: unknown = JSON.parse(value);

  if (typeof parsedValue !== 'object' || parsedValue === null) {
    throw new UnauthorizedException('JWT content must be a JSON object.');
  }

  return Object(parsedValue);
};

const parseHeader = (encodedHeader: string): JwtHeader =>
  parseJsonRecord(decodeBase64Url(encodedHeader));

export const extractKeyId = (token: string): string => {
  const tokenParts = token.split('.');

  if (tokenParts.length !== 3) {
    throw new UnauthorizedException('JWT must contain header, payload and signature.');
  }

  const [encodedHeader] = tokenParts;
  const header = parseHeader(encodedHeader);

  if (header.alg !== JWT_ALGORITHM || header.typ !== 'JWT' || typeof header.kid !== 'string') {
    throw new UnauthorizedException('JWT header has invalid shape.');
  }

  return header.kid;
};

export const validateAccessToken = (
  token: string,
  publicKeyPem: string,
): AuthenticatedAccessTokenPayload => {
  const tokenParts = token.split('.');

  if (tokenParts.length !== 3) {
    throw new UnauthorizedException('JWT must contain header, payload and signature.');
  }

  const [encodedHeader, encodedPayload, encodedSignature] = tokenParts;
  const header = parseHeader(encodedHeader);

  if (header.alg !== JWT_ALGORITHM || header.typ !== 'JWT' || typeof header.kid !== 'string') {
    throw new UnauthorizedException('JWT header has invalid shape.');
  }

  const isValidSignature = verify(
    'RSA-SHA256',
    Buffer.from(`${encodedHeader}.${encodedPayload}`),
    createPublicKey(publicKeyPem),
    Buffer.from(encodedSignature, 'base64url'),
  );

  if (!isValidSignature) {
    throw new UnauthorizedException('JWT signature validation failed.');
  }

  const decodedPayload = parseJsonRecord(decodeBase64Url(encodedPayload));
  const { email, exp, iat, sub, tokenType } = decodedPayload;

  if (typeof exp !== 'number' || typeof iat !== 'number' || tokenType !== 'access') {
    throw new UnauthorizedException('JWT payload has invalid shape.');
  }

  const validatedEmail = ensureNonEmptyString(email);
  const validatedSub = ensureNonEmptyString(sub);

  if (exp <= Math.floor(Date.now() / 1000)) {
    throw new UnauthorizedException('JWT has already expired.');
  }

  return {
    email: validatedEmail,
    exp,
    iat,
    sub: validatedSub,
    tokenType: 'access',
  };
};

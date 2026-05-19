import {
  createHmac,
  createPrivateKey,
  createPublicKey,
  sign,
  timingSafeEqual,
  verify,
} from 'node:crypto';

import { createRouteError } from '../shared/route-error';

type TokenType = 'access' | 'refresh';

type UnsignedAuthTokenPayload = Readonly<{
  email: string;
  sub: string;
  tokenType: TokenType;
}>;

type AuthTokenPayload = Readonly<{
  email: string;
  exp: number;
  iat: number;
  sub: string;
  tokenType: TokenType;
}>;

type AccessTokenHeader = Readonly<{
  alg: 'RS256';
  kid: string;
  typ: 'JWT';
}>;

type RefreshTokenHeader = Readonly<{
  alg: 'HS256';
  typ: 'JWT';
}>;

type JwtHeader = AccessTokenHeader | RefreshTokenHeader;

const ACCESS_TOKEN_ALGORITHM = 'RS256';
const REFRESH_TOKEN_ALGORITHM = 'HS256';

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

const parseTokenLifetimeSeconds = (expiresIn: string): number => {
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

const createUnsignedTokenPayload = (
  email: string,
  tokenType: TokenType,
): UnsignedAuthTokenPayload => ({
  email,
  sub: email,
  tokenType,
});

const createToken = (header: JwtHeader, payload: AuthTokenPayload, signature: string): string => {
  const encodedHeader = encodeBase64Url(JSON.stringify(header));
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

const createSignedTokenPayload = (
  payload: UnsignedAuthTokenPayload,
  expiresIn: string,
): AuthTokenPayload => {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + parseTokenLifetimeSeconds(expiresIn);

  return {
    ...payload,
    exp: expiresAt,
    iat: issuedAt,
  };
};

const signAccessToken = (
  payload: UnsignedAuthTokenPayload,
  privateKeyPem: string,
  expiresIn: string,
  keyId: string,
): string => {
  const header: AccessTokenHeader = {
    alg: ACCESS_TOKEN_ALGORITHM,
    kid: keyId,
    typ: 'JWT',
  };
  const tokenPayload = createSignedTokenPayload(payload, expiresIn);
  const encodedHeader = encodeBase64Url(JSON.stringify(header));
  const encodedPayload = encodeBase64Url(JSON.stringify(tokenPayload));
  const signature = sign(
    'RSA-SHA256',
    Buffer.from(`${encodedHeader}.${encodedPayload}`),
    createPrivateKey(privateKeyPem),
  ).toString('base64url');

  return createToken(header, tokenPayload, signature);
};

const signRefreshToken = (
  payload: UnsignedAuthTokenPayload,
  secret: string,
  expiresIn: string,
): string => {
  const header: RefreshTokenHeader = {
    alg: REFRESH_TOKEN_ALGORITHM,
    typ: 'JWT',
  };
  const tokenPayload = createSignedTokenPayload(payload, expiresIn);
  const encodedHeader = encodeBase64Url(JSON.stringify(header));
  const encodedPayload = encodeBase64Url(JSON.stringify(tokenPayload));
  const signature = signHmacSha256(`${encodedHeader}.${encodedPayload}`, secret).toString(
    'base64url',
  );

  return createToken(header, tokenPayload, signature);
};

const validateCommonTokenPayload = (
  decodedPayload: Record<string, unknown>,
  expectedTokenType: TokenType,
): AuthTokenPayload => {
  const { email, exp, iat, sub, tokenType } = decodedPayload;

  if (typeof exp !== 'number' || typeof iat !== 'number' || tokenType !== expectedTokenType) {
    throw createRouteError(500, 'INVALID_TOKEN_PAYLOAD', 'JWT payload has invalid shape.');
  }

  const validatedEmail = ensureNonEmptyString(email);
  const validatedSub = ensureNonEmptyString(sub);

  if (exp <= Math.floor(Date.now() / 1000)) {
    throw createRouteError(500, 'TOKEN_EXPIRED', 'JWT has already expired.');
  }

  return {
    email: validatedEmail,
    exp,
    iat,
    sub: validatedSub,
    tokenType: expectedTokenType,
  };
};

const validateRefreshTokenInternal = (
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

  if (decodedHeader.alg !== REFRESH_TOKEN_ALGORITHM || decodedHeader.typ !== 'JWT') {
    throw createRouteError(500, 'INVALID_TOKEN_HEADER', 'JWT header has invalid shape.');
  }

  return validateCommonTokenPayload(decodedPayload, expectedTokenType);
};

export const createAccessToken = (
  email: string,
  privateKeyPem: string,
  expiresIn: string,
  keyId: string,
): string =>
  signAccessToken(createUnsignedTokenPayload(email, 'access'), privateKeyPem, expiresIn, keyId);

export const createRefreshToken = (email: string, secret: string, expiresIn: string): string =>
  signRefreshToken(createUnsignedTokenPayload(email, 'refresh'), secret, expiresIn);

export const getAccessTokenPublicKeyPem = (privateKeyPem: string): string =>
  createPublicKey(createPrivateKey(privateKeyPem))
    .export({ format: 'pem', type: 'spki' })
    .toString();

export const getAccessTokenJwks = (
  privateKeyPem: string,
  keyId: string,
): Readonly<{ keys: readonly [Record<string, string>] }> => {
  const jwk = createPublicKey(createPrivateKey(privateKeyPem)).export({ format: 'jwk' });

  if (
    typeof jwk !== 'object' ||
    jwk === null ||
    typeof jwk.e !== 'string' ||
    typeof jwk.kty !== 'string' ||
    typeof jwk.n !== 'string'
  ) {
    throw createRouteError(500, 'INVALID_JWKS', 'Failed to export JWKS.');
  }

  return {
    keys: [
      {
        alg: ACCESS_TOKEN_ALGORITHM,
        e: jwk.e,
        kid: keyId,
        kty: jwk.kty,
        n: jwk.n,
        use: 'sig',
      },
    ],
  };
};

export const validateAccessToken = (token: string, publicKeyPem: string): AuthTokenPayload => {
  const tokenParts = token.split('.');

  if (tokenParts.length !== 3) {
    throw createRouteError(500, 'INVALID_TOKEN', 'JWT must contain header, payload and signature.');
  }

  const [encodedHeader, encodedPayload, encodedSignature] = tokenParts;
  const decodedHeader = parseJsonRecord(decodeBase64Url(encodedHeader));

  if (
    decodedHeader.alg !== ACCESS_TOKEN_ALGORITHM ||
    decodedHeader.typ !== 'JWT' ||
    typeof decodedHeader.kid !== 'string'
  ) {
    throw createRouteError(500, 'INVALID_TOKEN_HEADER', 'JWT header has invalid shape.');
  }

  const isValidSignature = verify(
    'RSA-SHA256',
    Buffer.from(`${encodedHeader}.${encodedPayload}`),
    createPublicKey(publicKeyPem),
    Buffer.from(encodedSignature, 'base64url'),
  );

  if (!isValidSignature) {
    throw createRouteError(500, 'INVALID_TOKEN_SIGNATURE', 'JWT signature validation failed.');
  }

  return validateCommonTokenPayload(parseJsonRecord(decodeBase64Url(encodedPayload)), 'access');
};

export const validateRefreshToken = (token: string, secret: string): AuthTokenPayload =>
  validateRefreshTokenInternal(token, secret, 'refresh');

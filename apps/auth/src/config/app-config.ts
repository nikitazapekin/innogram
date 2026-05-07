import { loadEnvironment } from './load-environment';

export type AppConfig = Readonly<{
  accessTokenExpiresIn: string;
  accessTokenSecret: string;
  googleClientId: string;
  googleClientSecret: string;
  googleRedirectUri: string;
  passwordSaltRounds: number;
  port: number;
  redisUrl: string;
  refreshTokenExpiresIn: string;
  refreshTokenSecret: string;
}>;

const readRequiredPositiveInteger = (value: string | undefined, envName: string): number => {
  if (!value) {
    throw new Error(`Missing required config value: ${envName}`);
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`${envName} must be a positive integer.`);
  }

  return parsedValue;
};

export const loadConfig = (): AppConfig => {
  loadEnvironment();

  const accessTokenExpiresIn = process.env.AUTH_JWT_ACCESS_TOKEN_EXPIRES_IN;
  const accessTokenSecret = process.env.AUTH_JWT_ACCESS_TOKEN_SECRET;
  const googleClientId = process.env.AUTH_GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.AUTH_GOOGLE_CLIENT_SECRET;
  const googleRedirectUri = process.env.AUTH_GOOGLE_REDIRECT_URI;
  const redisUrl = process.env.AUTH_REDIS_URL;
  const refreshTokenExpiresIn = process.env.AUTH_JWT_REFRESH_TOKEN_EXPIRES_IN;
  const refreshTokenSecret = process.env.AUTH_JWT_REFRESH_TOKEN_SECRET;

  if (!accessTokenExpiresIn) {
    throw new Error('Missing required config value: AUTH_JWT_ACCESS_TOKEN_EXPIRES_IN');
  }

  if (!accessTokenSecret) {
    throw new Error('Missing required config value: AUTH_JWT_ACCESS_TOKEN_SECRET');
  }

  if (!googleClientId) {
    throw new Error('Missing required config value: AUTH_GOOGLE_CLIENT_ID');
  }

  if (!googleClientSecret) {
    throw new Error('Missing required config value: AUTH_GOOGLE_CLIENT_SECRET');
  }

  if (!googleRedirectUri) {
    throw new Error('Missing required config value: AUTH_GOOGLE_REDIRECT_URI');
  }

  if (!redisUrl) {
    throw new Error('Missing required config value: AUTH_REDIS_URL');
  }

  if (!refreshTokenExpiresIn) {
    throw new Error('Missing required config value: AUTH_JWT_REFRESH_TOKEN_EXPIRES_IN');
  }

  if (!refreshTokenSecret) {
    throw new Error('Missing required config value: AUTH_JWT_REFRESH_TOKEN_SECRET');
  }

  return {
    accessTokenExpiresIn,
    accessTokenSecret,
    googleClientId,
    googleClientSecret,
    googleRedirectUri,
    passwordSaltRounds: readRequiredPositiveInteger(
      process.env.AUTH_PASSWORD_SALT_ROUNDS,
      'AUTH_PASSWORD_SALT_ROUNDS',
    ),
    port: readRequiredPositiveInteger(process.env.AUTH_HTTP_PORT, 'AUTH_HTTP_PORT'),
    redisUrl,
    refreshTokenExpiresIn,
    refreshTokenSecret,
  };
};

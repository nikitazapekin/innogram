import { config as loadEnvironment } from 'dotenv';

const DEFAULT_PORT = 3002;
const DEFAULT_ACCESS_TOKEN_SECRET = 'innogram-auth-access-secret';
const DEFAULT_REFRESH_TOKEN_SECRET = 'innogram-auth-refresh-secret';
const DEFAULT_ACCESS_TOKEN_EXPIRES_IN = '15m';
const DEFAULT_REFRESH_TOKEN_EXPIRES_IN = '7d';
const DEFAULT_PASSWORD_SALT_ROUNDS = 10;

export type AppConfig = Readonly<{
  accessTokenExpiresIn: string;
  accessTokenSecret: string;
  passwordSaltRounds: number;
  port: number;
  refreshTokenExpiresIn: string;
  refreshTokenSecret: string;
}>;

const readPort = (): number => {
  const rawValue = process.env.AUTH_HTTP_PORT?.trim() || process.env.PORT?.trim();

  if (!rawValue) {
    return DEFAULT_PORT;
  }

  const port = Number(rawValue);

  return port;
};

const readString = (value: string | undefined, fallback: string): string =>
  value?.trim() || fallback;

const readPositiveInteger = (value: string | undefined, fallback: number): number => {
  const parsedValue = Number(value?.trim() || fallback);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return fallback;
  }

  return parsedValue;
};

export const loadConfig = (): AppConfig => {
  loadEnvironment();

  return {
    accessTokenExpiresIn: readString(
      process.env.AUTH_JWT_ACCESS_TOKEN_EXPIRES_IN,
      DEFAULT_ACCESS_TOKEN_EXPIRES_IN,
    ),
    accessTokenSecret: readString(
      process.env.AUTH_JWT_ACCESS_TOKEN_SECRET,
      DEFAULT_ACCESS_TOKEN_SECRET,
    ),
    passwordSaltRounds: readPositiveInteger(
      process.env.AUTH_PASSWORD_SALT_ROUNDS,
      DEFAULT_PASSWORD_SALT_ROUNDS,
    ),
    port: readPort(),
    refreshTokenExpiresIn: readString(
      process.env.AUTH_JWT_REFRESH_TOKEN_EXPIRES_IN,
      DEFAULT_REFRESH_TOKEN_EXPIRES_IN,
    ),
    refreshTokenSecret: readString(
      process.env.AUTH_JWT_REFRESH_TOKEN_SECRET,
      DEFAULT_REFRESH_TOKEN_SECRET,
    ),
  };
};

import { loadEnvironment } from './load-environment';

export type AppConfig = Readonly<{
  accessTokenExpiresIn: string;
  accessTokenSecret: string;
  passwordSaltRounds: number;
  port: number;
  refreshTokenExpiresIn: string;
  refreshTokenSecret: string;
}>;

const readRequiredString = (value: string | undefined, envName: string): string => {
  const parsedValue = value?.trim();

  if (!parsedValue) {
    throw new Error(`Missing required environment variable: ${envName}`);
  }

  return parsedValue;
};

const readRequiredPositiveInteger = (value: string | undefined, envName: string): number => {
  const rawValue = readRequiredString(value, envName);
  const parsedValue = Number(rawValue);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`Environment variable ${envName} must be a positive integer.`);
  }

  return parsedValue;
};

export const loadConfig = (): AppConfig => {
  loadEnvironment();

  return {
    accessTokenExpiresIn: readRequiredString(
      process.env.AUTH_JWT_ACCESS_TOKEN_EXPIRES_IN,
      'AUTH_JWT_ACCESS_TOKEN_EXPIRES_IN',
    ),
    accessTokenSecret: readRequiredString(
      process.env.AUTH_JWT_ACCESS_TOKEN_SECRET,
      'AUTH_JWT_ACCESS_TOKEN_SECRET',
    ),
    passwordSaltRounds: readRequiredPositiveInteger(
      process.env.AUTH_PASSWORD_SALT_ROUNDS,
      'AUTH_PASSWORD_SALT_ROUNDS',
    ),
    port: readRequiredPositiveInteger(process.env.AUTH_HTTP_PORT, 'AUTH_HTTP_PORT'),
    refreshTokenExpiresIn: readRequiredString(
      process.env.AUTH_JWT_REFRESH_TOKEN_EXPIRES_IN,
      'AUTH_JWT_REFRESH_TOKEN_EXPIRES_IN',
    ),
    refreshTokenSecret: readRequiredString(
      process.env.AUTH_JWT_REFRESH_TOKEN_SECRET,
      'AUTH_JWT_REFRESH_TOKEN_SECRET',
    ),
  };
};

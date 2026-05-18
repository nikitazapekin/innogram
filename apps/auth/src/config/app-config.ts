import { loadEnvironment } from './load-environment';

export type AppConfig = Readonly<{
  accessTokenExpiresIn: string;
  accessTokenSecret: string;
  allowedOAuthRedirectOrigins: readonly string[];
  googleClientId: string;
  googleClientSecret: string;
  googleRedirectUri: string;
  passwordSaltRounds: number;
  port: number;
  redisKeyPrefix: string;
  redisUrl: string;
  refreshTokenExpiresIn: string;
  refreshTokenSecret: string;
}>;

const readRequiredString = (value: string | undefined, envName: string): string => {
  const parsedValue = value;

  if (!parsedValue) {
    throw new Error(`Missing required config value: ${envName}`);
  }

  return parsedValue;
};

const readRequiredPositiveInteger = (value: string | undefined, envName: string): number => {
  const rawValue = readRequiredString(value, envName);
  const parsedValue = Number(rawValue);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`${envName} must be a positive integer.`);
  }

  return parsedValue;
};

const readRequiredStringList = (value: string | undefined, envName: string): readonly string[] => {
  const parsedValues = readRequiredString(value, envName)
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  if (parsedValues.length === 0) {
    throw new Error(`${envName} must contain at least one value.`);
  }

  return parsedValues;
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
    allowedOAuthRedirectOrigins: readRequiredStringList(
      process.env.AUTH_ALLOWED_OAUTH_REDIRECT_ORIGINS,
      'AUTH_ALLOWED_OAUTH_REDIRECT_ORIGINS',
    ),
    googleClientId: readRequiredString(process.env.AUTH_GOOGLE_CLIENT_ID, 'AUTH_GOOGLE_CLIENT_ID'),
    googleClientSecret: readRequiredString(
      process.env.AUTH_GOOGLE_CLIENT_SECRET,
      'AUTH_GOOGLE_CLIENT_SECRET',
    ),
    googleRedirectUri: readRequiredString(
      process.env.AUTH_GOOGLE_REDIRECT_URI,
      'AUTH_GOOGLE_REDIRECT_URI',
    ),
    passwordSaltRounds: readRequiredPositiveInteger(
      process.env.AUTH_PASSWORD_SALT_ROUNDS,
      'AUTH_PASSWORD_SALT_ROUNDS',
    ),
    port: readRequiredPositiveInteger(process.env.AUTH_HTTP_PORT, 'AUTH_HTTP_PORT'),
    redisKeyPrefix: readRequiredString(process.env.AUTH_REDIS_KEY_PREFIX, 'AUTH_REDIS_KEY'),
    redisUrl: readRequiredString(process.env.AUTH_REDIS_URL, 'AUTH_REDIS_URL'),
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

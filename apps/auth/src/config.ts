import { config as loadDotenv } from 'dotenv';

loadDotenv();

type JwtDurationUnit = 's' | 'm' | 'h' | 'd';

export type JwtDuration = `${number}${JwtDurationUnit}`;

export interface AppConfig {
  port: number;
  coreServiceUrl: string;
  coreServiceTimeoutMs: number;
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
  jwtAccessTtl: JwtDuration;
  jwtRefreshTtl: JwtDuration;
  jwtAccessTtlSeconds: number;
  jwtRefreshTtlSeconds: number;
  bcryptSaltRounds: number;
  googleClientId: string;
  googleClientSecret: string;
  googleCallbackUrl: string;
  clientOrigin: string | null;
}

const DEFAULT_ACCESS_TTL: JwtDuration = '15m';
const DEFAULT_REFRESH_TTL: JwtDuration = '30d';

export function loadConfig(): AppConfig {
  const jwtAccessTtl = readDuration('JWT_ACCESS_TTL', DEFAULT_ACCESS_TTL);
  const jwtRefreshTtl = readDuration('JWT_REFRESH_TTL', DEFAULT_REFRESH_TTL);

  return {
    port: readNumber('AUTH_HTTP_PORT', 3002),
    coreServiceUrl: readUrl('CORE_SERVICE_URL', 'http://localhost:3001'),
    coreServiceTimeoutMs: readNumber('CORE_SERVICE_TIMEOUT_MS', 5000),
    jwtAccessSecret: readRequired('JWT_ACCESS_SECRET'),
    jwtRefreshSecret: readRequired('JWT_REFRESH_SECRET'),
    jwtAccessTtl,
    jwtRefreshTtl,
    jwtAccessTtlSeconds: parseDurationSeconds(jwtAccessTtl, 'JWT_ACCESS_TTL'),
    jwtRefreshTtlSeconds: parseDurationSeconds(jwtRefreshTtl, 'JWT_REFRESH_TTL'),
    bcryptSaltRounds: readNumber('BCRYPT_SALT_ROUNDS', 12),
    googleClientId: readRequired('GOOGLE_CLIENT_ID'),
    googleClientSecret: readRequired('GOOGLE_CLIENT_SECRET'),
    googleCallbackUrl: readRequired('GOOGLE_CALLBACK_URL'),
    clientOrigin: readOptional('CLIENT_ORIGIN'),
  };
}

function readRequired(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Environment variable ${name} is required.`);
  }

  return value;
}

function readOptional(name: string): string | null {
  const value = process.env[name]?.trim();

  if (!value) {
    return null;
  }

  return value;
}

function readString(name: string, fallback: string): string {
  const value = process.env[name]?.trim();

  return value || fallback;
}

function readDuration(name: string, fallback: JwtDuration): JwtDuration {
  const value = readString(name, fallback);

  assertDuration(value, name);

  return value;
}

function readNumber(name: string, fallback: number): number {
  const rawValue = process.env[name]?.trim();

  if (!rawValue) {
    return fallback;
  }

  const parsedValue = Number(rawValue);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`Environment variable ${name} must be a positive integer.`);
  }

  return parsedValue;
}

function readUrl(name: string, fallback?: string): string {
  const value = process.env[name]?.trim() || fallback;

  if (!value) {
    throw new Error(`Environment variable ${name} is required.`);
  }

  try {
    return new URL(value).toString().replace(/\/$/, '');
  } catch {
    throw new Error(`Environment variable ${name} must be a valid URL.`);
  }
}

function assertDuration(value: string, envName: string): asserts value is JwtDuration {
  if (!/^\d+[smhd]$/i.test(value.trim())) {
    throw new Error(
      `Environment variable ${envName} must use the format <number><s|m|h|d>, received "${value}".`,
    );
  }
}

function parseDurationSeconds(value: JwtDuration, envName: string): number {
  const matchedValue = value.trim().match(/^(\d+)([smhd])$/i);

  if (!matchedValue) {
    throw new Error(
      `Environment variable ${envName} must use the format <number><s|m|h|d>, received "${value}".`,
    );
  }

  const amount = Number(matchedValue[1]);
  const unit = matchedValue[2].toLowerCase() as JwtDurationUnit;
  const multiplierByUnit: Record<JwtDurationUnit, number> = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 60 * 60 * 24,
  };

  return amount * multiplierByUnit[unit];
}

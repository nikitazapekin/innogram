import { Client } from 'pg';

import { loadEnvironment } from '../../src/config/load-environment';

loadEnvironment();

const POSTGRES_ENV_NAMES = [
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DATABASE',
] as const;

const hasPostgresConfig = (): boolean =>
  POSTGRES_ENV_NAMES.every((name) => {
    const value = process.env[name];
    return typeof value === 'string' && value.trim().length > 0;
  });

export const dbTestsEnabled = (): boolean => process.env.TEST_DB_AVAILABLE === 'true';

export async function isDatabaseReachable(): Promise<boolean> {
  if (!hasPostgresConfig()) {
    return false;
  }

  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    connectionTimeoutMillis: 2_000,
  });

  try {
    await client.connect();
    await client.end();
    return true;
  } catch {
    return false;
  }
}

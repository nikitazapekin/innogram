import type { AppConfig } from '../config/app-config';
import { hashPassword } from './password-service';

type UserRecord = Readonly<{
  email: string;
  id: number;
  passwordHash: string;
}>;

type QueryRow = Readonly<{
  email: string;
  id: number;
  password_hash: string;
}>;

type PgClient = Readonly<{
  query: <TRow>(sql: string, params?: readonly unknown[]) => Promise<{ rows: TRow[] }>;
}>;

type PgPoolConstructor = new (options: {
  database: string;
  host: string;
  password: string;
  port: number;
  user: string;
}) => PgClient;

const readRequiredString = (value: string | undefined, envName: string): string => {
  const parsedValue = value?.trim();

  if (!parsedValue) {
    throw new Error(`Missing required environment variable: ${envName}`);
  }

  return parsedValue;
};

const readRequiredPositiveInteger = (value: string | undefined, envName: string): number => {
  const parsedValue = Number(readRequiredString(value, envName));

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`Environment variable ${envName} must be a positive integer.`);
  }

  return parsedValue;
};

const createPool = (): PgClient => {
  const { Pool } = require('../../core/node_modules/pg') as { Pool: PgPoolConstructor };

  return new Pool({
    database: readRequiredString(process.env.POSTGRES_DATABASE, 'POSTGRES_DATABASE'),
    host: readRequiredString(process.env.POSTGRES_HOST, 'POSTGRES_HOST'),
    password: readRequiredString(process.env.POSTGRES_PASSWORD, 'POSTGRES_PASSWORD'),
    port: readRequiredPositiveInteger(process.env.POSTGRES_PORT, 'POSTGRES_PORT'),
    user: readRequiredString(process.env.POSTGRES_USER, 'POSTGRES_USER'),
  });
};

const pool = createPool();

const mapUserRow = (row: QueryRow): UserRecord => ({
  email: row.email,
  id: row.id,
  passwordHash: row.password_hash,
});

export const findUserByEmail = async (email: string): Promise<UserRecord | null> => {
  const result = await pool.query<QueryRow>(
    'SELECT id, email, password_hash FROM auth."user" WHERE email = $1 LIMIT 1',
    [email],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapUserRow(result.rows[0]);
};

export const createUser = async (
  email: string,
  password: string,
  config: AppConfig,
): Promise<UserRecord> => {
  const passwordHash = await hashPassword(password, config);
  const result = await pool.query<QueryRow>(
    'INSERT INTO auth."user" (email, password_hash) VALUES ($1, $2) RETURNING id, email, password_hash',
    [email, passwordHash],
  );

  return mapUserRow(result.rows[0]);
};

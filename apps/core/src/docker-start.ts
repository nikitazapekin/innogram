import './config/load-environment';

import { AppDataSource } from './data-source';

const SHOULD_RUN_MIGRATIONS = process.env.RUN_MIGRATIONS?.toLowerCase() === 'true';
const MAX_RETRIES = 30;
const RETRY_DELAY_MS = 2000;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function hasMigrationHistory(): Promise<boolean> {
  const tableCheck = await AppDataSource.query<{ exists: boolean }[]>(
    `SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'migrations'
    ) AS exists`,
  );

  if (!tableCheck[0]?.exists) {
    return false;
  }

  const countResult = await AppDataSource.query<{ count: number }[]>(
    `SELECT COUNT(*)::int AS count FROM public.migrations`,
  );

  return (countResult[0]?.count ?? 0) > 0;
}

async function prepareDatabase() {
  if (!SHOULD_RUN_MIGRATIONS) {
    return;
  }

  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Attempting to connect to database (attempt ${attempt}/${MAX_RETRIES})...`);
      await AppDataSource.initialize();
      console.log('Database connection established.');

      try {
        await AppDataSource.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
        await AppDataSource.query('CREATE SCHEMA IF NOT EXISTS "auth"');
        await AppDataSource.query('CREATE SCHEMA IF NOT EXISTS "main"');
        await AppDataSource.query('CREATE SCHEMA IF NOT EXISTS "notification"');

        if (await hasMigrationHistory()) {
          await AppDataSource.runMigrations();
          console.log('Migrations completed.');
        } else {
          console.log('No migration history found — synchronizing schema from entities.');
          await AppDataSource.synchronize();
          console.log('Schema synchronization completed.');
        }
      } finally {
        await AppDataSource.destroy();
      }

      return;
    } catch (error) {
      lastError = error;
      console.error(`Database connection failed (attempt ${attempt}/${MAX_RETRIES}):`, error);

      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS);
      }
    }
  }

  throw new Error(`Failed to connect to database after ${MAX_RETRIES} attempts: ${lastError}`);
}

async function start() {
  await prepareDatabase();
  await import('./main.js');
}

void start().catch((error: unknown) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});

import { AppDataSource } from './data-source';
const SHOULD_RUN_MIGRATIONS = process.env.RUN_MIGRATIONS?.toLowerCase() === 'true';

async function prepareDatabase() {
  if (!SHOULD_RUN_MIGRATIONS) {
    return;
  }

  await AppDataSource.initialize();

  try {
    await AppDataSource.query('CREATE SCHEMA IF NOT EXISTS "auth"');
    await AppDataSource.query('CREATE SCHEMA IF NOT EXISTS "main"');
    await AppDataSource.query('CREATE SCHEMA IF NOT EXISTS "notification"');
    await AppDataSource.runMigrations();
  } finally {
    await AppDataSource.destroy();
  }
}

async function start() {
  await prepareDatabase();
  await import('./main.js');
}

void start().catch((error: unknown) => {
  process.exit(1);
});

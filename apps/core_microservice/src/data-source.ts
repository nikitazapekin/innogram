import { existsSync } from 'fs';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';

const envPaths = [`${process.cwd()}/.env`, `${process.cwd()}/../../.env`];
const envPath = envPaths.find((path) => existsSync(path));

if (envPath) {
  config({ path: envPath });
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  entities: [`${__dirname}/entities/*.entity{.ts,.js}`],
  migrations: [`${__dirname}/database/migrations/*{.ts,.js}`],
});

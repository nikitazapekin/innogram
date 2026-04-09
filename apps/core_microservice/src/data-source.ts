import { DataSource } from 'typeorm';
import { CreateDatabaseSchemas1775563921060 } from './database/migrations/1775563921060-CreateDatabaseSchemas';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  entities: ['src/entities/*.entity.ts', 'src/entities/*.entity.js'],
  migrations: [CreateDatabaseSchemas1775563921060],
});

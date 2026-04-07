import 'reflect-metadata';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

const databaseConfig: PostgresConnectionOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
  username: process.env.POSTGRES_USER ?? 'postgres',
  password: process.env.POSTGRES_PASSWORD ?? 'postgres',
  database: process.env.POSTGRES_DATABASE ?? 'innogram',
};

export const typeOrmConfig: TypeOrmModuleOptions = {
  ...databaseConfig,
  autoLoadEntities: true,
  synchronize: false,
};

export default new DataSource({
  ...databaseConfig,
  migrations: ['src/database/migrations/*.ts'],
});

import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { ConfigService } from './config.service';

@Injectable()
export class DatabaseConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  private createDatabaseConfig(): PostgresConnectionOptions {
    return {
      type: 'postgres',
      host: this.configService.getOrThrow('POSTGRES_HOST'),
      port: Number(this.configService.getOrThrow('POSTGRES_PORT')),
      username: this.configService.getOrThrow('POSTGRES_USER'),
      password: this.configService.getOrThrow('POSTGRES_PASSWORD'),
      database: this.configService.getOrThrow('POSTGRES_DATABASE'),
    };
  }

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      ...this.createDatabaseConfig(),
      autoLoadEntities: true,
      synchronize: false,
    };
  }

  createDataSourceOptions(): PostgresConnectionOptions & { migrations: string[] } {
    return {
      ...this.createDatabaseConfig(),
      migrations: ['src/database/migrations/*.ts'],
    };
  }
}

const databaseConfigService = new DatabaseConfigService(new ConfigService());

export default new DataSource(databaseConfigService.createDataSourceOptions());

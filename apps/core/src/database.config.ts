import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function buildTypeOrmOptions(configService: ConfigService): TypeOrmModuleOptions {
  const isDev = configService.get('NODE_ENV') !== 'production';

  return {
    type: 'postgres',
    host: configService.getOrThrow('POSTGRES_HOST'),
    port: Number(configService.getOrThrow('POSTGRES_PORT')),
    username: configService.getOrThrow('POSTGRES_USER'),
    password: configService.getOrThrow('POSTGRES_PASSWORD'),
    database: configService.getOrThrow('POSTGRES_DATABASE'),
    autoLoadEntities: true,
    synchronize: false,
    logging: isDev ? ['query', 'error', 'warn'] : ['error'],
    maxQueryExecutionTime: isDev ? 100 : undefined,
  };
}

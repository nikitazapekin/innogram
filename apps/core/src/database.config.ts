import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

import { PerformanceMonitorService } from './monitoring/performance-monitor.service';
import { TypeOrmPerformanceLogger } from './monitoring/typeorm-performance.logger';

export function buildTypeOrmOptions(
  configService: ConfigService,
  performanceMonitor?: PerformanceMonitorService,
): TypeOrmModuleOptions {
  const slowQueryThresholdMs = Number(configService.get('SLOW_QUERY_THRESHOLD_MS') ?? 100);

  return {
    type: 'postgres',
    host: configService.getOrThrow('POSTGRES_HOST'),
    port: Number(configService.getOrThrow('POSTGRES_PORT')),
    username: configService.getOrThrow('POSTGRES_USER'),
    password: configService.getOrThrow('POSTGRES_PASSWORD'),
    database: configService.getOrThrow('POSTGRES_DATABASE'),
    autoLoadEntities: true,
    synchronize: false,
    logging: performanceMonitor ? ['error', 'warn'] : ['error'],
    maxQueryExecutionTime: slowQueryThresholdMs,
    logger: performanceMonitor ? new TypeOrmPerformanceLogger(performanceMonitor) : undefined,
  };
}

@Injectable()
export class DatabaseConfigService implements TypeOrmOptionsFactory {
  constructor(
    private readonly configService: ConfigService,
    private readonly performanceMonitor?: PerformanceMonitorService,
  ) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return buildTypeOrmOptions(this.configService, this.performanceMonitor);
  }
}

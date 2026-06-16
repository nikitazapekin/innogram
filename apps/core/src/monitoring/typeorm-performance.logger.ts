import { Logger as TypeOrmLogger } from 'typeorm';

import { PerformanceMonitorService } from './performance-monitor.service';

const SLOW_QUERY_THRESHOLD_MS = Number(process.env.SLOW_QUERY_THRESHOLD_MS ?? 100);

export class TypeOrmPerformanceLogger implements TypeOrmLogger {
  constructor(private readonly performanceMonitor: PerformanceMonitorService) {}

  logQuerySlow(time: number, query: string): void {
    if (time >= SLOW_QUERY_THRESHOLD_MS) {
      this.performanceMonitor.recordSlowQuery(time, query);
    }
  }

  logQueryError(): void {
    return undefined;
  }

  logQuery(): void {
    return undefined;
  }

  logSchemaBuild(): void {
    return undefined;
  }

  logMigration(): void {
    return undefined;
  }

  log(): void {
    return undefined;
  }
}

import { Injectable } from '@nestjs/common';
import * as os from 'node:os';

export type SlowQueryRecord = {
  durationMs: number;
  query: string;
  recordedAt: string;
};

export type PerformanceMetricsSnapshot = {
  requests: {
    total: number;
    errors: number;
    errorRate: number;
    averageResponseTimeMs: number;
  };
  system: {
    cpuUsagePercent: number;
    memoryUsedMb: number;
    memoryTotalMb: number;
    memoryUsagePercent: number;
  };
  slowQueries: SlowQueryRecord[];
  collectedAt: string;
};

const MAX_SLOW_QUERIES = 50;

@Injectable()
export class PerformanceMonitorService {
  private requestCount = 0;
  private errorCount = 0;
  private totalResponseTimeMs = 0;
  private readonly slowQueries: SlowQueryRecord[] = [];

  recordRequest(status: number, durationMs: number): void {
    this.requestCount += 1;
    this.totalResponseTimeMs += durationMs;

    if (status >= 400) {
      this.errorCount += 1;
    }
  }

  recordSlowQuery(durationMs: number, query: string): void {
    this.slowQueries.unshift({
      durationMs,
      query,
      recordedAt: new Date().toISOString(),
    });

    if (this.slowQueries.length > MAX_SLOW_QUERIES) {
      this.slowQueries.length = MAX_SLOW_QUERIES;
    }
  }

  getSnapshot(): PerformanceMetricsSnapshot {
    const memory = process.memoryUsage();
    const memoryUsedMb = Math.round((memory.rss / 1024 / 1024) * 100) / 100;
    const memoryTotalMb = Math.round((os.totalmem() / 1024 / 1024) * 100) / 100;
    const averageResponseTimeMs =
      this.requestCount === 0
        ? 0
        : Math.round((this.totalResponseTimeMs / this.requestCount) * 100) / 100;

    return {
      requests: {
        total: this.requestCount,
        errors: this.errorCount,
        errorRate:
          this.requestCount === 0
            ? 0
            : Math.round((this.errorCount / this.requestCount) * 10_000) / 100,
        averageResponseTimeMs,
      },
      system: {
        cpuUsagePercent: this.readCpuUsagePercent(),
        memoryUsedMb,
        memoryTotalMb,
        memoryUsagePercent:
          memoryTotalMb === 0 ? 0 : Math.round((memoryUsedMb / memoryTotalMb) * 10_000) / 100,
      },
      slowQueries: [...this.slowQueries],
      collectedAt: new Date().toISOString(),
    };
  }

  private readCpuUsagePercent(): number {
    const cpus = os.cpus();

    if (cpus.length === 0) {
      return 0;
    }

    const totals = cpus.reduce(
      (accumulator, cpu) => {
        const total = Object.values(cpu.times).reduce((sum, value) => sum + value, 0);
        const idle = cpu.times.idle;

        return {
          total: accumulator.total + total,
          idle: accumulator.idle + idle,
        };
      },
      { total: 0, idle: 0 },
    );

    if (totals.total === 0) {
      return 0;
    }

    const usage = ((totals.total - totals.idle) / totals.total) * 100;

    return Math.round(usage * 100) / 100;
  }
}

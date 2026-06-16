import { CORE_API_URL } from '@/app/shared/config/api';

export type PerformanceMetrics = {
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
  slowQueries: Array<{
    durationMs: number;
    query: string;
    recordedAt: string;
  }>;
  collectedAt: string;
};

export async function getPerformanceMetrics(): Promise<PerformanceMetrics> {
  const response = await fetch(`${CORE_API_URL}/monitoring/metrics`);

  if (!response.ok) {
    throw new Error('Не удалось загрузить метрики');
  }

  return response.json();
}

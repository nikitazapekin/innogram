'use client';

import { useQuery } from '@tanstack/react-query';
import styles from './PerformanceMonitor.module.scss';
import { getPerformanceMetrics } from '@/app/shared/api/monitoring';

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

function formatMs(value: number): string {
  return `${value.toFixed(2)} ms`;
}

export function PerformanceMonitor() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['performance-metrics'],
    queryFn: getPerformanceMetrics,
    refetchInterval: 5000,
  });

  if (isLoading) {
    return <p className={styles.empty}>Загрузка метрик...</p>;
  }

  if (isError || !data) {
    return (
      <div className={styles.page}>
        <p className={styles.empty}>Не удалось загрузить метрики performance monitor.</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Performance Monitor</h1>
          <p className={styles.subtitle}>
            Обновлено: {new Date(data.collectedAt).toLocaleString('ru-RU')}
          </p>
        </div>
        <button
          className={styles.refresh}
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          {isFetching ? 'Обновление...' : 'Обновить'}
        </button>
      </header>

      <section className={styles.grid}>
        <article className={styles.card}>
          <h2 className={styles.cardTitle}>Response time</h2>
          <p className={styles.metricValue}>{formatMs(data.requests.averageResponseTimeMs)}</p>
          <p className={styles.metricHint}>Среднее время ответа HTTP</p>
        </article>

        <article className={styles.card}>
          <h2 className={styles.cardTitle}>Error rate</h2>
          <p className={styles.metricValue}>{formatPercent(data.requests.errorRate)}</p>
          <p className={styles.metricHint}>
            {data.requests.errors} ошибок из {data.requests.total} запросов
          </p>
        </article>

        <article className={styles.card}>
          <h2 className={styles.cardTitle}>Количество запросов</h2>
          <p className={styles.metricValue}>{data.requests.total}</p>
          <p className={styles.metricHint}>Всего HTTP-запросов с момента старта core</p>
        </article>

        <article className={styles.card}>
          <h2 className={styles.cardTitle}>CPU / RAM</h2>
          <p className={styles.metricValue}>{formatPercent(data.system.cpuUsagePercent)}</p>
          <p className={styles.metricHint}>
            CPU usage · RAM {data.system.memoryUsedMb} / {data.system.memoryTotalMb} MB (
            {formatPercent(data.system.memoryUsagePercent)})
          </p>
        </article>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Медленные запросы к БД</h2>
        {data.slowQueries.length === 0 ? (
          <p className={styles.empty}>Медленных SQL-запросов пока нет</p>
        ) : (
          <div className={styles.queryList}>
            {data.slowQueries.map((query, index) => (
              <article key={`${query.recordedAt}-${index}`} className={styles.queryItem}>
                <div className={styles.queryMeta}>
                  <span>{formatMs(query.durationMs)}</span>
                  <time>{new Date(query.recordedAt).toLocaleString('ru-RU')}</time>
                </div>
                <pre className={styles.queryText}>{query.query}</pre>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

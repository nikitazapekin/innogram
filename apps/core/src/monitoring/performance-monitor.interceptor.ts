import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { RequestLike, ResponseLike } from '../common/types';
import { PerformanceMonitorService } from './performance-monitor.service';

const REQUEST_ID_HEADERS = ['x-request-id', 'x-correlation-id'] as const;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

@Injectable()
export class PerformanceMonitorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceMonitorInterceptor.name);

  constructor(private readonly performanceMonitor: PerformanceMonitorService) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const startedAt = performance.now();
    const request = context.switchToHttp().getRequest<RequestLike>();
    const response = context.switchToHttp().getResponse<ResponseLike>();
    const { method, url } = request;
    const requestId = this.findRequestId(request);

    return next.handle().pipe(
      tap(() => {
        const status = response.statusCode ?? 200;
        const duration = performance.now() - startedAt;

        this.performanceMonitor.recordRequest(status, duration);
        this.log(status, method, url, requestId, duration);
      }),
      catchError((err) => {
        const status = response.statusCode ?? 500;
        const duration = performance.now() - startedAt;

        this.performanceMonitor.recordRequest(status, duration);
        this.log(status, method, url, requestId, duration);

        return throwError(() => err);
      }),
    );
  }

  private log(
    status: number,
    method: string,
    url: string,
    requestId: string | undefined,
    duration: number,
  ): void {
    const meta: Record<string, unknown> = {
      method,
      url,
      status,
      duration: Math.round(duration * 100) / 100,
    };

    if (requestId) {
      meta.requestId = requestId;
    }

    if (status >= 500) {
      this.logger.error(meta);
    } else if (status >= 400) {
      this.logger.warn(meta);
    } else {
      this.logger.log(meta);
    }
  }

  private findRequestId(request: RequestLike): string | undefined {
    const fromProps = request.requestId || request.id || request.correlationId;

    if (fromProps) {
      return fromProps;
    }

    for (const headerName of REQUEST_ID_HEADERS) {
      const headerValue = request.headers[headerName];

      if (isNonEmptyString(headerValue)) {
        return headerValue;
      }

      if (Array.isArray(headerValue)) {
        const nonEmptyItem = headerValue.find(isNonEmptyString);

        if (nonEmptyItem) {
          return nonEmptyItem;
        }
      }
    }

    return undefined;
  }
}

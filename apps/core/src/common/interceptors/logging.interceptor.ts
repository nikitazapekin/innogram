import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { RequestLike, ResponseLike } from '../types';

const REQUEST_ID_HEADERS = ['x-request-id', 'x-correlation-id'] as const;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler) {
    const startedAt = performance.now();
    const request = context.switchToHttp().getRequest<RequestLike>();
    const response = context.switchToHttp().getResponse<ResponseLike>();
    const { method, url } = request;
    const requestId = this.findRequestId(request);

    return next.handle().pipe(
      tap(() => {
        this.log(response.statusCode ?? 200, method, url, requestId, Date.now() - startedAt);
      }),
      catchError((err) => {
        this.log(response.statusCode ?? 500, method, url, requestId, Date.now() - startedAt);

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
    const meta: Record<string, unknown> = { method, url, status, duration };

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

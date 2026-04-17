import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { tap } from 'rxjs';
import { RequestLike, ResponseLike } from '../types';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler) {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const startedAt = Date.now();
    const http = context.switchToHttp();
    const { method, url } = http.getRequest<RequestLike>();
    const response = http.getResponse<ResponseLike>();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startedAt;

        this.logger.log(`HTTP log: ${method} ${url} ${response.statusCode} ${duration}ms`);
      }),
    );
  }
}

import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { tap } from 'rxjs';
import { RequestLike, ResponseLike } from '../types';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler) {
    const startedAt = Date.now();
    const http = context.switchToHttp();
    const request = http.getRequest<RequestLike>();
    const response = http.getResponse<ResponseLike>();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startedAt;

        this.logger.log(`${request.method} ${request.url} ${response.statusCode} ${duration}ms`);
      }),
    );
  }
}

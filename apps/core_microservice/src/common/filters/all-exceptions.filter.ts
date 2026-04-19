import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ResponseLike, RequestLike, ExceptionResponseBody } from '../types';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<ResponseLike>();
    const request = ctx.getRequest<RequestLike>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : null;
    const exceptionBody = this.getExceptionResponseBody(exceptionResponse);
    const message = this.getMessage(exceptionResponse, exceptionBody);
    const error = this.getError(exception, exceptionBody);

    const logMessage = `${request.method} ${request.url} ${status}`;

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(logMessage, exception instanceof Error ? exception.stack : undefined);
    } else {
      this.logger.warn(logMessage);
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date(),
      path: request.url,
      error,
      message,
    });
  }

  private getExceptionResponseBody(response: unknown): ExceptionResponseBody | null {
    if (typeof response !== 'object' || response === null) {
      return null;
    }

    return response as ExceptionResponseBody;
  }

  private getMessage(
    response: unknown,
    exceptionBody: ExceptionResponseBody | null,
  ): string | string[] {
    if (typeof response === 'string') {
      return response;
    }

    if (Array.isArray(exceptionBody?.message)) {
      return exceptionBody.message;
    }

    if (typeof exceptionBody?.message === 'string') {
      return exceptionBody.message;
    }

    return 'Internal server error';
  }

  private getError(exception: unknown, exceptionBody: ExceptionResponseBody | null): string {
    if (exceptionBody?.error !== undefined) {
      return String(exceptionBody.error);
    }

    if (exception instanceof HttpException) {
      return exception.name;
    }

    return 'InternalServerError';
  }
}

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { INTERNAL_ERROR_CODE, INTERNAL_ERROR_MESSAGE, REQUEST_ID_HEADER_NAMES } from '../constants';
import { ResponseLike, RequestLike, ExceptionResponseBody, NormalizedException } from '../types';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const response = http.getResponse<ResponseLike>();
    const request = http.getRequest<RequestLike>();
    const normalized = this.normalizeException(exception);
    const path = request.originalUrl ?? request.url;
    const requestId = this.getRequestId(request);

    this.logException(normalized, request.method, path, requestId);

    response.status(normalized.status).json({
      success: false,
      timestamp: new Date(),
      path,
      ...(requestId ? { requestId } : {}),
      error: {
        code: normalized.code,
        message: normalized.message,
        ...(normalized.details !== undefined ? { details: normalized.details } : {}),
      },
    });
  }

  private getExceptionResponseBody(response: unknown): ExceptionResponseBody | null {
    if (!this.isRecord(response)) {
      return null;
    }

    return response as ExceptionResponseBody;
  }

  private normalizeException(exception: unknown): NormalizedException {
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : exception;
    const exceptionBody = this.getExceptionResponseBody(exceptionResponse);

    return {
      status: this.getStatus(exception, exceptionBody),
      code: this.getCode(exception, exceptionBody),
      message: this.getMessage(exceptionResponse, exceptionBody),
      details: this.getDetails(exception, exceptionBody),
    };
  }

  private getStatus(exception: unknown, exceptionBody: ExceptionResponseBody | null): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    const statusCandidate = exceptionBody?.statusCode ?? exceptionBody?.status;

    return this.isHttpStatus(statusCandidate) ? statusCandidate : HttpStatus.INTERNAL_SERVER_ERROR;
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

    if (typeof exceptionBody?.message === 'string' && exceptionBody.message.trim()) {
      return exceptionBody.message;
    }

    return INTERNAL_ERROR_MESSAGE;
  }

  private getCode(exception: unknown, exceptionBody: ExceptionResponseBody | null): string {
    if (typeof exceptionBody?.code === 'string' && exceptionBody.code.trim()) {
      return exceptionBody.code;
    }

    if (exception instanceof HttpException) {
      return exception.name;
    }

    if (exception instanceof Error && exception.name !== 'Error') {
      return exception.name;
    }

    if (this.isRecord(exception) && typeof exception.code === 'string' && exception.code.trim()) {
      return exception.code;
    }

    if (typeof exceptionBody?.error === 'string' && exceptionBody.error.trim()) {
      return exceptionBody.error;
    }

    return INTERNAL_ERROR_CODE;
  }

  private getDetails(exception: unknown, exceptionBody: ExceptionResponseBody | null): unknown {
    if (exceptionBody?.details !== undefined) {
      return exceptionBody.details;
    }

    if (this.isRecord(exception) && exception.details !== undefined) {
      return exception.details;
    }

    return undefined;
  }

  private logException(
    normalized: NormalizedException,
    method: string,
    path: string,
    requestId?: string,
  ): void {
    const logLine = JSON.stringify({
      method,
      path,
      status: normalized.status,
      code: normalized.code,
      message: normalized.message,
      ...(requestId ? { requestId } : {}),
    });

    if (normalized.status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(logLine);

      return;
    }

    this.logger.warn(logLine);
  }

  private getRequestId(request: RequestLike): string | undefined {
    return (
      request.requestId ??
      request.id ??
      request.correlationId ??
      this.getHeaderValue(request.headers, REQUEST_ID_HEADER_NAMES)
    );
  }

  private getHeaderValue(
    headers: RequestLike['headers'],
    names: readonly string[],
  ): string | undefined {
    if (!headers) {
      return undefined;
    }

    for (const name of names) {
      const value = headers[name];

      if (typeof value === 'string' && value.trim()) {
        return value;
      }

      if (Array.isArray(value)) {
        const firstValue = value.find((item) => typeof item === 'string' && item.trim());

        if (firstValue) {
          return firstValue;
        }
      }
    }

    return undefined;
  }

  private isHttpStatus(value: unknown): value is number {
    return typeof value === 'number' && value >= 400 && value <= 599;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}

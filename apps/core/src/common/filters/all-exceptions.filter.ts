import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import * as Sentry from '@sentry/node';

import { RequestLike, ResponseLike, ExceptionResponseBody, NormalizedException } from '../types';

const INTERNAL_ERROR_MESSAGE = 'Internal server error';
const INTERNAL_ERROR_CODE = 'internal_server_error';
const REQUEST_ID_HEADERS = ['x-request-id', 'x-correlation-id'];

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const response = this.getResponse(http.getResponse());
    const request = this.getRequest(http.getRequest());
    const normalized = this.normalizeException(exception);
    const path = request.originalUrl ?? request.url;
    const requestId = this.findRequestId(request);

    this.log(normalized, request.method, path, requestId);

    if (normalized.status >= HttpStatus.INTERNAL_SERVER_ERROR && exception instanceof Error) {
      Sentry.captureException(exception);
    }

    this.sendResponse(response, normalized, path, requestId);
  }

  private normalizeException(exception: unknown): NormalizedException {
    let raw: unknown = exception;

    if (exception instanceof HttpException) {
      raw = exception.getResponse();
    }

    const body = this.extractBody(raw);

    return {
      status: this.resolveStatus(exception, body),
      code: this.resolveCode(exception, body),
      message: this.resolveMessage(raw, body),
      details: body?.details,
    };
  }

  private extractBody(response: unknown): ExceptionResponseBody | null {
    if (this.isExceptionResponseBody(response)) {
      return response;
    }

    return null;
  }

  private resolveStatus(exception: unknown, body: ExceptionResponseBody | null): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    if (body !== null) {
      const statusCode = body.statusCode;

      if (this.isHttpStatus(statusCode)) {
        return statusCode;
      }

      const status = body.status;

      if (this.isHttpStatus(status)) {
        return status;
      }
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private resolveMessage(response: unknown, body: ExceptionResponseBody | null): string | string[] {
    if (typeof response === 'string') {
      return response;
    }

    if (Array.isArray(body?.message)) {
      return body.message;
    }

    if (this.isValidMessage(body)) {
      return body.message;
    }

    return INTERNAL_ERROR_MESSAGE;
  }

  private resolveCode(exception: unknown, body: ExceptionResponseBody | null): string {
    if (body !== null) {
      const code = body.code;

      if (typeof code === 'string' && code.trim().length > 0) {
        return code;
      }
    }

    if (exception instanceof HttpException) {
      return exception.name;
    }

    const isNamedError = exception instanceof Error && exception.name !== 'Error';

    if (isNamedError) {
      return exception.name;
    }

    if (this.hasCodeProperty(exception)) {
      const code = exception['code'];

      if (typeof code === 'string' && code.trim().length > 0) {
        return code;
      }
    }

    if (body !== null) {
      const error = body.error;

      if (typeof error === 'string' && error.trim().length > 0) {
        return error;
      }
    }

    return INTERNAL_ERROR_CODE;
  }

  private findRequestId(request: RequestLike): string | undefined {
    const id = request.requestId || request.id || request.correlationId;

    if (id) {
      return id;
    }

    return this.findHeader(request.headers, REQUEST_ID_HEADERS);
  }

  private findHeader(
    headers: RequestLike['headers'],
    names: readonly string[],
  ): string | undefined {
    for (const name of names) {
      const value = headers[name];

      const isValidString = typeof value === 'string' && value.trim().length > 0;

      if (isValidString) {
        return value;
      }

      if (Array.isArray(value)) {
        const found = value.find((item) => typeof item === 'string' && item.trim().length > 0);

        return found;
      }
    }

    return undefined;
  }

  private log(
    { status, code, message }: NormalizedException,
    method: string,
    path: string,
    requestId?: string,
  ): void {
    const meta: Record<string, unknown> = { method, path, status, code, message };

    if (requestId) {
      meta.requestId = requestId;
    }

    const log = JSON.stringify(meta);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(log);
    } else {
      this.logger.warn(log);
    }
  }

  private sendResponse(
    response: ResponseLike,
    { status, code, message, details }: NormalizedException,
    path: string,
    requestId?: string,
  ): void {
    const error: Record<string, unknown> = { code, message };

    if (details) {
      error.details = details;
    }

    const body: Record<string, unknown> = {
      success: false,
      timestamp: new Date(),
      path,
      error,
    };

    if (requestId) {
      body.requestId = requestId;
    }

    response.status(status).json(body);
  }

  private isHttpStatus(value: unknown): value is number {
    return typeof value === 'number' && value >= 400 && value <= 599;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private getRequest(value: unknown): RequestLike {
    if (this.isRequestLike(value)) {
      return value;
    }

    return {
      method: 'UNKNOWN',
      url: '',
      headers: {},
    };
  }

  private getResponse(value: unknown): ResponseLike {
    if (this.isResponseLike(value)) {
      return value;
    }

    return {
      status: () => this.getFallbackResponse(),
      json: () => undefined,
    };
  }

  private getFallbackResponse(): ResponseLike {
    return {
      status: () => this.getFallbackResponse(),
      json: () => undefined,
    };
  }

  private isExceptionResponseBody(value: unknown): value is ExceptionResponseBody {
    if (!this.isRecord(value)) {
      return false;
    }

    return 'statusCode' in value || 'message' in value || 'error' in value;
  }

  private isRequestLike(value: unknown): value is RequestLike {
    if (!this.isRecord(value)) {
      return false;
    }

    return (
      typeof value.method === 'string' &&
      typeof value.url === 'string' &&
      this.isRecord(value.headers)
    );
  }

  private isResponseLike(value: unknown): value is ResponseLike {
    if (!this.isRecord(value)) {
      return false;
    }

    return typeof value.status === 'function' && typeof value.json === 'function';
  }

  private hasCodeProperty(value: unknown): value is { code: unknown } {
    return value !== null && typeof value === 'object' && 'code' in value;
  }

  private isValidMessage(
    body: ExceptionResponseBody | null,
  ): body is ExceptionResponseBody & { message: string } {
    return body !== null && typeof body.message === 'string' && body.message.trim().length > 0;
  }
}
